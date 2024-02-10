import sqlite from 'sqlite3';
import fs from 'fs';
const db = new sqlite.Database('./db/database.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS employees (name VARCHAR(255) NOT NULL)', (err) => {if(err) console.trace(err)})
  db.run('CREATE TABLE IF NOT EXISTS overtimes (date DATE NOT NULL, employees TEXT NOT NULL, opened BOOL NOT NULL, currentIndexPriority INT NOT NULL)', (err) => {if(err) console.trace(err)})
});

db.serialize(() => {
  fs.readFile('./config/startEmployees.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    db.run('DELETE FROM employees', (err) => {if(err) console.trace(err)})
    jsonData.employees.forEach((employee) => {
      db.run('INSERT INTO employees (name) VALUES (?)', [employee.name], (err) => {if(err) console.trace(err)})
    });
  });
});

export default db;
