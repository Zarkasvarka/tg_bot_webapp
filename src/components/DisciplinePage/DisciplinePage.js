import './DisciplinePage.css';
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function DisciplinePage({ user, onPlaceBet }) {
  const { disciplineId } = useParams();
  const navigate = useNavigate();

  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchesByTournament, setMatchesByTournament] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [discRes, tournRes] = await Promise.all([
          fetch(`${API_URL}/disciplines/${disciplineId}`),
          fetch(`${API_URL}/tournaments?discipline=${disciplineId}`)
        ]);
        const discData = await discRes.json();
        const tournamentsData = await tournRes.json();

        const matchesPromises = tournamentsData.map(t =>
          fetch(`${API_URL}/matches?tournament=${t.tournamentid}`)
        );
        const matchesResponses = await Promise.all(matchesPromises);
        const matchesData = await Promise.all(
          matchesResponses.map(res => res.json())
        );

        const matchesMap = tournamentsData.reduce((acc, t, idx) => {
          acc[t.tournamentid] = matchesData[idx];
          return acc;
        }, {});

        setDiscipline(discData);
        setTournaments(tournamentsData);
        setMatchesByTournament(matchesMap);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplineId]);

  // Класс для заголовка дисциплины
  const getDisciplineClass = () => {
    const classMap = {
      'Counter-Strike 2': 'cs2',
      'Dota 2': 'dota2',
      'League of Legends': 'lol',
      'Valorant': 'valorant',
      'World of Tanks: Blitz': 'wotb',
    };
    return discipline?.name ? classMap[discipline.name] || '' : '';
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="discipline-page">
      <button className="back-btn" onClick={() => navigate(-1)}>Назад</button>
      <div className={`discipline-title ${getDisciplineClass()}`}>
        {discipline?.name}
      </div>
      {tournaments.length === 0 ? (
        <p>Нет турниров</p>
      ) : (
        tournaments.map(tournament => (
          <Tournament
            key={tournament.tournamentid}
            tournament={tournament}
            matches={matchesByTournament[tournament.tournamentid] || []}
            userBalance={user?.balance}
            onPlaceBet={onPlaceBet}
          />
        ))
      )}
    </div>
  );
}

// Турнир-аккордеон
function Tournament({ tournament, matches, userBalance, onPlaceBet }) {
  const [isOpen, setIsOpen] = useState(false);

  // Сортировка матчей по времени
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  return (
    <div className="tournament">
      <div className="tournament-header" onClick={() => setIsOpen(!isOpen)}>
        {tournament.name}
      </div>
      {isOpen && (
        <div>
          {sortedMatches.map(match => (
            <Match
              key={match.matchid}
              match={match}
              userBalance={userBalance}
              onPlaceBet={onPlaceBet}
              tournamentName={tournament.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Карточка матча
function Match({ match, userBalance, onPlaceBet, tournamentName }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="match">
      <div className={`match-status-dot ${match.status}`}></div>
      <div className="match-info">
        <div>
          {match.team1} vs {match.team2}
        </div>
        <div>
          {new Date(match.start_time).toLocaleString()}
        </div>
      </div>
      <button
        className="bet-open-button"
        onClick={() => setShowModal(true)}
        disabled={match.status !== 'upcoming' || userBalance < match.min_bet}
      >
        Ставка
      </button>
      {showModal && (
        <BetModal
          match={match}
          onClose={() => setShowModal(false)}
          onPlaceBet={onPlaceBet}
          tournamentName={tournamentName}
          balance={userBalance}
        />
      )}
    </div>
  );
}

// Модальное окно для ставки
function BetModal({ match, onClose, onPlaceBet, tournamentName, balance }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const handlePlaceBet = () => {
    if (typeof onPlaceBet !== 'function') {
      alert('Ошибка системы!');
      return;
    }
    if (!selectedTeam || !betAmount) return;
    const coefficient = match.coefficients[selectedTeam];
    if (!coefficient) {
      alert('Ошибка коэффициента');
      return;
    }
    onPlaceBet(match.matchid, selectedTeam, betAmount, coefficient);
    onClose();
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
              {match.team1_pic && (
                <img src={match.team1_pic} alt={match.team1} className="team-logo" />
              )}
              <div className="team-coef">
                <span>{match.coefficients[match.team1]}</span>
                <button
                  className={selectedTeam === match.team1 ? 'selected' : ''}
                  type="button"
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
              {match.team2_pic && (
                <img src={match.team2_pic} alt={match.team2} className="team-logo" />
              )}
              <div className="team-coef">
                <span>{match.coefficients[match.team2]}</span>
                <button
                  className={selectedTeam === match.team2 ? 'selected' : ''}
                  type="button"
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
              min={match.min_bet}
              max={balance}
            />
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!selectedTeam || !betAmount}
            >
              Поставить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}