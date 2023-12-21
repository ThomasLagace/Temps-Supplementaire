import EmployeesOvertimeList from './EmployeesOvertimeList';
import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { useOvertimeContext } from '../hooks/useOvertimeContext';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';

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

const OffCanvas = ({ name, overtime }) => {
  const { overtimes, dispatch } = useOvertimeContext();
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getOvertimes = async () => {
    const response = await fetch('/api/overtimes/10');
    const data = await response.json();
  
    if (response.ok) {
      dispatch({ type: 'SET_OVERTIMES', payload: data });
    } else {
      setError('Une erreur est survenue');
    }
  };
  
  const handleOvertimeOpen = async () => {
    const response = await fetch(`/api/overtimes/${overtime.id}/open`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  const handleOvertimeClose = async () => {
    const response = await fetch(`/api/overtimes/${overtime.id}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  const handleOvertimeDelete = async () => {
    const response = await fetch(`/api/overtimes/${overtime.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  const handleOvertimeReset = async () => {
    const response = await fetch(`/api/overtimes/${overtime.id}/reset`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  const handleOvertimeUpdate = async () => {
    const response = await fetch(`/api/overtimes/employees/update/${overtime.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  const handleOvertimeToHead = async () => {
    const response = await fetch(`/api/overtimes/${overtime.id}/tohead`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      getOvertimes();
    } else {
      setError('Une erreur est survenue');
    }
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-2">
        {name}
      </Button>
      <Offcanvas show={show} onHide={handleClose} placement="bottom">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex gap-3">
            <Button className="flex-fill" variant={overtime.opened ? 'success bg-submited' : 'danger ouvrir-overtime'}>{overtime.opened ? 'Résoudre le TS' : 'Réouvrir le TS'}</Button>
            <Button className="flex-fill danger-danger" variant="danger" onClick={handleOvertimeDelete}>Deleter le TS</Button>
            <Button className="flex-fill" variant="warning" onClick={handleOvertimeReset}>Reseter le TS</Button>
            <Button className="flex-fill" variant="info" onClick={handleOvertimeUpdate}>Updater le TS avec noms dans db</Button>
            <Button className="flex-fill" variant="warning" onClick={handleOvertimeToHead}>Changer pour TÊTE</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

const OvertimeAccordionItem = ({ overtime, index }) => {
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
          <div className="d-flex">
            <p className="text-start m-auto col-11">{`${index === 0 ? 'TÊTE' : ''} ${overtime.id}: Créé le ${year}-${month}-${day} à ${hour} h ${minute ? minute : ''}`}</p>
            <div className="col-1">
              <div className={overtime.opened ? 'pill-red text-white' : 'pill-green'}>
                <p className="text-center m-auto">{overtime.opened ? 'ouvert' : 'résolut'}</p>
              </div>
            </div>
          </div>
        </CustomToggle>
      </Card.Header>
      <Accordion.Collapse eventKey={index.toString()}>
        <Card.Body className="d-flex flex-column gap-3">
          <EmployeesOvertimeList employees={overtime.employees.sort((a, b) => a.priority - b.priority)} currentPriority={overtime.currentPriority} overtimeId={overtime.id}/>
          <OffCanvas name="Actions" overtime={overtime} />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}

export default OvertimeAccordionItem;
