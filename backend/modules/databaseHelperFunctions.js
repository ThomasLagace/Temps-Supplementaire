import db from './database.js';

/**
 * Returns an array of elments in a table
 * @async
 * @param {string} tableName
 * @param {number} [limit=null] The limit of objects being returned by the database 
 * @param {string} [sortColumn=null] The column to sort by 
 * @param {('ASC'|'DESC')} [sortOrder='ASC'] How the column is sorted, ascending or descending
 * @returns {(Promise<Array>|Promise<Error>)} An array of elements in the table or database Error
 */
export async function getTable(tableName, limit = null, sortColumn = null, sortOrder = 'ASC') {
  const query = `SELECT rowid AS id, * FROM ${tableName}${sortColumn ? ` ORDER BY ${sortColumn} ${sortOrder}` : ''}${limit ? ` LIMIT ${limit}` : ''}`;

  return await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(query, (err, rows) => {
        if (err) {
          console.trace(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
}

/**
 * Inserts a row in a table and returns null if insertion is successful
 * @async
 * @param {string} tableName
 * @param {Object} data Data to insert, keys being the column and values being the value to insert
 * @returns {(Promise<null>|Promise<Error>)} Nothing or a database Error
 */
export async function insertRow(tableName, data) {
  const columns = Object.keys(data).join(', ');

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${data.map(() => '?').join(', ')})`

  return await new Promise((resolve, reject) => {
    db.run(query, Object.values(data), (err) => {
      if (err) console.trace(err);
      resolve(err);
    });
  });
}
