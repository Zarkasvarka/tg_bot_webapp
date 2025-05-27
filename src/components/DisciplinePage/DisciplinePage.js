import React, { useState, useEffect } from 'react';

function Match({ match }) {
  return (
    <div style={{ paddingLeft: '20px', borderBottom: '1px solid #ccc' }}>
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
      <div
        style={{ cursor: 'pointer', backgroundColor: '#eee', padding: '10px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
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

function DisciplinePage({ disciplineId }) {
  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/discipline/${disciplineId}/tournaments`)
      .then(res => res.json())
      .then(data => {
        setDiscipline(data.discipline);
        setTournaments(data.tournaments);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [disciplineId]);

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