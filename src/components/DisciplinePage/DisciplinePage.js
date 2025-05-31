import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './DisciplinePage.css';

const MOCK_DATA = {
  discipline: {
    id: 1,
    name: 'Dota 2',
    tournaments: [
      {
        id: 1,
        name: 'Запланированные турниры',
        matches: [
          {
            id: 101,
            team1: 'Team A',
            team2: 'Team B',
            team1_pic: 'https://example.com/logos/teamA.png',
            team2_pic: 'https://example.com/logos/teamB.png',
            start_time: '2099-12-31T12:00:00Z',
            coefficients: { 'Team A': 1.5, 'Team B': 2.5 },
            status: 'upcoming',
          },
          {
            id: 102,
            team1: 'Team C',
            team2: 'Team D',
            team1_pic: 'https://example.com/logos/teamC.png',
            team2_pic: 'https://example.com/logos/teamD.png',
            start_time: '2099-12-31T15:00:00Z',
            coefficients: { 'Team C': 1.7, 'Team D': 2.0 },
            status: 'upcoming',
          },
        ],
      },
      {
        id: 2,
        name: 'Текущий турнир',
        matches: [
          {
            id: 201,
            team1: 'Team E',
            team2: 'Team F',
            team1_pic: 'https://i1.sndcdn.com/avatars-A5piZQiyadYWOpev-NOlTzQ-t240x240.jpg',
            team2_pic: 'https://i1.sndcdn.com/avatars-GhlsxEkuXiybQtp5-l9j1qw-t240x240.jpg',
            start_time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            coefficients: { 'Team E': 1.9, 'Team F': 1.9 },
            status: 'active',
          },
          {
            id: 202,
            team1: 'Team G',
            team2: 'Team H',
            team1_pic: 'https://example.com/logos/teamG.png',
            team2_pic: 'https://example.com/logos/teamH.png',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            coefficients: { 'Team G': 2.2, 'Team H': 1.6 },
            status: 'finished',
            winner: 'Team H',
          },
          {
            id: 203,
            team1: 'Team I',
            team2: 'Team J',
            team1_pic: 'https://example.com/logos/teamI.png',
            team2_pic: 'https://example.com/logos/teamJ.png',
            start_time: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
            coefficients: { 'Team I': 1.8, 'Team J': 2.0 },
            status: 'upcoming',
          },
        ],
      },
      {
        id: 3,
        name: 'Завершённый турнир (скрыт)',
        matches: [
          {
            id: 301,
            team1: 'Team K',
            team2: 'Team L',
            team1_pic: 'https://example.com/logos/teamK.png',
            team2_pic: 'https://example.com/logos/teamL.png',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            coefficients: { 'Team K': 2.0, 'Team L': 1.8 },
            status: 'finished',
            winner: 'Team L',
          },
          {
            id: 302,
            team1: 'Team M',
            team2: 'Team N',
            team1_pic: 'https://example.com/logos/teamM.png',
            team2_pic: 'https://example.com/logos/teamN.png',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
            coefficients: { 'Team M': 1.9, 'Team N': 2.1 },
            status: 'finished',
            winner: 'Team M',
          },
        ],
      },
    ],
  },
};

const disciplineClassMap = {
  'Dota 2': 'dota2',
  'CS 2': 'cs2',
  'League of Legends': 'lol',
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
      onPlaceBet(match.id, selectedTeam, amount);
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

  const isMatchActive = match.status === 'active';

  return (
    <div className="match">
      {/* Индикатор статуса */}
      <div className={`match-status-dot ${match.status}`} title={`Статус: ${match.status}`} />

      <div className="match-info">
        <span>{match.team1} vs {match.team2}</span>
        <span>Начало: {new Date(match.start_time).toLocaleString()}</span>
        {/* Убираем текст статуса */}
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

function Tournament({ tournament, balance, onPlaceBet }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedMatches = [...tournament.matches].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  return (
    <div className="tournament">
      <h3 className="tournament-header" onClick={() => setIsOpen(!isOpen)}>{tournament.name}</h3>
      {isOpen && sortedMatches.map(match => (
        <Match
          key={match.id}
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
  const { disciplineId } = useParams();
  const discipline = MOCK_DATA.discipline;

  const [bets, setBets] = useLocalStorage('userBets', []);

  const balance = user ? user.balance : 0;

  const tournamentsNotFinished = discipline.tournaments.filter(tournament =>
    tournament.matches.some(match => match.status !== 'finished')
  );

  const sortedTournaments = tournamentsNotFinished.sort((a, b) => {
    const aHasActive = a.matches.some(m => m.status === 'active');
    const bHasActive = b.matches.some(m => m.status === 'active');

    if (aHasActive && !bHasActive) return -1;
    if (!aHasActive && bHasActive) return 1;

    return a.name.localeCompare(b.name);
  });

  const handlePlaceBet = (matchId, team, amount) => {
    if (amount > balance) {
      alert('Недостаточно средств');
      return;
    }
    const newBalance = balance - amount;
    updateBalance(newBalance);
    setBets(prev => [...prev, { matchId, team, amount, date: new Date().toISOString() }]);
    alert(`Ставка принята!`);
  };

  if (!discipline) return <p>Дисциплина не найдена</p>;
  const disciplineClass = disciplineClassMap[discipline.name] || '';
  return (
    <div className="discipline-page">
      <h1 className={`discipline-title ${disciplineClass}`}>
        {discipline.name}
      </h1>

      {sortedTournaments.length === 0 ? (
        <p>Турниры не найдены</p>
      ) : (
        sortedTournaments.map(tournament => (
          <Tournament
            key={tournament.id}
            tournament={tournament}
            balance={balance}
            onPlaceBet={handlePlaceBet}
          />
        ))
      )}
    </div>
  );
}
