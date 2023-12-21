import sqlite from 'sqlite3';
import EmployeeOvertime from '../src/models/employeeOvertimeModel.js';
import fs from 'fs';
const db = new sqlite.Database('./db/database.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS employees (name VARCHAR(255))', (err) => {if(err) console.log(err)})
    db.run('CREATE TABLE IF NOT EXISTS overtimes (date DATE, employees TEXT, opened BOOL, currentPriority INT)', (err) => {if(err) console.log(err)})
});

db.serialize(() => {
    fs.readFile('./config/startEmployees.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const jsonData = JSON.parse(data);
        db.run('DELETE FROM employees', (err) => {if(err) console.log(err)})
        jsonData.employees.forEach((employee) => {
            db.run('INSERT INTO employees (name) VALUES (?)', [employee.name], (err) => {if(err) console.log(err)})
        });
    });
});

export default db;
