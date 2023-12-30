import express, { json } from 'express';
import { db } from '../modules/initDatabase.js';
import { DatabaseError } from '../modules/Database.js';
import EmployeeOvertime from '../models/employeeOvertimeInterface.js';

const route = express.Router();

route.get(['/', '/:limitparam'], async (req, res) => {
  const { limitparam } = req.params;
  if (!limitparam) {
    const overtimes = await db.getTable('overtimes', undefined, { columnName: 'date', sortType: 'DESC'});
    if ((overtimes as DatabaseError).error) {
      console.trace((overtimes as DatabaseError).message);
      return res.status(500).json({ error: 'Database Error'});
    }
    return res.status(200).json(overtimes);
  }

  const limit = parseInt(limitparam);
  if (isNaN(limit)) return res.status(400).json({ error: 'Invalid limit parameter'});

  const overtimes = await db.getTable('overtimes', undefined, { columnName: 'date', sortType: 'DESC' }, limit);
  if ((overtimes as DatabaseError).error) {
    console.trace((overtimes as DatabaseError).message);
    return res.status(500).json({ error: 'Database Error'});
  }
  return res.status(200).json(overtimes);
});

route.post('/create', async (req, res) => {
  const dbResponse = await db.getTable('overtimes', undefined, { columnName: 'date', sortType: 'DESC'}, 1);
  if ((dbResponse as DatabaseError).error) {
    console.trace((dbResponse as DatabaseError).message);
    return res.status(500).json({ error: 'Database Error' });
  }
  
  const everyEmployees = await db.getTable('employees');
  if ((everyEmployees as DatabaseError).error) {
    console.trace((everyEmployees as DatabaseError).message);
    return res.status(500).json({ error: 'Database Error' });
  }

  const lastOvertime = (dbResponse as Object[])[0];
  if (!lastOvertime) {
    
    const employeesList: EmployeeOvertime[] = (everyEmployees as Object[]).map((employee, index) => ({
      name: employee.name, priority: index + 1, status: 'inconnu' 
    }));
    const dbResponse = await db.insertRow('overtimes', {
      date: new Date(), employees: employeesList, opened: true, currentPriority: 1
    });
    if (dbResponse.error) {
      console.trace(dbResponse.message);
      return res.status(500).json({ error: 'Database Error' });
    }
    return res.status(200).json({ message: 'Overtime was created' });
  }


});

route.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'No id' });
    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count, opened FROM overtimes WHERE rowid = ?', [numberId], async (err, row) => {
            if (err) return res.status(500).json({ error: 'Error while deleting row' });
            else if (row.count === 0) return res.status(404).json({ error: 'Row not found' });
            
            db.run('DELETE FROM overtimes WHERE rowid = ?', [numberId], async (err) => {
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

route.patch('/:id/open', async (req, res) => {
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
            db.run('UPDATE overtimes SET opened = 1 WHERE rowid = ?', [numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while opening overtime' });
                }
                return res.status(200).json({ message: 'Overtime opened successfully' });
            });
        });
    });
});

route.patch('/:id/reset', async (req, res) => {
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
            db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while resetting overtime' });
                }
                const resetedEmployees = JSON.parse(row.employees).map(employee => ({...employee, status: 'inconnu'}));

                db.run('UPDATE overtimes SET employees = ?, currentPriority = 1 WHERE rowid = ?', [JSON.stringify(resetedEmployees), numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while resetting overtime' });
                    }
                    return res.status(200).json({ message: 'Overtime reset successfully' });
                });
            });
        });
    });
});

route.patch('/:id/tohead', async (req, res) => {
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
            db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while to head overtime' });
                }

                db.run('DELETE FROM overtimes WHERE rowid = ?', [numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while to head overtime' });
                    }
                });

                db.run('INSERT INTO overtimes (date, employees, opened, currentPriority) VALUES (?, ?, ?, ?)', [new Date().toISOString(), row.employees, row.opened, row.currentPriority], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while to head overtime' });
                    }
                    return res.status(200).json({ message: 'Overtime to head successfully' });
                });
            });
        });
    });
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
