import { TableModel } from '../modules/Database.js';

export const employeeModel: TableModel = {
  name: 'employees',
  columns: [
    {
      name: 'name',
      type: 'string',
      required: true
    }
  ]
};

export interface EmployeeInterface {
  id: number,
  name: string,
};
