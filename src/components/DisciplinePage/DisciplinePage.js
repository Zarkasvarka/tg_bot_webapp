import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Match({ match }) {
  return (
    <div>
      <h4>{match.team1} vs {match.team2}</h4>
      <p>Дата начала: {new Date(match.start_time).toLocaleString()}</p>
      <p>Коэффициенты:</p>
      <ul>
        {Object.entries(match.coefficients).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}

function Tournament({ tournament }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '10px' }}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <h3>{tournament.name}</h3>
      </div>
      {isOpen && (
        <div>
          {tournament.matches.map(match => (
            <Match key={match.matchid} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function DisciplinePage() {
  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { disciplineId } = useParams();

  const [apiUrl, setApiUrl] = useState(null);

  useEffect(() => {
    if (!apiUrl) return; // ждем, пока apiUrl загрузится

    fetch(`${apiUrl}/api/discipline/${disciplineId}/tournaments`)
      .then(res => res.json())
      .then(data => {
        console.log('Ответ API:', data);
        setDiscipline(data.discipline);
        setTournaments(data.tournaments);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка при загрузке данных:', err);
        setLoading(false);
      });
  }, [apiUrl, disciplineId]);

  if (loading) return <p>Загрузка...</p>;
  if (!discipline) return <p>Дисциплина не найдена</p>;

  return (
    <div>
      <h1>{discipline.name}</h1>
      {tournaments.length === 0 ? (
        <p>Турниры не найдены</p>
      ) : (
        tournaments.map(tournament => (
          <Tournament key={tournament.tournamentid} tournament={tournament} />
        ))
      )}
    </div>
  );
}

export default DisciplinePage;