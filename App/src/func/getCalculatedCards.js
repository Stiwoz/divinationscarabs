import calculateCardEV from './calculateCardEV';
import isCardInArea from './isCardInArea';
import {
  CARD_PRICE_FLOOR_FILTER,
  CARD_WEIGHT_FLOOR_FILTER,
  FORCE_REMOVE_V_FILTER,
  FORCE_SHOW_FILTER,
  GLOBAL_DROP_RATE,
  USE_FORCE_SHOW_FILTER,
} from '../consts/data';

export default function getCalculatedCards(
  areas,
  allCards,
  league,
  realCardRate
) {
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
    (card) => card.name === realCardRate.name
  ).weight;
  const currentTotalWeight = mapTotalWeight + GLOBAL_DROP_RATE;
  const dropPoolItems =
    (1 / (cardWeightBaseline / currentTotalWeight)) * realCardRate.number;

  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  // filter all cards based on various conditions
  const filteredCards = mapCards.filter(
    (card) =>
      (card[priceLabel] >= CARD_PRICE_FLOOR_FILTER &&
        !FORCE_REMOVE_V_FILTER.has(card.name) &&
        card.weight !== undefined &&
        card.weight > CARD_WEIGHT_FLOOR_FILTER) ||
      (FORCE_SHOW_FILTER.has(card.name) && USE_FORCE_SHOW_FILTER)
  );

  const res = filteredCards.map((card) => {
    // calculate individual card drop rate
    const individualDropRate =
      (card.weight / currentTotalWeight) * dropPoolItems;
    // calculate EVs
    const rawEV = calculateCardEV(
      card.stack,
      individualDropRate,
      card[priceLabel],
      false
    );
    totalRawEV += rawEV.ev;
    const ssEV = calculateCardEV(
      card.stack,
      individualDropRate,
      card[priceLabel],
      true
    );
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
}
