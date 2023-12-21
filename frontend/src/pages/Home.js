import { useEffect, useState} from 'react';
import OvertimeAccordionItem from '../components/OvertimeAccordionItem';
import Accordion from 'react-bootstrap/Accordion';
import { useOvertimeContext } from '../hooks/useOvertimeContext';
import Button from 'react-bootstrap/Button';

const Home = () => {
  const { overtimes, dispatch } = useOvertimeContext();
  const [error, setError] = useState(null);
  
  const getOvertimes = async () => {
    const response = await fetch('/api/overtimes/10');
    const data = await response.json();

    if (response.ok) {
      dispatch({ type: 'SET_OVERTIMES', payload: data });
    } else {
      setError('Une erreur est survenue');
    }
  };

  const handleButtonClick = () => {
    const response = async () => {
      fetch('/api/overtimes', {method: 'POST'})
      .then((response) => {
        if (response.ok) {
          const data = response.json();
          getOvertimes();
        } else {
          setError('Une erreur est survenue');
        }
      });
    }
    
    response();
  }

  useEffect(() => {
    getOvertimes();
  }, []);

  return (
    <div className="home bg-secondary">
      <div className="container d-flex flex-column gap-3">
        <Button variant="primary bg-submited" onClick={handleButtonClick}>Nouveau TS</Button>
        <Accordion defaultActiveKey={['0']} alwaysOpen className='d-flex flex-column gap-3'>
          {overtimes && overtimes.map((overtime, index) => (
            <OvertimeAccordionItem key={overtime.id} overtime={overtime} index={index} />
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Home;
