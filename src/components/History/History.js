import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import './History.css';
import { useNavigate } from 'react-router-dom';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function History() {
  const [user, , isLoading] = useUser();
  const [predictions, setPredictions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !window.Telegram?.WebApp?.initData) {
      navigate('/');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const headers = {
          'Telegram-InitData': window.Telegram.WebApp.initData
        };

        // Получаем историю ставок
        const predRes = await fetch(`${API_URL}/predictions`, { headers });
        if (!predRes.ok) throw new Error('Ошибка загрузки ставок');
        const predData = await predRes.json();
        setPredictions(Array.isArray(predData) ? predData : []);

        // Получаем историю транзакций
        const txRes = await fetch(`${API_URL}/transactions`, { headers });
        if (!txRes.ok) throw new Error('Ошибка загрузки транзакций');
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);

        // Получаем все матчи
        const matchesRes = await fetch(`${API_URL}/matches`);
        if (!matchesRes.ok) throw new Error('Ошибка загрузки матчей');
        const matchesData = await matchesRes.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);

        // Получаем все турниры
        const tournamentsRes = await fetch(`${API_URL}/tournaments`);
        if (!tournamentsRes.ok) throw new Error('Ошибка загрузки турниров');
        const tournamentsData = await tournamentsRes.json();
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);

      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        setPredictions([]);
        setTransactions([]);
        setMatches([]);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Загрузка профиля...</div>;
  }

  // Вспомогательная функция поиска матча и турнира
  function findMatchAndTournament(matchid) {
    const match = matches.find(m => m.matchid === matchid);
    if (!match) return {};
    const tournament = tournaments.find(t => t.tournamentid === match.tournamentid);
    return { match, tournament };
  }

  // Формируем историю с защитой от undefined
  const safePredictions = Array.isArray(predictions) ? predictions : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Формируем единый массив истории
  const combinedHistory = [
    ...safePredictions.flatMap(bet => {
      try {
        const { match, tournament } = findMatchAndTournament(bet.matchid);
        if (!match || !tournament) return [];

        const betEntry = {
          id: `bet-${bet.predictionid}`,
          type: 'bet',
          date: bet.prediction_date,
          tournamentName: tournament.name,
          team: bet.selected_team,
          coef: bet.coefficient_snapshot,
          amount: bet.bet_amount,
          matchStatus: match.status,
          winner: match.result || null,
          status: bet.status,
        };

        // Если матч завершён — добавляем результат
        if (match.status === 'finished') {
          const win = bet.selected_team === match.result;
          const resultEntry = {
            id: `result-${bet.predictionid}`,
            type: 'result',
            date: bet.prediction_date,
            tournamentName: tournament.name,
            team: bet.selected_team,
            coef: bet.coefficient_snapshot,
            amount: bet.bet_amount,
            win,
          };
          return [betEntry, resultEntry];
        }

        return [betEntry];
      } catch (e) {
        return [];
      }
    }),
    ...safeTransactions.map(tx => ({
      id: `tx-${tx.transactionid}`,
      type: 'transaction',
      date: tx.date,
      description: 'Пополнение баланса',
      amount: tx.amount,
    })),
  ];

  // Сортируем по дате (новые сверху)
  combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  const safeCombinedHistory = Array.isArray(combinedHistory) ? combinedHistory : [];

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate(-1)}></button>
      <h1>История</h1>

      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <ul className="history-list">
          {safeCombinedHistory.length === 0 ? (
            <p>История пуста</p>
          ) : (
            safeCombinedHistory.map((item, index) => {
              if (item.type === 'bet') {
                return (
                  <li key={`${item.type}-${item.id}-${index}`} className="history-item">
                    <div className="history-left">
                      <div className="operation-name">Ставка</div>
                      <div className="operation-date">{new Date(item.date).toLocaleString()}</div>
                    </div>
                    <div className="history-tournament">{item.tournamentName}</div>
                    <div className="history-team">{item.team} ({item.coef})</div>
                    <div className={`history-amount waste`}>
                      {item.amount} токенов
                    </div>
                  </li>
                );
              }
              if (item.type === 'result') {
                return (
                  <li key={item.id} className="history-item result-item">
                    <div className="history-left">
                      <div className="operation-name">Итоги матча</div>
                      <div className="operation-date">{new Date(item.date).toLocaleString()}</div>
                    </div>
                    <div className="history-tournament">{item.tournamentName}</div>
                    <div className="history-team">{item.team} ({item.coef})</div>
                    <div className={`history-amount ${item.win ? 'earn' : 'waste'}`}>
                      {item.win ? `${(item.amount * item.coef).toFixed(2)} токенов` : 'неудача'}
                    </div>
                  </li>
                );
              }
              if (item.type === 'transaction') {
                return (
                  <li key={item.id} className="transaction-item">
                    <div className="history-left">
                      <div className="operation-name">{item.description}</div>
                      <div className="operation-date">{new Date(item.date).toLocaleString()}</div>
                    </div>
                    <div className="history-amount earn">+{item.amount} токенов</div>
                  </li>
                );
              }
              return null;
            })
          )}
        </ul>
      )}
    </div>
  );
}
