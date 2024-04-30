import { GLOBAL_DROP_RATE } from '../consts/data';

export default function DataInput({
  mapCards,
  targetAreas,
  realCardRate,
  calculatedCards,
  setRealCardRate,
  setRealCardRateQt,
  setTargetAreas,
  league,
}) {
  const { mapTotalWeight, dropPoolItems, totalRawEV, totalStackScarabEV } =
    calculatedCards;
  const poeNinjaUrl = league === 'standard' ? 'standard' : 'challenge';

  return (
    <>
      <h3>Chosen maps</h3>
      <textarea
        placeholder='Enter maps here, one per line, with no spaces (e.g. DefiledCathedral)'
        rows={targetAreas.length}
        value={targetAreas.join('\n')}
        onChange={(e) => setTargetAreas(e.target.value.split('\n'))}
      ></textarea>

      <form>
        Pinned drop count card:{' '}
        <a
          href={`https://poe.ninja/${poeNinjaUrl}/divination-cards/${realCardRate.name
            .toLowerCase()
            .replace(' ', '-')}`}
          target='_blank'
        >
          {realCardRate.name} ({realCardRate.stack})
        </a>
        <br />
        Select another card:&nbsp;
        <select
          id='card_rate_name'
          name='card_rate_name'
          value={realCardRate.name}
          onChange={setRealCardRate}
        >
          {mapCards.map((card) => (
            <option key={card.name} value={card.name}>
              {card.name}
            </option>
          ))}
        </select>
        <br />
        Pinned drop count ammount:&nbsp;
        <input
          type='number'
          id='rate_number'
          name='rate_number'
          min='1'
          value={realCardRate.number}
          onChange={setRealCardRateQt}
        />
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
      </form>
    </>
  );
}
