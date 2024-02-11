import sqlite from 'sqlite3';
import fs from 'fs';
const db = new sqlite.Database(process.env.DB_PATH || ':memory:');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS Employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL)', (err) => { if(err) console.trace(err) });
  db.run('CREATE TABLE IF NOT EXISTS Overtimes (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATE NOT NULL)', (err) => { if(err) console.trace(err) });
  db.run('CREATE TABLE IF NOT EXISTS Availability\
  (\
    id INTEGER PRIMARY KEY AUTOINCREMENT,\
    employeeID INTEGER NOT NULL,\
    overtimeID INTEGER NOT NULL,\
    status VARCHAR(15),\
    priority INTEGER NOT NULL,\
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID),\
    FOREIGN KEY (overtimeID) REFERENCES overtimes(overtimeID)\
  )', (err) => { if(err) console.trace(err) });
});

db.serialize(() => {
  fs.readFile('./config/startEmployees.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    db.serialize(() => {
      db.run('DELETE FROM Employees', (err) => { if(err) console.trace(err) });
      jsonData.employees.forEach((employee) => {
        db.run('INSERT INTO Employees (name) VALUES (?)', [employee.name], (err) => { if(err) console.trace(err) });
      });
      
      
    })
  });
});



export default db;
