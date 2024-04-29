import { AREA_LEVEL } from "../consts/data";

export default function isCardInArea ( card, areas ) {
  let val = false;
  areas.forEach((area) => {
    if (
        (card.drop?.max_level ?? 100) >= AREA_LEVEL &&
        ( card.drop?.areas ?? [] ).includes( `MapWorlds${ area }` ) &&
        !card.disabled
    )
      val = true;
  });
  return val;
}
