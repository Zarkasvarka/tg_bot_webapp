import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
//import { useLocalStorage } from '../../hooks/useLocalStorage';
import './History.css';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://tg-bot-741h.onrender.com/api";

export default function History() {
  const [user] = useUser();
  const [predictions, setPredictions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Получаем историю ставок
        const predRes = await fetch(`${API_URL}/predictions?telegramid=${user.telegramid}`);
        const predData = await predRes.json();
        setPredictions(predData);

        // Получаем историю транзакций
        const txRes = await fetch(`${API_URL}/transactions?telegramid=${user.telegramid}`);
        const txData = await txRes.json();
        setTransactions(txData);

        // Получаем все матчи (чтобы сопоставлять id)
        const matchesRes = await fetch(`${API_URL}/matches`);
        const matchesData = await matchesRes.json();
        setMatches(matchesData);

        // Получаем все турниры (чтобы сопоставлять id)
        const tournamentsRes = await fetch(`${API_URL}/tournaments`);
        const tournamentsData = await tournamentsRes.json();
        setTournaments(tournamentsData);

      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

    // Вспомогательные функции для поиска матча и турнира по id
  function findMatchAndTournament(matchid) {
    const match = matches.find(m => m.matchid === matchid);
    if (!match) return {};
    const tournament = tournaments.find(t => t.tournamentid === match.tournamentid);
    return { match, tournament };
  }

  // Формируем единый массив истории
  const combinedHistory = [
    ...predictions.flatMap(bet => {
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
    }),
    ...transactions.map(tx => ({
      id: `tx-${tx.transactionid}`,
      type: 'transaction',
      date: tx.date,
      description: 'Пополнение баланса',
      amount: tx.amount,
    })),
  ];

  // Сортируем по дате (новые сверху)
  combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate(-1)}></button>
      <h1>История</h1>

      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <ul className="history-list">
          {combinedHistory.length === 0 ? (
            <p>История пуста</p>
          ) : (
            combinedHistory.map(item => {
              if (item.type === 'bet') {
                return (
                  <li key={item.id} className="history-item">
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