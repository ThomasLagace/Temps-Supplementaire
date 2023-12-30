import { TableModel } from '../modules/Database.js';

const overtimeModel: TableModel = {
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
}

export default overtimeModel;
