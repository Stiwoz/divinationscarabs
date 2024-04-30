import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';

import {
  REAL_CARD_RATE_DEFAULT,
  PINNED_DPI,
  GLOBAL_DROP_RATE,
} from './consts/data';
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
  realCardRate,
  setRealCardRate,
  pinnedDpi,
  setPinnedDpi,
  calculatedCards,
  sortedCards,
  allMapVals,
  league
) => {
  const { mapTotalWeight, dropPoolItems, totalRawEV, totalStackScarabEV } =
    calculatedCards;
  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  const poeNinjaUrl = league === 'standard' ? 'standard' : 'challenge';
  return (
    <>
      {getHeaderHtml(league)}
      <h3>INPUTS</h3>
      <h5>Chosen maps:</h5>
      <textarea
        placeholder='Enter maps here, one per line, with no spaces (e.g. DefiledCathedral)'
        rows={targetAreas.length}
        value={targetAreas.join('\n')}
        onChange={(e) => inputMapsChanged(e, setTargetAreas)}
      ></textarea>

      <form>
        <div>
          Pinned drop count card:{' '}
          <a
            href={`https://poe.ninja/${poeNinjaUrl}/divination-cards/the-union`}
            target='_blank'
          >
            The Union (7)
          </a>
          <br />
          {/* <div className='radio-wrapper'>
            <input
              type='radio'
              id='The Gambler'
              name='real_card_rate_name'
              value='The Gambler'
              checked={realCardRate.name == 'The Gambler'}
              onChange={(e) =>
                setRealCardRate({ ...realCardRate, name: e.target.value })
              }
            />
            <label htmlFor='The Gambler'>&nbsp;The Gambler</label>
          </div>
          <div className='radio-wrapper'>
            <input
              type='radio'
              id='The Union'
              name='real_card_rate_name'
              value='The Union'
              checked={realCardRate.name == 'The Union'}
              onChange={(e) =>
                setRealCardRate({ ...realCardRate, name: e.target.value })
              }
            />
            <label htmlFor='The Union'>&nbsp;The Union</label>
          </div> */}
          Pinned drop count ammount: <code>{realCardRate.number}</code>
          {/* <input
            type='number'
            id='rate_number'
            name='rate_number'
            min='1'
            value={realCardRate.number}
            onChange={(e) =>
              setRealCardRate({ ...realCardRate, number: e.target.value })
            }
          /> */}
          <br />
          Pinned drop pool item: <code>{pinnedDpi}</code>
          {/* <input
            type='number'
            id='pinned_dpi'
            name='pinned_dpi'
            min='1'
            value={pinnedDpi}
            onChange={(e) => setPinnedDpi(e.target.value)}
          /> */}
          <br />
          Drop pool items: <code>{dropPoolItems}</code>
          <br />
          Total map weight: <code>{mapTotalWeight}</code>
          <br />
          Total EV: <code>{totalRawEV.toFixed(2)}</code>
          <br />
          Total StackScarab EV: <code>{totalStackScarabEV.toFixed(2)}</code>
          <br />
          Global drop rate: <code>{GLOBAL_DROP_RATE}</code>
        </div>
      </form>

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

export function Main({
  allCards,
  allMaps,
  setTargetAreas,
  targetAreas,
  setRealCardRate,
  realCardRate,
  pinnedDpi,
  setPinnedDpi,
  league,
}) {
  const [calculatedCards, setCalculatedCards] = useState({});
  const [sortedCards, setSortedCards] = useState([]);
  const [allMapVals, setAllMapVals] = useState([]);

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

    useEffect( () => {
      if ( !targetAreas.length ) return;
    const calculatedCards = getCalculatedCards(
      targetAreas,
      allCards,
      league,
      realCardRate,
      pinnedDpi
    );
    setCalculatedCards(calculatedCards);

    const sortedCards = calculatedCards.cards
      .sort((a, b) => b.rawEV - a.rawEV)
      .map((c) => ({
        ...c,
        ninja:
          league !== 'standard'
            ? c.ninja
            : c.ninja.replace('challenge', league),
      }));
    setSortedCards(sortedCards);

    const allMapVals = allMaps
      .map((map) => ({
        name: map,
        res: getCalculatedCards(
          [map],
          allCards,
          league,
          realCardRate,
          pinnedDpi
        ),
        predicted: getCalculatedCards(
          [...targetAreas, map],
          allCards,
          league,
          realCardRate,
          pinnedDpi
        ),
      }))
      .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);
    setAllMapVals(allMapVals);
  }, [targetAreas]);

if ( !targetAreas.length || !calculatedCards.cards  ) return <div>Loading...</div>;
    
  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    realCardRate,
    setRealCardRate,
    pinnedDpi,
    setPinnedDpi,
    calculatedCards,
    sortedCards,
    allMapVals,
    league
  );
}

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [allMaps, setAllMaps] = useState([]);
  const [targetAreas, setTargetAreas] = useState([]);
  const [realCardRate, setRealCardRate] = useState(REAL_CARD_RATE_DEFAULT);
  const [pinnedDpi, setPinnedDpi] = useState(PINNED_DPI);
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
        element={
          <Main
            league={league}
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
            realCardRate={realCardRate}
            setRealCardRate={setRealCardRate}
            pinnedDpi={pinnedDpi}
            setPinnedDpi={setPinnedDpi}
          />
        }
      />
      <Route
        path='standard'
        element={
          <Main
            league={league}
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
            realCardRate={realCardRate}
            setRealCardRate={setRealCardRate}
            pinnedDpi={pinnedDpi}
            setPinnedDpi={setPinnedDpi}
          />
        }
      />
      <Route path='*' element={<Navigate to='/league' />} />
    </Routes>
  );
}
