import { TableModel } from '../modules/Database.js';
import employeeOvertimeInterface from './employeeOvertimeInterface.js';

export const overtimeModel: TableModel = {
  name: 'overtimes',
  columns: [
    {
      name: 'date',
      type: 'date',
      required: true
    },
    {
      name: 'employees',
      type: 'array',
      required: true
    },
    {
      name: 'opened',
      type: 'boolean',
      required: true
    },
    {
      name: 'currentPriority',
      type: 'int',
      required: true
    }
  ]
};

export interface OvertimeInterface {
  id: number,
  date: Date,
  employees: employeeOvertimeInterface[],
  opened: boolean,
  currentPriority: number,
};
