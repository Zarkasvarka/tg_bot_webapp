import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [disciplines, setDisciplines] = useState([]);

  // Загрузка дисциплин (пример с мок-данными)
  useEffect(() => {
    const mockDisciplines = [
      { disciplineid: 1, name: 'CS:GO' },
      { disciplineid: 2, name: 'Dota 2' },
    ];
    setDisciplines(mockDisciplines);
  }, []);

  return (
    <div className="home-container">
      <h1>Добро пожаловать в Web App!</h1>
      <p>Выберите дисциплину для просмотра турниров и матчей:</p>
      {disciplines.length === 0 ? (
        <p>Нет доступных дисциплин.</p>
      ) : (
        <ul className="disciplines-list">
          {disciplines.map((d) => (
            <li key={d.disciplineid} className="discipline-item">
              <Link 
                to={`/discipline/${d.disciplineid}`} 
                className="discipline-link"
              >
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;