import React from 'react';
import { Link } from 'react-router-dom';

function Home({ disciplines }) {
  return (
    <div>
      <h1>Добро пожаловать в Web App!</h1>
      <p>Выберите дисциплину для просмотра турниров и матчей:</p>
      <ul>
        {disciplines.map(d => (
          <li key={d.disciplineid}>
            <Link to={`/discipline/${d.disciplineid}`}>{d.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;