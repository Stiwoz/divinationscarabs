export default function SingleCardEVsTable({ sortedCards, league }) {
  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  return (
    <>
      <h3>Single Card Expected Values</h3>
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
    </>
  );
}
