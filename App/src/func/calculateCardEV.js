export default function calculateCardEV(
  stack,
  cardCount,
  price,
  useStackScarab
) {
  let ev = 0;
  let drops = cardCount;
  if (useStackScarab) {
    ev = cardCount * 0.2 * stack * price + cardCount * 0.8 * price;
    drops = cardCount * 0.2 * stack + cardCount * 0.8;
  } else {
    ev = cardCount * price;
  }
  return { ev, drops };
}
