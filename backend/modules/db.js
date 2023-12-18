import sqlite from 'sqlite3';
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXIST employees (name VARCHAR(255))', (err) => {if(err) console.log(err)})
    db.run('CREATE TABLE IF NOT EXIST overtimes (date DATE, employees TEXT, opended BOOL)', (err) => {if(err) console.log(err)})
});

export default db;
