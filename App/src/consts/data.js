export const CARD_PRICE_FLOOR_FILTER = 4;
export const CARD_WEIGHT_FLOOR_FILTER = 0;
export const GLOBAL_DROP_RATE = [
  // https://poedb.tw/us/GameConstants#DropPool
  2825364, 1122958, 376224, 437000, 562000, 499000, 125000, 62000, 125000,
  125000, 600000, 260000, 323077, 210000, 10000, 55919, 19081, 0, 0, 27560, 0,
  0, 0, 141538, 20000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8000, 2000, 160,
  62000, 0, 1378, 14000, 0, 0, 0, 0, 0, 0, 12800, 150, 0, 0, 0, 0,
].reduce((acc, cur) => acc + cur, 0);
export const AREA_LEVEL = 83;
export const USE_FORCE_SHOW_FILTER = true;
export const FORCE_REMOVE_V_FILTER = new Set([]);
export const FORCE_SHOW_FILTER = new Set([
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
  'Fire Of Unknown Origin',
  'The Innocent',
]);
export const REAL_CARD_RATE_DEFAULT = { name: 'The Union', number: 38 };
export const PINNED_DPI = 61482.640295231180216993095674228;
