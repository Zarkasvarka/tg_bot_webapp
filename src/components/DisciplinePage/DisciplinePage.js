import './DisciplinePage.css';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Модальное окно для ставки
function BetModal({ tournamentName, match, balance, onClose, onPlaceBet }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const handlePlaceBet = () => {
    if (!selectedTeam) return;
    const coefficient = match.coefficients[selectedTeam];
    if (!coefficient) {
      alert('Ошибка коэффициента');
      return;
    }
    const amount = Number(betAmount);
    if (!amount || amount < 1) return;
    onPlaceBet(match.matchid, selectedTeam, amount, coefficient);
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
              min="1"
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

// Компонент одного матча
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
        type="button"
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

// Компонент турнира (аккордеон)
function Tournament({ tournament, matches, balance, onPlaceBet }) {
  const [isOpen, setIsOpen] = useState(false);

  // Сортируем матчи по дате
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  return (
    <div className="tournament">
      <h3 className="tournament-header" onClick={() => setIsOpen(!isOpen)}>
        {tournament.name}
      </h3>
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

// Главный компонент страницы дисциплины
export default function DisciplinePage({ user, onPlaceBet }) {
  const { disciplineId } = useParams();
  const [discipline, setDiscipline] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [matchesByTournament, setMatchesByTournament] = useState({});
  const [loading, setLoading] = useState(true);

  const balance = user?.balance || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Загрузка данных дисциплины
        const [discRes, tournRes] = await Promise.all([
          fetch(`${API_URL}/disciplines/${disciplineId}`),
          fetch(`${API_URL}/tournaments?disciplineid=${disciplineId}`)
        ]);
        if (!discRes.ok || !tournRes.ok) throw new Error("Ошибка загрузки данных");

        const disciplineData = await discRes.json();
        const tournamentsData = await tournRes.json();

        setDiscipline(disciplineData);
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);

        // 2. Загрузка матчей для каждого турнира
        const matchesPromises = (Array.isArray(tournamentsData) ? tournamentsData : []).map(async (t) => {
          const res = await fetch(`${API_URL}/matches?tournamentid=${t.tournamentid}`);
          return res.ok ? res.json() : [];
        });

        const matchesResults = await Promise.all(matchesPromises);
        const matchesMap = (Array.isArray(tournamentsData) ? tournamentsData : []).reduce((acc, t, index) => {
          acc[t.tournamentid] = Array.isArray(matchesResults[index]) ? matchesResults[index] : [];
          return acc;
        }, {});

        setMatchesByTournament(matchesMap);
      } catch (error) {
        console.error("Ошибка:", error);
        setTournaments([]);
        setMatchesByTournament({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [disciplineId]);

  // Генерация класса для стилизации заголовка дисциплины
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

  // Функция для получения ближайшей даты матча в турнире
  const getNearestMatchDate = (tournamentId) => {
    const matches = matchesByTournament[tournamentId] || [];
    const upcomingMatches = matches.filter(m => m.status !== 'finished');
    if (!upcomingMatches.length) return Infinity; // Турниры без матчей в конец
    return Math.min(...upcomingMatches.map(m => new Date(m.start_time).getTime()));
  };

  // Фильтрация и сортировка турниров по дате ближайшего матча
  const processedTournaments = tournaments
    .filter(t => {
      const matches = matchesByTournament[t.tournamentid] || [];
      return matches.some(m => m.status !== 'finished');
    })
    .sort((a, b) => {
      const aDate = getNearestMatchDate(a.tournamentid);
      const bDate = getNearestMatchDate(b.tournamentid);
      return aDate - bDate; // Сначала ближайшие
    });

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!discipline) return <div>Дисциплина не найдена</div>;

  return (
    <div className={`discipline-page`}>
      <div className={`discipline-title ${getDisciplineClass()}`}>
        {discipline.name}
      </div>
      {processedTournaments.length === 0 ? (
        <p>Нет активных турниров</p>
      ) : (
        processedTournaments.map(tournament => (
          <Tournament
            key={tournament.tournamentid}
            tournament={tournament}
            matches={matchesByTournament[tournament.tournamentid] || []}
            balance={balance}
            onPlaceBet={onPlaceBet}
          />
        ))
      )}
    </div>
  );
}
  