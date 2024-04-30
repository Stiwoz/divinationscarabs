import { useEffect, useState } from 'react';

import { REAL_CARD_RATE_DEFAULT } from '../consts/data';
import getCalculatedCards from '../func/getCalculatedCards';
import printDataToHtml from '../func/printDataToHtml';

export default function Main({ allCards, allMaps, league }) {
  const [calculatedCards, setCalculatedCards] = useState({});
  const [sortedCards, setSortedCards] = useState([]);
  const [allMapVals, setAllMapVals] = useState([]);
  const [targetAreas, setTargetAreas] = useState([]);
  const [realCardRate, setRealCardRate] = useState(REAL_CARD_RATE_DEFAULT);

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
  }, [targetAreas, realCardRate, allCards, league]);

  if (!targetAreas.length || !calculatedCards.cards)
    return <div>Loading...</div>;

  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    realCardRate,
    setRealCardRate,
    calculatedCards,
    sortedCards,
    allMapVals,
    league
  );
}
