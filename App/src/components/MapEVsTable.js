export default function MapEVsTable({ allMapVals }) {
  return (
    <>
      <h3>Map Expected Values</h3>
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
    </>
  );
}
