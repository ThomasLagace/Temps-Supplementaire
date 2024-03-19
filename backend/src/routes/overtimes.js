import express, { json } from 'express';
import db from '../../modules/database.js';
import { insertRow, getTable } from '../../modules/databaseHelperFunctions.js';

const route = express.Router();

/**
 * 
 * @param {Array<Object>} employeesTable 
 * @param {Array<Object>} lastAvailabilities 
 */
function nextEmployees(employeesTable, lastAvailabilities) {
  /**
   * @todo Code the function
   */
  console.log(employeesTable);
  console.log(lastAvailabilities);
  const lastAvailabilitiesLastEmployees = lastAvailabilities.filter(availability => {
    return employeesTable.some(employee => employee.id == availability.employeeID);
  })
  .map(availability => {
    const employee = employeesTable.find(employee => employee.id == availability.employeeID);
    return {
      ...employee,
      status: availability.status,
      priority: availability.priority,
    }
  })
  .sort((a, b) => a.priority - b.priority);

  

  console.log(lastAvailabilitiesLastEmployees);
}

/**
 * 
 * @async
 * @throws Error from the sqlite3 database
 * @param {number} limit 
 * @returns {Object} An object with all the overtimes
 */
async function getOvertimesAsJson(limit = null) {
  const overtimes = await getTable('overtimes', limit, 'date', 'DESC');
  if (overtimes instanceof Error) throw overtimes;
  
  const jsonResponse = await Promise.all(overtimes.map(async overtime => {
    const availabilities = await getTable('availability', null, 'priority', 'ASC', { overtimeID: overtime.id });
    if (availabilities instanceof Error) throw availabilities;

    const employees =  await Promise.all(availabilities.map(async availability => {
      const employee = (await getTable('employees', 1, null, 'ASC', { id: availability.employeeID}))[0];
      if (employee instanceof Error) throw employee;

      return {
        name: employee.name,
        status: availability.status,
        priority: availability.priority,
      };
    }));
    
    return {
      date: overtime.date,
      employees,
    }
  }));
  
  return jsonResponse;
}

async function createAndInsertNewOvertime(date, employees) {
  const insertingOvertime = await insertRow('overtimes', { date });
  if (insertingOvertime instanceof Error) throw insertingOvertime;

  const createdOvertime = (await getTable('overtimes', 1, null, 'ASC', { date: date }))[0];

  employees.forEach(async (employee, index) => {
    const insertingAvailability = await insertRow('availability', 
    {
      employeeID: employee.id,
      overtimeID: createdOvertime.id,
      priority: employee.priority || index + 1,
    });

    if (insertingAvailability instanceof Error) throw insertingAvailability;
  });
}

route.get('/test', async (req, res) => {
  db.serialize(() => {
//    db.run('INSERT INTO employees (name) VALUES ("TEST")')
//    db.run('DELETE FROM employees WHERE id IN (1, 3, 5)', (err) => { if (err) console.trace(err) });
    db.run('UPDATE availability SET status = \'available\' WHERE id = 2', (err) => { if (err) console.trace(err); });
    db.run('UPDATE availability SET status = \'available\' WHERE id = 4', (err) => { if (err) console.trace(err); });
  });
  res.sendStatus(200);
});

route.get(['/', '/:limitParam'], async (req, res) => {
  const { limitParam } = req.params;

  if (!limitParam) {
    try {
      const jsonResponse = await getOvertimesAsJson();
      return res.status(200).json(jsonResponse);
    } catch (error) {
      console.trace(error);
      return res.status(500).json({ error: 'Internal server Error' });
    }
  }

  const limit = parseInt(limitParam);
  if (isNaN(limit)) {
    return res.status(400).json({ error: 'Invalid limit parameter' });
  }

  try {
    const jsonResponse = await getOvertimesAsJson(limit);
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.trace(error);
    return res.status(500).json({ error: 'Internal server Error' });
  }
});

route.post('/create', async (req, res) => {
  const createdDate = new Date().getTime();

  const lastOvertime = (await getTable('Overtimes', 1, 'date', 'DESC'))[0];
  const employees = await getTable('employees');
  if (!lastOvertime) {
    try {
      createAndInsertNewOvertime(createdDate, employees);
      return res.sendStatus(200);
    } catch (error) {
      console.trace(error);
      return res.status(500).json({ error: 'Internal server Error'});
    }
  }
  
  await db.serialize(async () => {
    await db.all(`SELECT *, employees.name, status, priority, employees.id AS employeeID\
                  FROM availability\
                  JOIN employees\
                  ON availability.employeeID = employees.id\
                  WHERE availability.overtimeID = 1`,
      async (err, rows) => {
      rows.forEach((row, index) => {
        if (row.status != null) {
          rows.push(rows.splice(index, 1)[0]);
        }
      });
      let nextEmployees = rows.map(row => {
        return {
          id: row.employeeID,
          name: row.name,
        };
      });
      createAndInsertNewOvertime(createdDate, nextEmployees);
    });
  });
});

