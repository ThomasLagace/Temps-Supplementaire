import sqlite from 'sqlite3';
import EmployeeOvertime from '../src/models/employeeOvertimeModel.js';
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS employees (name VARCHAR(255))', (err) => {if(err) console.log(err)})
    db.run('CREATE TABLE IF NOT EXISTS overtimes (date DATE, employees TEXT, opened BOOL, currentPriority INT)', (err) => {if(err) console.log(err)})
});

db.serialize(() => {

    const employees = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Michael Johnson' },
        { id: 4, name: 'Emily Davis' },
        { id: 5, name: 'David Brown' }
    ]
    
    const overtimes = [
        { date: "2022-01-04", employees: [
            { id: 1, name: "John Doe", priority: 3, status: "conge" },
            { id: 2, name: "Jane Smith", priority: 1, status: "non conge" },
            { id: 3, name: "Michael Johnson", priority: 5, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 2, status: "disponible" },
            { id: 5, name: "David Brown", priority: 4, status: "non disponible" }
        ], opened: false, currentPriority: 1 },
        { date: "2022-01-05", employees: [
            { id: 1, name: "John Doe", priority: 2, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 4, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 1, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 5, status: "disponible" },
            { id: 5, name: "David Brown", priority: 3, status: "non disponible" }
        ], opened: true, currentPriority: 1 },
        // Add more variations here...
        { date: "2022-01-06", employees: [
            { id: 1, name: "John Doe", priority: 4, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 2, status: "conge" },
            { id: 3, name: "Michael Johnson", priority: 3, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 5, status: "disponible" },
            { id: 5, name: "David Brown", priority: 1, status: "non disponible" }
        ], opened: true, currentPriority: 1 },
        { date: "2022-01-07", employees: [
            { id: 1, name: "John Doe", priority: 5, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 3, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 1, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 4, status: "disponible" },
            { id: 5, name: "David Brown", priority: 2, status: "non disponible" }
        ], opened: false, currentPriority: 1 },
        { date: "2022-01-08", employees: [
            { id: 1, name: "John Doe", priority: 1, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 4, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 2, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 5, status: "disponible" },
            { id: 5, name: "David Brown", priority: 3, status: "non disponible" }
        ], opened: true, currentPriority: 1 },
        { date: "2022-01-09", employees: [
            { id: 1, name: "John Doe", priority: 3, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 5, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 1, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 4, status: "disponible" },
            { id: 5, name: "David Brown", priority: 2, status: "non disponible" }
        ], opened: false, currentPriority: 1 },
        { date: "2022-01-10", employees: [
            { id: 1, name: "John Doe", priority: 2, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 1, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 5, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 3, status: "disponible" },
            { id: 5, name: "David Brown", priority: 4, status: "non disponible" }
        ], opened: true, currentPriority: 1 },
        { date: "2022-01-11", employees: [
            { id: 1, name: "John Doe", priority: 4, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 3, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 2, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 1, status: "disponible" },
            { id: 5, name: "David Brown", priority: 5, status: "non disponible" }
        ], opened: false, currentPriority: 1 },
        { date: "2022-01-12", employees: [
            { id: 1, name: "John Doe", priority: 5, status: "disponible" },
            { id: 2, name: "Jane Smith", priority: 4, status: "non disponible" },
            { id: 3, name: "Michael Johnson", priority: 3, status: "inconnu" },
            { id: 4, name: "Emily Davis", priority: 2, status: "disponible" },
            { id: 5, name: "David Brown", priority: 1, status: "non disponible" }
        ], opened: true, currentPriority: 1 }
    ];

    employees.forEach((employee) => {
        db.run('INSERT INTO employees (name) VALUES (?)', [employee.name], (err) => {
            if (err) console.log(err);
        });
    });

    overtimes.forEach((overtime) => {
        db.run('INSERT INTO overtimes (date, employees, opened, currentPriority) VALUES (?, ?, ?, ?)', [overtime.date, JSON.stringify(overtime.employees), overtime.opened, overtime.currentPriority], (err) => {
            if (err) console.log(err);
        });
    });
});

export default db;
