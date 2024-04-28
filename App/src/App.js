import { cards as allCards } from './consts/cards';
import { maps as allMaps } from './consts/maps';
import { Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

const CARD_PRICE_FLOOR_FILTER = 6;
const CARD_WEIGHT_FLOOR_FILTER = 0;
const GLOBAL_DROP_RATE = 7954753;
const AREA_LEVEL = 83;
const USE_FORCE_REMOVE_FILTER = true;
const USE_FORCE_SHOW_FILTER = true;
const FORCE_REMOVE_V_FILTER = new Set([]);
const FORCE_REMOVE_FILTER = new Set([
  'The Easy Stroll',
  'Three Faces in the Dark',
  'The Lunaris Priestess',
  'The Explorer',
  'The Mountain',
  'Boundless Realms',
  'Azure Rage',
  'Left to Fate',
  'Might is Right',
  'Scholar of the Seas',
  'Grave Knowledge',
  'The Wolverine',
  'Blind Venture',
  "Hunter's Resolve",
  "Alivia's Grace",
  'The Admirer',
  'The Surgeon',
  "The Wolf's Shadow",
  'Shard of Fate',
  'Jack in the Box',
  'Last Hope',
  'Mitts',
  'The Battle Born',
  'The Sun',
  'The Demoness',
  'The Sigil',
  'The Twins',
  'The Inoculated',
  'The Army of Blood',
  'The Visionary',
  'The Gladiator',
  "Gemcutter's Promise",
  'The Web',
  "The Sword King's Salute",
  'Boon of Justice',
  'The Penitent',
  'The Warden',
  'The Cache',
  "Lysah's Respite",
  'The Fathomless Depths',
  'The Harvester',
  'The Fox',
  'Volatile Power',
  'The Endurance',
  'The Wolf',
  'Time-Lost Relic',
  'The Rite of Elements',
  'Gift of the Gemling Queen',
  'The Standoff',
  'Prosperity',
  'Heterochromia',
  'The Insatiable',
  'The Incantation',
  'The Betrayal',
  'The Pack Leader',
  'The Oath',
  'Vile Power',
  'The Surveyor',
  'Thunderous Skies',
  'The Tower',
  'The Stormcaller',
  'The Opulent',
  'The Blazing Fire',
  'The Journalist',
  "The Jeweller's Boon",
  'The Survivalist',
  'Glimmer of Hope',
  'Destined to Crumble',
  'The Scholar',
  'Thirst for Knowledge',
  "Emperor's Luck",
  'Loyalty',
  'A Sea of Blue',
  'The Lover',
  "The King's Blade",
  'The Catalyst',
  "Lantador's Lost Love",
  'The Scarred Meadow',
  'Rats',
  'The Witch',
  'Three Voices',
  "The Dragon's Heart",
  'Cursed Words',
]);
const FORCE_SHOW_FILTER = new Set([
  'The Primordial',
  'Coveted Possession',
  'The Chains that Bind',
  'The Union',
  'The Wrath',
  'No Traces',
  'Lingering Remnants',
  "Bowyer's Dream",
  'Draped in Dreams',
  'Immortal Resolve',
  'The Celestial Justicar',
  'The Porcupine',
  'The Innocent',
]);
const REAL_CARD_RATE = { name: 'The Union', number: 38 };
const PINNED_DPI = 61482.640295231180216993095674228;

const isCardInArea = (card, areas) => {
  let val = false;
  areas.forEach((area) => {
    if (
      (card.drop?.max_level ?? 100) >= AREA_LEVEL &&
      (card.drop?.areas ?? []).includes(`MapWorlds${area}`)
    )
      val = true;
  });
  return val;
};

const calculateCardEV = (stack, cardCount, price, useStackScarab) => {
  let ev = 0;
  let drops = cardCount;
  if (useStackScarab) {
    ev = cardCount * 0.2 * stack * price + cardCount * 0.8 * price;
    drops = cardCount * 0.2 * stack + cardCount * 0.8;
  } else {
    ev = cardCount * price;
  }
  return { ev, drops };
};

const getCalculatedCards = (areas) => {
  let totalRawEV = 0;
  let totalStackScarabEV = 0;

  // filter down to cards in map
  const mapCards = allCards.filter((card) => isCardInArea(card, areas));

  // calculate drop pool items
  const mapTotalWeight = mapCards.reduce(
    (acc, card) => acc + (card.weight ?? 0),
    0
  );
  const cardWeightBaseline = allCards.find(
    (card) => card.name === REAL_CARD_RATE.name
  ).weight;
  const currentTotalWeight = mapTotalWeight + GLOBAL_DROP_RATE;
  const dropPoolItems =
    (1 / (cardWeightBaseline / currentTotalWeight)) * REAL_CARD_RATE.number;
  const dpiMultiplier = (PINNED_DPI ?? dropPoolItems) / dropPoolItems;

  // filter all cards based on various conditions
  const filteredCards = mapCards.filter(
    (card) =>
      (card.price >= CARD_PRICE_FLOOR_FILTER &&
        !FORCE_REMOVE_V_FILTER.has(card.name) &&
        (!FORCE_REMOVE_FILTER.has(card.name) || !USE_FORCE_REMOVE_FILTER) &&
        card.weight !== undefined &&
        card.weight > CARD_WEIGHT_FLOOR_FILTER) ||
      (FORCE_SHOW_FILTER.has(card.name) && USE_FORCE_SHOW_FILTER)
  );

  const res = filteredCards.map((card) => {
    // calculate individual card drop rate
    const individualDropRate =
      (card.weight / currentTotalWeight) * dropPoolItems;
    const dropsPerMap = individualDropRate * dpiMultiplier;
    // calculate EVs
    const rawEV = calculateCardEV(card.stack, dropsPerMap, card.price, false);
    totalRawEV += rawEV.ev;
    const ssEV = calculateCardEV(card.stack, dropsPerMap, card.price, true);
    totalStackScarabEV += ssEV.ev;
    return {
      ...card,
      rawDrops: rawEV.drops,
      stackScarabDrops: ssEV.drops,
      rawEV: rawEV.ev,
      stackScarabEV: ssEV.ev,
    };
  });

  return {
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    cards: res,
  };
};

const printDataToHtml = (
  mapTotalWeight,
  dropPoolItems,
  totalRawEV,
  totalStackScarabEV,
  sortedCards,
  allMapVals
) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', overflowX: 'scroll' }}
    >
      <h3>INPUTS</h3>
      <h5>chosen maps:</h5>
      {TARGET_AREAS.map((area, idx) => (
        <span key={idx}>{area}</span>
      ))}
      <br />
      <h5>total map weight: {mapTotalWeight}</h5>
      <h5>
        Pinned drop count: {REAL_CARD_RATE.name} {REAL_CARD_RATE.number}
      </h5>
      <h5>Pinned drop pool item: {PINNED_DPI}</h5>
      <h5>drop pool items: {dropPoolItems}</h5>
      <h5>
        totalEV: {totalRawEV.toFixed(2)} | totalStackScarabEV:{' '}
        {totalStackScarabEV.toFixed(2)}
      </h5>
      <br />
      <h3>SINGLE CARD EVS</h3>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: '250px' }}>
          <h5>Name</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>Price (c)</h5>
        </div>
        <div style={{ minWidth: '75px' }}>
          <h5>EV</h5>
        </div>
        <div style={{ minWidth: '75px' }}>
          <h5>SSEV</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>Drops per map</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>SS Drops per map</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Raw Weight</h5>
        </div>
      </div>
      {sortedCards.map((c, idx) => (
        <div key={idx} style={{ display: 'flex' }}>
          <div style={{ minWidth: '250px' }}>
            <a href={c.ninja} target='_blank'>
              {c.name} ({c.stack})
            </a>
          </div>
          <div style={{ minWidth: '100px' }}>{c.price}</div>
          <div style={{ minWidth: '75px' }}>{c.rawEV.toFixed(2)}</div>
          <div style={{ minWidth: '75px' }}>{c.stackScarabEV.toFixed(2)}</div>
          <div style={{ minWidth: '100px' }}>{c.rawDrops.toFixed(2)}</div>
          <div style={{ minWidth: '100px' }}>
            {c.stackScarabDrops.toFixed(2)}
          </div>
          <div style={{ minWidth: '150px' }}>{c.weight}</div>
        </div>
      ))}
      <br />
      <h3>MAP EVS</h3>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: '200px' }}>
          <h5>Map name</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Raw total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Stack Scarab total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Predicted raw total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Predicted ss total EV</h5>
        </div>
      </div>
      {allMapVals.map((m, idx) => {
        const { name, res, predicted } = m;
        return (
          <div key={idx} style={{ display: 'flex' }}>
            <div style={{ minWidth: '200px' }}>{name}</div>
            <div style={{ minWidth: '150px' }}>{res.totalRawEV.toFixed(2)}</div>
            <div style={{ minWidth: '150px' }}>
              {res.totalStackScarabEV.toFixed(2)}
            </div>
            <div style={{ minWidth: '150px' }}>
              {predicted.totalRawEV.toFixed(2)}
            </div>
            <div style={{ minWidth: '150px' }}>
              {predicted.totalStackScarabEV.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export async function League() {
  const TARGET_AREAS = await fetch(
    'https://poe.stiwoz.cloud/api/league_maps.json'
  ).then((res) => res.json());
  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(TARGET_AREAS);
  const sortedCards = rawCards.sort((a, b) => b.rawEV - a.rawEV);
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map]),
      predicted: getCalculatedCards([...TARGET_AREAS, map]),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals
  );
}

export async function Standard () {
    const TARGET_AREAS = await fetch(
        'https://poe.stiwoz.cloud/api/league_maps.json'
    ).then((res) => res.json());
  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(TARGET_AREAS);
  const sortedCards = rawCards.sort((a, b) => b.rawEV - a.rawEV);
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map]),
      predicted: getCalculatedCards([...TARGET_AREAS, map]),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals
  );
}

export default function App() {
  return (
    <Routes>
      <Route index path='league' element={<League />} />
      <Route path='standard' element={<Standard />} />
      <Route path='*' element={<Navigate to='/league' />} />
    </Routes>
  );
}