route.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'No id' });
    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count, opened FROM overtimes WHERE rowid = ?', [numberId], async (err, row) => {
            if (err) return res.status(500).json({ error: 'Error while deleting row' });
            else if (row.count === 0) return res.status(404).json({ error: 'Row not found' });
            
            db.run('DELETE FROM overtimes WHERE rowid = ?', [numberId], async (err) => {
                if (err) return res.status(500).json({ error: 'Error while deleting row' });
                else return res.status(200).json({ message: 'Row deleted successfully' });
            });
        });
    });
});

route.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { employee } = req.body;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    if (!employee || !employee.id || !employee.status) {
        return res.status(400).json({ error: 'Invalid employee data' });
    }

    db.serialize(() => {
        db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], async (err, overtime) => {
            if (err) return res.status(500).json({ error: 'Error while retrieving overtime' });
            if (!overtime) return res.status(404).json({ error: 'Row not found' });
            if (!overtime.opened) return res.status(400).json({ error: 'Row is closed' });
            const employees = JSON.parse(overtime.employees);
            const employeeIndex = employees.findIndex((emp) => emp.id === employee.id);

            if (employeeIndex === -1) return res.status(400).json({ error: 'Employee not found' });

            if (employees[employeeIndex].priority != overtime.currentPriority) {
                return res.status(400).json({ error: 'Employee priority is not the current priority' });
            }

            const updatedEmployees = employees.map((emp) => {
                if (emp.id === employee.id) return { ...emp, status: employee.status };
                return emp;
            });

            const updateQuery = `UPDATE overtimes SET employees = ? WHERE rowid = ?`;
            db.run(updateQuery, [JSON.stringify(updatedEmployees), numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while updating employee priority' });
                }
                db.run('UPDATE overtimes SET currentPriority = currentPriority + 1 WHERE rowid = ?', [numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while updating employee priority' });
                    }
                });
                return res.status(200).json({ message: 'Employee priority updated successfully' });
            });
        });
    });
});

route.patch('/:id/close', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            db.run('UPDATE overtimes SET opened = 0 WHERE rowid = ?', [numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while closing overtime' });
                }
                return res.status(200).json({ message: 'Overtime closed successfully' });
            });
        });
    });
    console.log(await getTable('overtimes'));
});

route.patch('/:id/open', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            db.run('UPDATE overtimes SET opened = 1 WHERE rowid = ?', [numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while opening overtime' });
                }
                return res.status(200).json({ message: 'Overtime opened successfully' });
            });
        });
    });
});

route.patch('/:id/reset', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while resetting overtime' });
                }
                const resetedEmployees = JSON.parse(row.employees).map(employee => ({...employee, status: 'inconnu'}));

                db.run('UPDATE overtimes SET employees = ?, currentPriority = 1 WHERE rowid = ?', [JSON.stringify(resetedEmployees), numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while resetting overtime' });
                    }
                    return res.status(200).json({ message: 'Overtime reset successfully' });
                });
            });
        });
    });
});

route.patch('/:id/tohead', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            db.get('SELECT * FROM overtimes WHERE rowid = ?', [numberId], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while to head overtime' });
                }

                db.run('DELETE FROM overtimes WHERE rowid = ?', [numberId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while to head overtime' });
                    }
                });

                db.run('INSERT INTO overtimes (date, employees, opened, currentPriority) VALUES (?, ?, ?, ?)', [new Date().toISOString(), row.employees, row.opened, row.currentPriority], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error while to head overtime' });
                    }
                    return res.status(200).json({ message: 'Overtime to head successfully' });
                });
            });
        });
    });
});

route.post('/employees/update/:id', async (req, res) => {
    const { id } = req.params;

    const numberId = parseInt(id);
    if (!numberId) return res.status(400).json({ error: 'Invalid id' });

    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count, * FROM overtimes WHERE rowid = ?', [numberId], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error while checking overtime' });
            }
            if (row.count === 0) {
                return res.status(404).json({ error: 'Overtime not found' });
            }
            const allEmployees = await getTable('employees');

            const currentEmployees = JSON.parse(row.employees).sort((a, b) => a.priority - b.priority);
            const currentEmployeesIds = currentEmployees.map((employee) => employee.id);

            const newEmployees = allEmployees.filter((employee) => !currentEmployeesIds.includes(employee.id));
            const updatedEmployees = [...currentEmployees, ...newEmployees].map((employee, index) => ({
                ...employee,
                name: employee.name,
                priority: index + 1,
                status: 'inconnu'
            }));
            
            db.run('UPDATE overtimes SET employees = ? WHERE rowid = ?', [JSON.stringify(updatedEmployees), numberId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error while updating employees' });
                }
                return res.status(200).json({ message: 'Employees updated successfully' });
            });
        });
    });
});

export default route;
