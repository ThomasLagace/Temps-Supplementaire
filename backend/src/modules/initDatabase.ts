import { Database } from './Database.js';
import { employeeModel } from '../models/employeeModel.js';
import { overtimeModel } from '../models/overtimeModel.js';

const db = new Database(":memory:");

await db.createTable(employeeModel);
await db.createTable(overtimeModel);

// console.log('Inserting lorem rows overtimes: ', await db.insertRows('overtimes', [
//   {
//     date: new Date('2012-02-30'),
//     employees: [
//       {name: 'hello', priority: 1, status: 'inconnu'},
//       {name: 'lmaoo', priority: 2, status: 'inconnu'},
//       {name: 'sup', priority: 3, status: 'inconnu'},
//     ],
//     opened: true,
//     currentPriority: 1
//   },
//   {
//     date: new Date('2002-12-20'),
//     employees: [
//       {name: 'hello', priority: 1, status: 'inconnu'},
//       {name: 'lmaoo', priority: 2, status: 'inconnu'},
//       {name: 'sup', priority: 3, status: 'inconnu'},
//     ],
//     opened: true,
//     currentPriority: 1
//   },
//   {
//     date: new Date('2023-10-20'),
//     employees: [
//       {name: 'hello', priority: 1, status: 'inconnu'},
//       {name: 'lmaoo', priority: 2, status: 'inconnu'},
//       {name: 'sup', priority: 3, status: 'inconnu'},
//     ],
//     opened: true,
//     currentPriority: 1
//   },
// ]));

console.log('Putting lorem into employees: ', await db.insertRows('employees', 
  [
    { name: 'hello' },
    { name: 'sup' },
    { name: 'Yup' },
    { name: 'Lamoehlo' },
  ]
));


export { db };