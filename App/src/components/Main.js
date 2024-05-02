import { useEffect, useState } from 'react';

import { REAL_CARD_RATE_DEFAULT } from '../consts/data';
import getCalculatedCards from '../func/getCalculatedCards';
import isCardInArea from '../func/isCardInArea';
import Footer from './Footer';
import Header from './Header';
import MapEVsTable from './MapEVsTable';
import SingleCardEVsTable from './SingleCardEVsTable';
import DataInput from './DataInput';

export default function Main({ allCards, allMaps, league }) {
  const [calculatedCards, setCalculatedCards] = useState({});
  const [sortedCards, setSortedCards] = useState([]);
  const [allMapVals, setAllMapVals] = useState([]);
  const [targetAreas, setTargetAreas] = useState([]);
  const [realCardRate, setRealCardRate] = useState(REAL_CARD_RATE_DEFAULT);
  const [mapCards, setMapCards] = useState([]);

  const updateSelectedCardRate = (e) => {
    const name = e.target.value;
    const card = allCards.find((c) => c.name === name);
    setRealCardRate({ ...realCardRate, ...card });
  };

  const updateSelectedCardRateQt = (e) => {
    setRealCardRate({ ...realCardRate, number: e.target.value });
  };

  useEffect(() => {
    async function getTargetAreas() {
      const filename = league === 'standard' ? 'std_maps' : 'league_maps';
      const response = await fetch(
        `https://poe.stiwoz.cloud/api/${filename}.json`
      );
      const data = await response.json();
      setTargetAreas(data);
    }

    if (!targetAreas.length) {
      getTargetAreas();
    }
  }, []);

  useEffect(() => {
    if (!targetAreas.length) return;
    const calculatedCards = getCalculatedCards(
      targetAreas,
      allCards,
      league,
      realCardRate
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
        res: getCalculatedCards([map], allCards, league, realCardRate),
        predicted: getCalculatedCards(
          [...targetAreas, map],
          allCards,
          league,
          realCardRate
        ),
      }))
      .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);
    setAllMapVals(allMapVals);
  }, [targetAreas, realCardRate, allCards]);

  useEffect(() => {
    if (!targetAreas.length) return;
    const mapCards = allCards.filter((card) => isCardInArea(card, targetAreas));
    setMapCards(mapCards);

    if (mapCards.length) {
      const union = mapCards.find((card) => card.name === 'The Union');
      const gambler = mapCards.find((card) => card.name === 'The Gambler');
      const wrath = mapCards.find((card) => card.name === 'The Wrath');
      if (union) {
        setRealCardRate({ ...realCardRate, ...union });
      } else if (gambler) {
        setRealCardRate({ ...realCardRate, ...gambler });
      } else if (wrath) {
        setRealCardRate({ ...realCardRate, ...wrath });
      } else {
        setRealCardRate({ ...realCardRate, ...mapCards[0] });
      }
    }
  }, [targetAreas, allCards]);

  if (!targetAreas.length || !calculatedCards.cards)
    return <div>Loading...</div>;

  return (
    <>
      <Header league={league} />
      <DataInput
        league={league}
        mapCards={mapCards}
        targetAreas={targetAreas}
        realCardRate={realCardRate}
        calculatedCards={calculatedCards}
        setRealCardRate={updateSelectedCardRate}
        setRealCardRateQt={updateSelectedCardRateQt}
        setTargetAreas={setTargetAreas}
      />
      <SingleCardEVsTable league={league} sortedCards={sortedCards} />
      <MapEVsTable allMapVals={allMapVals} />
      <Footer />
    </>
  );
}
