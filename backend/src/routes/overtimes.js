import express, { json } from 'express';
import db from '../../modules/db.js';
import getTable from '../../modules/getTable.js';
import insertRow from '../../modules/insertRow.js';

const route = express.Router();

route.get(['/', '/:limitparam'], async (req, res) => {
    const { limitparam } = req.params;

    if (!limitparam) {
        const overtimes = await getTable('overtimes', { sortColumn: 'date', sortOrder: 'DESC' });

        const mappedOvertimes = overtimes.map(overtime => ({
            ...overtime,
            employees: JSON.parse(overtime.employees)
        }));

        return res.json(mappedOvertimes);
    } else {
        const limit = parseInt(limitparam);
        if (!isNaN(limit)) {
            const overtimes = await getTable('overtimes', { limit, sortColumn: 'date', sortOrder: 'DESC' });

            const mappedOvertimes = overtimes.map(overtime => ({
                ...overtime,
                employees: JSON.parse(overtime.employees)
            }));

            return res.status(200).json(mappedOvertimes);
        } else {
            return res.status(400).json({ error: 'Invalid limit parameter' });
        }
    }
});

route.post('/', async (req, res) => {
    const createdDate = new Date();
    if (!createdDate) return res.status(400).json({ error: 'No date' });
    const lastOvertime = (await getTable('overtimes', {limit: 1, sortColumn: 'date', sortOrder: 'DESC'}))[0];
    const everyEmployees = await getTable('employees');
    const mappedLastOvertime = {
        ...lastOvertime,
        employees: JSON.parse(lastOvertime.employees)
    };
    const sortedEmployeesPriority = mappedLastOvertime.employees.sort((a, b) => {
        if (a.status === 'inconnu') {
            return -1;
        } else if (b.status === 'inconnu') {
            return 1;
        } else {
            return 0;
        }
    });

    const existingEmployeeIds = everyEmployees.map(employee => employee.id);
    const filteredEmployees = sortedEmployeesPriority.filter(employee => existingEmployeeIds.includes(employee.id));

    const newEmployeeIds = filteredEmployees.map(employee => employee.id);
    const newEmployees = everyEmployees.filter(employee => !newEmployeeIds.includes(employee.id));
    const updatedEmployees = [...filteredEmployees, ...newEmployees];

    const newEmployeesPriority = updatedEmployees.map((employee, index) => ({
        ...employee,
        priority: index + 1,
        status: 'inconnu'
    }));
    
    const goneThru = await insertRow('overtimes', {date: createdDate.toISOString(), employees: JSON.stringify(newEmployeesPriority), opened: true, currentPriority: 1});
    
    if (!goneThru) return res.status(500).json({ error: 'Error while inserting row' });
    else return res.status(200).json({message: "Table created"});
});

route.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'No id' });
    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count, opened FROM overtimes WHERE rowid = ?', [numberId], async (err, row) => {
            if (err) return res.status(500).json({ error: 'Error while deleting row' });
            else if (row.count === 0) return res.status(404).json({ error: 'Row not found' });
            else if (!row.opened) return res.status(400).json({ error: 'Row is closed' });
            
            db.run('DELETE FROM overtimes WHERE rowid = ? AND opened = ?', [numberId, true], async (err) => {
                if (err) return res.status(500).json({ error: 'Error while deleting row' });
                else return res.status(200).json({ message: 'Row deleted successfully' });
            });
        });
    });
});

route.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { employee } = req.body;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    if (!employee || !employee.id || !employee.status) {
        return res.status(400).json({ error: 'Invalid employee data' });
    }

    db.serialize(() => {
        db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], async (err, overtime) => {
            if (err) return res.status(500).json({ error: 'Error while retrieving overtime' });
            if (!overtime) return res.status(404).json({ error: 'Row not found' });
            if (!overtime.opened) return res.status(400).json({ error: 'Row is closed' });
            const employees = JSON.parse(overtime.employees);
            const employeeIndex = employees.findIndex((emp) => emp.id === employee.id);

            if (employeeIndex === -1) return res.status(400).json({ error: 'Employee not found' });

            if (employees[employeeIndex].priority != overtime.currentPriority) {
                return res.status(400).json({ error: 'Employee priority is not the current priority' });
            }

            const updatedEmployees = employees.map((emp) => {
                if (emp.id === employee.id) return { ...emp, status: employee.status };
                return emp;
            });

            const updateQuery = `UPDATE overtimes SET employees = ? WHERE rowid = ?`;
            db.run(updateQuery, [JSON.stringify(updatedEmployees), numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while updating employee priority' });
                }
                db.run('UPDATE overtimes SET currentPriority = currentPriority + 1 WHERE rowid = ?', [numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while updating employee priority' });
                    }
                });
                return res.status(200).json({ message: 'Employee priority updated successfully' });
            });
        });
    });
});

route.patch('/:id/close', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            db.run('UPDATE overtimes SET opened = 0 WHERE rowid = ?', [numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while closing overtime' });
                }
                return res.status(200).json({ message: 'Overtime closed successfully' });
            });
        });
    });
    console.log(await getTable('overtimes'));
});

route.post('/employees/update/:id', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count, * FROM overtimes WHERE rowid = ?', [numberId], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            const allEmployees = await getTable('employees');

            const currentEmployees = JSON.parse(row.employees).sort((a, b) => a.priority - b.priority);
            const currentEmployeesIds = currentEmployees.map((employee) => employee.id);

            const newEmployees = allEmployees.filter((employee) => !currentEmployeesIds.includes(employee.id));
            const updatedEmployees = [...currentEmployees, ...newEmployees].map((employee, index) => ({
                ...employee,
                name: employee.name,
                priority: index + 1,
                status: 'inconnu'
            }));
            
            db.run('UPDATE overtimes SET employees = ? WHERE rowid = ?', [JSON.stringify(updatedEmployees), numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while updating employees' });
                }
                return res.status(200).json({ message: 'Employees updated successfully' });
            });
        });
    });
});

export default route;
