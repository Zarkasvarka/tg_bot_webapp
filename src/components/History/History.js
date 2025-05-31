import React from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './History.css';
import { useNavigate } from 'react-router-dom';

const MOCK_DATA = {
  discipline: {
    tournaments: [
      {
        id: 1,
        name: 'Запланированные турниры',
        matches: [
          {
            id: 101,
            team1: 'Team A',
            team2: 'Team B',
            status: 'upcoming',
            coefficients: { 'Team A': 1.5, 'Team B': 2.5 },
          },
          {
            id: 102,
            team1: 'Team C',
            team2: 'Team D',
            status: 'upcoming',
            coefficients: { 'Team C': 1.7, 'Team D': 2.0 },
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
            status: 'active',
            coefficients: { 'Team E': 1.9, 'Team F': 1.9 },
          },
          {
            id: 202,
            team1: 'Team G',
            team2: 'Team H',
            status: 'finished',
            winner: 'Team H',
            coefficients: { 'Team G': 2.2, 'Team H': 1.6 },
          },
          {
            id: 203,
            team1: 'Team I',
            team2: 'Team J',
            status: 'upcoming',
            coefficients: { 'Team I': 1.8, 'Team J': 2.0 },
          },
        ],
      },
    ],
  },
};

const MOCK_BETS = [
  {
    matchId: 201,
    team: 'Team E',
    amount: 100,
    date: '2025-05-25T12:00:00Z',
    coef: 1.9,
  },
  {
    matchId: 202,
    team: 'Team G',
    amount: 50,
    date: '2025-05-20T15:00:00Z',
    coef: 2.2,
  },
  {
    matchId: 202,
    team: 'Team H',
    amount: 75,
    date: '2025-05-21T18:00:00Z',
    coef: 1.6,
  },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2025-05-15T10:00:00Z', description: 'Пополнение баланса', amount: 500 },
  { id: 2, date: '2025-05-18T14:30:00Z', description: 'Пополнение баланса', amount: 1000 },
];

function findMatchAndTournament(matchId) {
  for (const tournament of MOCK_DATA.discipline.tournaments) {
    const match = tournament.matches.find(m => m.id === matchId);
    if (match) {
      return { match, tournament };
    }
  }
  return {};
}

export default function History() {
  const [betsFromStorage] = useLocalStorage('userBets', []);
  const [transactionsFromStorage] = useLocalStorage('userTransactions', []);
  const navigate = useNavigate();

  // Объединяем ставки: если localStorage пуст — используем MOCK_BETS, иначе — реальные + MOCK_BETS (без дубликатов по дате)
  const bets = betsFromStorage.length === 0
    ? MOCK_BETS
    : [...betsFromStorage, ...MOCK_BETS.filter(mb => !betsFromStorage.some(bs => bs.date === mb.date))];

  // Аналогично для транзакций
  const transactions = transactionsFromStorage.length === 0
    ? MOCK_TRANSACTIONS
    : [...transactionsFromStorage, ...MOCK_TRANSACTIONS.filter(mt => !transactionsFromStorage.some(ts => ts.id === mt.id))];

  // Формируем единый массив истории
  const combinedHistory = [
    ...bets.flatMap(bet => {
      const { match, tournament } = findMatchAndTournament(bet.matchId);
      if (!match || !tournament) return [];

      const coef = bet.coef ?? (match.coefficients ? match.coefficients[bet.team] : null);

      const betEntry = {
        id: `bet-${bet.date}`,
        type: 'bet',
        date: bet.date,
        tournamentName: tournament.name,
        team: bet.team,
        coef,
        amount: bet.amount,
        matchStatus: match.status,
        winner: match.winner ?? null,
      };

      if (match.status === 'finished') {
        const win = bet.team === match.winner;
        const resultEntry = {
          id: `result-${bet.date}`,
          type: 'result',
          date: bet.date,
          tournamentName: tournament.name,
          team: bet.team,
          coef,
          amount: bet.amount,
          win,
        };
        return [betEntry, resultEntry];
      }

      return [betEntry];
    }),
    ...transactions.map(tx => ({
      id: `tx-${tx.id}`,
      type: 'transaction',
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
    })),
  ];

  // Сортируем по дате (новые сверху)
  combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate(-1)}></button>
      <h1>История</h1>

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
    </div>
  );
}
