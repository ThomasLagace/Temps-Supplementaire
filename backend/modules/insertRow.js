import db from './db.js';

export default async function insertRow(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(value => {
        if (typeof value === 'string') {
            return `'${value}'`;
        } else {
            return value;
        }
    }).join(', ');

    return await new Promise((resolve, reject) => {
        db.run(`INSERT INTO ${tableName} (${columns}) VALUES (${values})`, (err) => {
            if (err) {
                console.error(err.message);
                reject(false);
            } else {
                console.log(`A new row has been inserted into table: "${tableName}"`);
                resolve(true)
            }
        });
    });
}
