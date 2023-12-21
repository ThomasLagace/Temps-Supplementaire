import { useEffect, useState} from 'react';
import OvertimeAccordionItem from '../components/OvertimeAccordionItem';
import Accordion from 'react-bootstrap/Accordion';
import { useOvertimeContext } from '../hooks/useOvertimeContext';

const Home = () => {
  const { overtimes, dispatch } = useOvertimeContext();

  useEffect(() => {
    const getOvertimes = async () => {
      const response = await fetch('/api/overtimes');
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_OVERTIMES', payload: data });
      } else {
        console.log(response);
      }
    };

    getOvertimes();
  }, []);

  return (
    <div className="home bg-secondary">
      <div className="container">
        <h1>Hello</h1>
        <p>Here are the list of overtimes:</p>
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
