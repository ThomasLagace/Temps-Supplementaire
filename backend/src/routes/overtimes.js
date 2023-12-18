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
    const createdDate = req.body.date;
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
    
    await insertRow('overtimes', {date: createdDate, employees: JSON.stringify(newEmployeesPriority), opened: true, currentPriority: 1});
    
    res.status(200).json({message: "Table created"});
});

export default route;
