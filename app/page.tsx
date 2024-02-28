// pages/index.tsx

export async function getServerSideProps() {
  const res = await fetch('/api/calc');
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

const HomePage = ({ data }) => {
  return (
    <div>
      <h1>Wyniki</h1>
      <table>
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Wartość</th>
          </tr>
        </thead>
        <tbody>
          {data && Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HomePage;