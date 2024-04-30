import Footer from '../components/Footer';
import Header from '../components/Header';
import { GLOBAL_DROP_RATE } from '../consts/data';

export default function printDataToHtml(
  targetAreas,
  setTargetAreas,
  realCardRate,
  setRealCardRate,
  calculatedCards,
  sortedCards,
  allMapVals,
  league
) {
  const { mapTotalWeight, dropPoolItems, totalRawEV, totalStackScarabEV } =
    calculatedCards;
  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  const poeNinjaUrl = league === 'standard' ? 'standard' : 'challenge';

  return (
    <>
      <Header league={league} />
      <h3>INPUTS</h3>
      <h5>Chosen maps:</h5>
      <textarea
        placeholder='Enter maps here, one per line, with no spaces (e.g. DefiledCathedral)'
        rows={targetAreas.length}
        value={targetAreas.join('\n')}
        onChange={(e) => setTargetAreas(e.target.value.split('\n'))}
      ></textarea>

      <form>
        <div>
          Pinned drop count card:{' '}
          <a
            href={`https://poe.ninja/${poeNinjaUrl}/divination-cards/${realCardRate.name
              .toLowerCase()
              .replace(' ', '-')}`}
            target='_blank'
          >
            {realCardRate.name} (
            {(realCardRate.name == 'The Union' && 7) ||
              (realCardRate.name == 'The Gambler' && 5)}
            )
          </a>
          <br />
          <div className='radio-wrapper'>
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
          </div>
          Pinned drop count ammount:&nbsp;
          <input
            type='number'
            id='rate_number'
            name='rate_number'
            min='1'
            value={realCardRate.number}
            onChange={(e) =>
              setRealCardRate({ ...realCardRate, number: e.target.value })
            }
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
      <Footer />
    </>
  );
}