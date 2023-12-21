import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { useOvertimeContext } from '../hooks/useOvertimeContext';

const EmployeesOvertimeList = ({ employees, currentPriority, overtimeId }) => {
  const [id, setId] = useState(null);
  const [status, setStatus] = useState('inconnu');
  const [error, setError] = useState(null);
  const { overtimes, dispatch } = useOvertimeContext();
  
  const getBackgroundClass = (priority) => {
    if (priority === currentPriority) return
    else if (priority > currentPriority) return 'list-group-item-dark';
    else return 'bg-submited';
  };

  const handleConfim = async (event) => {
    event.preventDefault();

    const getOvertimes = async () => {
      const response = await fetch('/api/overtimes');
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_OVERTIMES', payload: data });
      } else {
        console.log(response);
      }
    };
    
    const employee = { id, status };
    switch (status) {
      case 'disponible':
      case 'non disponible':
      case 'conge':
        fetch(`/api/overtimes/${overtimeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ employee })
        }).then((response) => {
          if (response.ok) {
            setError(null);
            console.log('Employee status updated successfully');
            getOvertimes();
          } else {
            console.log(response);
          }
        });
        break;
      case 'inconnu':
        setError('Veuillez saisir un status');
        return;
      default:
        setError('Satuts invalide');
        return;
    }
  };

  return (
    <ListGroup as="ul">
      {employees && employees.map(employee => (
        <form onSubmit={handleConfim} key={employee.id}>
          <ListGroup.Item as="li" key={employee.id} active={employee.priority === currentPriority} className={`d-flex gap-3 ${getBackgroundClass(employee.priority)}`}>
            <p className="col-7 m-auto">{employee.name}</p>
            <Form.Select
              className={employee.priority !== currentPriority ? 'bg-disabled' : ''}
              target="disponible"
              disabled={employee.priority !== currentPriority}
              value={employee.priority !== currentPriority ? employee.status : undefined}
              onChange={(e) => {
                setStatus(e.target.value);
                setId(employee.id);
              }}
            >
              <option>Inconnu</option>
              <option value="disponible">Disponible</option>
              <option value="non disponible">Non disponible</option>
              <option value="conge">Congé</option>
            </Form.Select>
            <Button variant={employee.priority === currentPriority ? 'info' : 'secondary'} className="col-2" type="submit" disabled={employee.priority !== currentPriority}>Confimer</Button>
          </ListGroup.Item>
        </form>
      ))}
    </ListGroup>
  );
}

export default EmployeesOvertimeList;
