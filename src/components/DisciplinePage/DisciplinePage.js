import { useLocalStorage } from '../../hooks/useLocalStorage';
import './DisciplinePage.css';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const disciplineClassMap = {
  'Counter-Strike 2': 'dota2',
  'Dota 2': 'cs2',
  'League of Legends': 'lol',
  'Valorant': 'valorant',
  'World of Tanks: Blitz': 'wotb',
  // и так далее
};

function BetModal({ tournamentName, match, balance, onClose, onPlaceBet }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const handlePlaceBet = () => {
    const amount = Number(betAmount);
    if (!selectedTeam) {
      alert('Выберите команду для ставки');
      return;
    }
    if (!amount || amount <= 0) {
      alert('Введите корректную сумму ставки');
      return;
    }
    if (amount > balance) {
      alert('Сумма ставки не может превышать ваш баланс');
      return;
    }
    if (window.confirm(`Подтвердите ставку: ${amount} токенов на ${selectedTeam}`)) {
      onPlaceBet(match.matchid, selectedTeam, amount);
      onClose();
    }
  };

  return (
    <div className="bet-modal-overlay" onClick={onClose}>
      <div className="bet-modal" onClick={e => e.stopPropagation()}>
        <div className="bet-modal-header">
          <h3>{tournamentName}</h3>
          <button className="bet-modal-close" onClick={onClose} aria-label="Закрыть окно">&times;</button>
        </div>
        <div className="bet-modal-body">
          <div className="teams-row">
            <div className="team-block">
              <div className="team-name">{match.team1}</div>
              <img src={match.team1_pic} alt={match.team1} className="team-logo" />
              <div className="team-coef">
                <span>{match.coefficients[match.team1]}</span>
                <button
                  className={selectedTeam === match.team1 ? 'selected' : ''}
                  onClick={() => setSelectedTeam(match.team1)}
                >
                  Выбрать
                </button>
              </div>
            </div>

            <div className="match-time">
              <div className="date-small">
                {new Date(match.start_time).toLocaleDateString([], { day: '2-digit', month: 'long' })}
              </div>
              <div className="time-large">
                {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="team-block">
              <div className="team-name">{match.team2}</div>
              <img src={match.team2_pic} alt={match.team2} className="team-logo" />
              <div className="team-coef">
                <span>{match.coefficients[match.team2]}</span>
                <button
                  className={selectedTeam === match.team2 ? 'selected' : ''}
                  onClick={() => setSelectedTeam(match.team2)}
                >
                  Выбрать
                </button>
              </div>
            </div>
          </div>
          <div className="bet-input-row">
            <input
              type="number"
              placeholder="Сумма ставки"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              min="1"
              max={balance}
            />
            <button onClick={handlePlaceBet} disabled={!selectedTeam || !betAmount}>Поставить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Match({ match, tournamentName, balance, onPlaceBet }) {
  const [betOpen, setBetOpen] = useState(false);

  const isMatchActive = match.status === 'upcoming';

  return (
    <div className="match">
      <div className={`match-status-dot ${match.status}`} title={`Статус: ${match.status}`} />

      <div className="match-info">
        <span>{match.team1} vs {match.team2}</span>
        <span>Начало: {new Date(match.start_time).toLocaleString()}</span>
      </div>
      <button
        disabled={!isMatchActive}
        onClick={() => setBetOpen(true)}
        className="bet-open-button"
      >
        Ставка
      </button>

      {betOpen && (
        <BetModal
          tournamentName={tournamentName}
          match={match}
          balance={balance}
          onClose={() => setBetOpen(false)}
          onPlaceBet={onPlaceBet}
        />
      )}
    </div>
  );
}

function Tournament({ tournament, matches, balance, onPlaceBet}) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  return (
    <div className="tournament">
      <h3 className="tournament-header" onClick={() => setIsOpen(!isOpen)}>{tournament.name}</h3>
      {isOpen && sortedMatches.map(match => (
        <Match
          key={match.matchid}
          match={match}
          tournamentName={tournament.name}
          balance={balance}
          onPlaceBet={onPlaceBet}
        />
      ))}
    </div>
  );
}

export default function DisciplinePage({ user, updateBalance }) {
  const { id } = useParams(); // disciplineId из URL
  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchesByTournament, setMatchesByTournament] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Для ставок
  const [, setBets] = useLocalStorage('userBets', []);
  const balance = user ? user.balance : 0;

  // Получаем дисциплину
  useEffect(() => {
    console.log("discipline id from URL:", id);
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        // 1. Получаем дисциплину
        const discRes = await fetch(`${API_URL}/disciplines/${id}`);
        if (!discRes.ok) throw new Error('Ошибка загрузки дисциплины');
        const disciplineData = await discRes.json();
        setDiscipline(disciplineData);

        // 2. Получаем турниры этой дисциплины
        const tournRes = await fetch(`${API_URL}/tournaments?disciplineid=${id}`);
        const tournamentsData = await tournRes.json();
        setTournaments(tournamentsData);

        // 3. Для каждого турнира получаем матчи
        const matchesObj = {};
        for (const t of tournamentsData) {
          const matchRes = await fetch(`${API_URL}/matches?tournamentid=${t.tournamentid}`);
          matchesObj[t.tournamentid] = await matchRes.json();
        }
        setMatchesByTournament(matchesObj);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Ставка
  const handlePlaceBet = async (matchId, team, amount, coefficient) => {
    if (amount > balance) {
      alert('Недостаточно средств');
      return;
    }

    // Отправляем ставку на backend
    try {
      const res = await fetch(`${API_URL}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramid: user.telegramid,
          matchid: matchId,
          bet_amount: amount,
          selected_team: team,
          coefficient_snapshot: coefficient
        })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Ошибка при ставке');
        return;
      }
      // Обновляем баланс на фронте
      updateBalance(balance - amount);
      setBets(prev => [...prev, { matchId, team, amount, date: new Date().toISOString() }]);
      alert('Ставка принята!');
    } catch (err) {
      alert('Ошибка при отправке ставки');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!discipline) return <p>Дисциплина не найдена</p>;

  // Для стилей
  const disciplineClass = disciplineClassMap[discipline.name] || '';

  // Оставляем только турниры, где есть не завершённые матчи
  const tournamentsNotFinished = tournaments.filter(tournament =>
    (matchesByTournament[tournament.tournamentid] || []).some(match => match.status !== 'finished')
  );

  // Сортировка турниров (активные выше)
  const sortedTournaments = tournamentsNotFinished.sort((a, b) => {
    const aHasActive = (matchesByTournament[a.tournamentid] || []).some(m => m.status === 'upcoming');
    const bHasActive = (matchesByTournament[b.tournamentid] || []).some(m => m.status === 'upcoming');
    if (aHasActive && !bHasActive) return -1;
    if (!aHasActive && bHasActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="discipline-page">
      <h1 className={`discipline-title ${disciplineClass}`}>
        {discipline.name}
      </h1>
      <p>{discipline.description}</p>

      {sortedTournaments.length === 0 ? (
        <p>Турниры не найдены</p>
      ) : (
        sortedTournaments.map(tournament => (
          <Tournament
            key={tournament.tournamentid}
            tournament={tournament}
            matches={matchesByTournament[tournament.tournamentid] || []}
            balance={balance}
            onPlaceBet={handlePlaceBet}
          />
        ))
      )}
    </div>
  );
}