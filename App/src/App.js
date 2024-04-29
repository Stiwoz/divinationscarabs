import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';

import { REAL_CARD_RATE, PINNED_DPI } from './consts/data';
import getCalculatedCards from './func/getCalculatedCards';
import getHeaderHtml from './func/getHeaderHtml';
import getFooterHtml from './func/getFooterHtml';

const inputMapsChanged = (e, setTargetAreas) => {
  const newMaps = e.target.value.split('\n');
  setTargetAreas(newMaps);
};

const printDataToHtml = (
  targetAreas,
  setTargetAreas,
  mapTotalWeight,
  dropPoolItems,
  totalRawEV,
  totalStackScarabEV,
  sortedCards,
  allMapVals,
  league
) => {
  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  return (
    <>
      {getHeaderHtml()}
      <h3>INPUTS</h3>
      <h5>Chosen maps:</h5>
      <textarea
        rows={targetAreas.length}
        value={targetAreas.join('\n')}
        onChange={(e) => inputMapsChanged(e, setTargetAreas)}
      ></textarea>
      <p>
        Total map weight: <code>{mapTotalWeight}</code>
        <br />
        Pinned drop count:{' '}
        <code>
          {REAL_CARD_RATE.name} {REAL_CARD_RATE.number}
        </code>
        <br />
        Pinned drop pool item: <code>{PINNED_DPI}</code>
        <br />
        Drop pool items: <code>{dropPoolItems}</code>
        <br />
        Total EV: <code>{totalRawEV.toFixed(2)}</code>
        <br />
        Total StackScarab EV: <code>{totalStackScarabEV.toFixed(2)}</code>
      </p>
      <h3>SINGLE CARD EVS</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price (c)</th>
            <th>EV</th>
            <th>SSEV</th>
            <th>Drops per map</th>
            <th>SS Drops per map</th>
            <th>Raw Weight</th>
          </tr>
        </thead>
        <tbody>
          {sortedCards.map((c, idx) => (
            <tr key={idx} disabled={c.reward == 'Disabled'}>
              <td>
                <a href={c.ninja} target='_blank'>
                  {c.name} ({c.stack})
                </a>
                <small>{c.reward}</small>
              </td>
              <td>{c[priceLabel]}</td>
              <td>{c.rawEV.toFixed(2)}</td>
              <td>{c.stackScarabEV.toFixed(2)}</td>
              <td>{c.rawDrops.toFixed(2)}</td>
              <td>{c.stackScarabDrops.toFixed(2)}</td>
              <td>{c.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>MAP EVS</h3>
      <table>
        <thead>
          <tr>
            <th>Map name</th>
            <th>Raw total EV</th>
            <th>Stack Scarab total EV</th>
            <th>Predicted raw total EV</th>
            <th>Predicted ss total EV</th>
          </tr>
        </thead>
        <tbody>
          {allMapVals.map((m, idx) => {
            const { name, res, predicted } = m;
            return (
              <tr key={idx}>
                <td>{name}</td>
                <td>{res.totalRawEV.toFixed(2)}</td>
                <td>{res.totalStackScarabEV.toFixed(2)}</td>
                <td>{predicted.totalRawEV.toFixed(2)}</td>
                <td>{predicted.totalStackScarabEV.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {getFooterHtml()}
    </>
  );
};

export function League({ allCards, allMaps, setTargetAreas, targetAreas }) {
  useEffect(() => {
    async function getTargetAreas() {
      const response = await fetch(
        'https://poe.stiwoz.cloud/api/league_maps.json'
      );
      const data = await response.json();
      setTargetAreas(data);
    }

    if (!targetAreas.length) {
      getTargetAreas();
    }
  }, []);

  if (!targetAreas.length) return <div>Loading...</div>;

  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(targetAreas, allCards, 'league');
  const sortedCards = rawCards.sort((a, b) => b.rawEV - a.rawEV);
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map], allCards, 'league'),
      predicted: getCalculatedCards([...targetAreas, map], allCards, 'league'),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals,
    'league'
  );
}

export function Standard({ allCards, allMaps, setTargetAreas, targetAreas }) {
  useEffect(() => {
    async function getTargetAreas() {
      const response = await fetch(
        'https://poe.stiwoz.cloud/api/std_maps.json'
      );
      const data = await response.json();
      setTargetAreas(data);
    }

    if (!targetAreas.length) {
      getTargetAreas();
    }
  }, []);

  if (!targetAreas.length) return <div>Loading...</div>;

  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(targetAreas, allCards, 'standard');
  const sortedCards = rawCards
    .sort((a, b) => b.rawEV - a.rawEV)
    .map((c) => ({
      ...c,
      ninja: c.ninja.replace('challenge', 'standard'),
    }));
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map], allCards, 'standard'),
      predicted: getCalculatedCards(
        [...targetAreas, map],
        allCards,
        'standard'
      ),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals,
    'standard'
  );
}

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [allMaps, setAllMaps] = useState([]);
  const [targetAreas, setTargetAreas] = useState([]);
  useEffect(() => {
    async function getAllCards() {
      const response = await fetch('https://poe.stiwoz.cloud/api/cards.json');
      const data = await response.json();
      setAllCards(data);
    }

    if (!allCards.length) {
      getAllCards();
    }

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
        element={
          <League
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
          />
        }
      />
      <Route
        path='standard'
        element={
          <Standard
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
          />
        }
      />
      <Route path='*' element={<Navigate to='/league' />} />
    </Routes>
  );
}
