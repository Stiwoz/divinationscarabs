import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';

import Main from './components/Main';

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [allMaps, setAllMaps] = useState([]);
  const { pathname } = useLocation();
  const league = pathname.replace('/', '');

  useEffect(() => {
    async function getAllCards() {
      const response = await fetch('https://poe.stiwoz.cloud/api/cards.json');
      const data = await response.json();
      setAllCards(data);
    }

    if (!allCards.length) {
      getAllCards();
    }
  }, []);

  useEffect(() => {
    async function getAllMaps() {
      const response = await fetch('https://poe.stiwoz.cloud/api/maps.json');
      const data = await response.json();
      setAllMaps(data);
    }

    if (!allMaps.length) {
      getAllMaps();
    }
  }, []);

  if (!allCards.length || !allMaps.length) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        index
        path='league'
        element={<Main league={league} allCards={allCards} allMaps={allMaps} />}
      />
      <Route
        path='standard'
        element={<Main league={league} allCards={allCards} allMaps={allMaps} />}
      />
      <Route path='*' element={<Navigate to='/league' />} />
    </Routes>
  );
}
