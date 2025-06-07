import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DisciplinePage.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function DisciplinePage({ user, onPlaceBet }) {
  const { disciplineId } = useParams();
  const navigate = useNavigate();

  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных дисциплины и турниров
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [discRes, tournsRes] = await Promise.all([
          fetch(`${API_URL}/disciplines/${disciplineId}`),
          fetch(`${API_URL}/tournaments?discipline=${disciplineId}`)
        ]);
        const discData = await discRes.json();
        const tournsData = await tournsRes.json();

        setDiscipline(discData);
        setTournaments(tournsData);

        // Загрузка матчей для каждого турнира
        const matchesPromises = tournsData.map(t =>
          fetch(`${API_URL}/matches?tournament=${t.tournamentid}`)
        );
        const matchesResponses = await Promise.all(matchesPromises);
        const matchesData = await Promise.all(
          matchesResponses.map(res => res.json())
        );
        const matchesMap = tournsData.reduce((acc, t, idx) => {
          acc[t.tournamentid] = matchesData[idx];
          return acc;
        }, {});
        setMatches(matchesMap);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId]);

  // Обработчик ставки с валидацией
  const handleBetSubmission = async (matchId, team, amount, coefficient) => {
    if (!user?.balance || amount > user.balance) {
      alert('Недостаточно средств');
      return;
    }
    if (!coefficient || coefficient < 1) {
      alert('Некорректный коэффициент');
      return;
    }
    try {
      await onPlaceBet(matchId, team, Number(amount), Number(coefficient));
      setSelectedMatch(null);
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="discipline-page">
      <button className="back-btn" onClick={() => navigate(-1)}>Назад</button>
      <h1>{discipline?.name}</h1>
      {tournaments.map(tournament => (
        <Tournament
          key={tournament.tournamentid}
          tournament={tournament}
          matches={matches[tournament.tournamentid] || []}
          onSelectMatch={setSelectedMatch}
          userBalance={user?.balance}
        />
      ))}
      {selectedMatch && (
        <BetModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onPlaceBet={handleBetSubmission}
          balance={user?.balance}
        />
      )}
    </div>
  );
}

// Компонент турнира
function Tournament({ tournament, matches, onSelectMatch, userBalance }) {
  return (
    <div className="tournament-section">
      <h2>{tournament.name}</h2>
      <div className="matches-grid">
        {matches.map(match => (
          <Match
            key={match.matchid}
            match={match}
            onSelect={onSelectMatch}
            userBalance={userBalance}
          />
        ))}
      </div>
    </div>
  );
}

// Компонент матча
function Match({ match, onSelect, userBalance }) {
  const coefficients = match.coefficients || {};
  return (
    <div className="match-card">
      <div className="teams">
        <span>{match.team1}</span>
        <span className="vs">vs</span>
        <span>{match.team2}</span>
      </div>
      <div className="match-info">
        <div className="coefficients">
          {Object.entries(coefficients).map(([team, coef]) => (
            <button
              key={team}
              className="coef-btn"
              onClick={() => onSelect(match)}
              disabled={userBalance < match.min_bet}
            >
              {team}: {coef}
            </button>
          ))}
        </div>
        <div className="match-footer">
          <span>Мин. ставка: {match.min_bet}</span>
          <span>{new Date(match.start_time).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// BetModal определён прямо здесь
function BetModal({ match, onClose, onPlaceBet, balance }) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeam || !betAmount) return;
    const coefficient = match.coefficients[selectedTeam];
    if (!coefficient) {
      alert('Выберите команду для ставки');
      return;
    }
    onPlaceBet(match.matchid, selectedTeam, betAmount, coefficient);
  };

  return (
    <div className="bet-modal-overlay">
      <div className="bet-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{match.team1} vs {match.team2}</h3>
        <form onSubmit={handleSubmit}>
          <div className="team-select">
            {Object.keys(match.coefficients).map(team => (
              <label key={team}>
                <input
                  type="radio"
                  name="team"
                  value={team}
                  onChange={() => setSelectedTeam(team)}
                />
                {team} ({match.coefficients[team]})
              </label>
            ))}
          </div>
          <div className="bet-amount">
            <label>
              Сумма ставки:
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                min={match.min_bet}
                max={balance}
                step="1"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={!selectedTeam || !betAmount}
          >
            Подтвердить
          </button>
        </form>
      </div>
    </div>
  );
}
