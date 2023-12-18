import db from './db.js';

async function getTable(table, { limit = null, sortColumn = null, sortOrder = 'ASC' } = {}) {
    const query = `SELECT rowid AS id, * FROM ${table}${sortColumn ? ` ORDER BY ${sortColumn} ${sortOrder}` : ''}${limit ? ` LIMIT ${limit}` : ''}`;
    return await new Promise((resolve, reject) => db.serialize(() => db.all(query, (err, rows) => {
        if (err) {
            console.trace(err);
            reject(err);
        } else {
            resolve(rows)
        }
    })));
}

export default getTable;
