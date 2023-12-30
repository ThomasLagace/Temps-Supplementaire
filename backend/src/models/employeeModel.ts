import { TableModel } from '../modules/Database.js';

const employeeModel: TableModel = {
  name: 'employees',
  columns: [
    {
      name: 'name',
      type: 'string',
      required: true
    }
  ]
}

export default employeeModel;
