import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DisciplinePage.css';

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

  const handleBetSubmission = async (matchId, team, amount, coefficient) => {
    if (typeof onPlaceBet !== 'function') {
      alert('Системная ошибка. Попробуйте позже.');
      return;
    }
    try {
      await onPlaceBet(matchId, team, amount, coefficient);
    } catch (error) {
      alert(error.message);
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
          matches={matchesByTournament[tournament.tournamentid] || []}
          onPlaceBet={handleBetSubmission}
          userBalance={user?.balance}
        />
      ))}
    </div>
  );
}

// Компонент турнира с аккордеоном
function Tournament({ tournament, matches, onPlaceBet, userBalance }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tournament-section">
      <h2 className="tournament-header" onClick={() => setIsOpen(!isOpen)}>
        {tournament.name}
      </h2>
      
      {isOpen && (
        <div className="matches-container">
          {matches.map(match => (
            <Match
              key={match.matchid}
              match={match}
              onPlaceBet={onPlaceBet}
              userBalance={userBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент матча
function Match({ match, onPlaceBet, userBalance }) {
  const [showBetModal, setShowBetModal] = useState(false);

  return (
    <div className="match-card">
      <div className="teams">
        <span>{match.team1}</span>
        <span className="vs">vs</span>
        <span>{match.team2}</span>
      </div>

      <button 
        className="bet-btn"
        onClick={() => setShowBetModal(true)}
        disabled={userBalance < match.min_bet}
      >
        Сделать ставку
      </button>

      {showBetModal && (
        <BetModal
          match={match}
          onClose={() => setShowBetModal(false)}
          onPlaceBet={onPlaceBet}
          balance={userBalance}
        />
      )}
    </div>
  );
}

// Модальное окно ставки
function BetModal({ match, onClose, onPlaceBet, balance }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [betAmount, setBetAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (typeof onPlaceBet !== 'function') {
      alert('Ошибка системы!');
      return;
    }

    if (!selectedTeam || !betAmount) return;
    
    const coefficient = match.coefficients[selectedTeam];
    if (!coefficient) {
      alert('Выберите команду');
      return;
    }

    onPlaceBet(match.matchid, selectedTeam, betAmount, coefficient);
    onClose();
  };

  return (
    <div className="bet-modal-overlay">
      <div className="bet-modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h3>{match.team1} vs {match.team2}</h3>
        
        <div className="coefficients">
          {Object.entries(match.coefficients).map(([team, coef]) => (
            <button
              key={team}
              className={`team-btn ${selectedTeam === team ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team)}
            >
              {team} ({coef})
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            min={match.min_bet}
            max={balance}
            placeholder="Сумма ставки"
          />
          
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
