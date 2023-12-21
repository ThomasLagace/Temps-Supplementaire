import EmployeesOvertimeList from './EmployeesOvertimeList';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { useOvertimeContext } from '../hooks/useOvertimeContext';

const CustomToggle = ({ children, eventKey }) => {
  const decoratedOnClick = useAccordionButton(eventKey);
  
  return (
    <button
      type="button"
      style={{
        width: '100%',
        height: '100%',
        margin: '0',
        border: 'none',
        background: 'none',
        borderRadius: '15px',
        padding: '8px'
      }}
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
}


const OvertimeAccordionItem = ({ overtime, index }) => {
  const { overtimes, dispatch } = useOvertimeContext();
  const overtimeDate = new Date(overtime.date);
  const { year, month, day, hour, minute } = {
    year: overtimeDate.getFullYear(),
    month: overtimeDate.getMonth(),
    day: overtimeDate.getDate(),
    hour: overtimeDate.getHours(),
    minute: overtimeDate.getMinutes(),
  }

  return (
    <Card>
      <Card.Header className="p-1">
        <CustomToggle eventKey={index.toString()}>
          <p className="text-start m-auto">{`Créé le ${year}-${month}-${day} à ${hour} h ${minute ? minute : ''}`}</p>
        </CustomToggle>
      </Card.Header>
      <Accordion.Collapse eventKey={index.toString()}>
        <Card.Body>
          <EmployeesOvertimeList employees={overtime.employees.sort((a, b) => a.priority - b.priority)} currentPriority={overtime.currentPriority} overtimeId={overtime.id}/>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}

export default OvertimeAccordionItem;
