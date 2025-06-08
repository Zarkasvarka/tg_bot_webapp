import React, { useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import DisciplinePage from './components/DisciplinePage/DisciplinePage';
import History from './components/History/History';
import Tariffs from './components/Tariffs/Tariffs';
import { useUser } from './hooks/useUser';

function App() {
  const [user, setUser, isLoading] = useUser();
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  // Обработчик ставки
  const handlePlaceBet = useCallback(
    async (matchId, team, amount, coefficient) => {
      try {
        if (!matchId || !team || !amount || !coefficient) {
          throw new Error('Некорректные параметры ставки');
        }
        const numericAmount = Number(amount);
        const numericCoef = Number(coefficient);

        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error('Сумма ставки должна быть положительным числом');
        }
        if (isNaN(numericCoef) || numericCoef < 1) {
          throw new Error('Некорректный коэффициент');
        }
        if (user?.balance < numericAmount) {
          throw new Error('Недостаточно средств для ставки');
        }

        setUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            balance: prevUser.balance - numericAmount
          };
        });

        // Отправление ставку на сервер
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/predictions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Telegram-InitData': window.Telegram.WebApp.initData,
            },
            body: JSON.stringify({
              matchid: matchId,
              bet_amount: numericAmount,
              selected_team: team,
              coefficient_snapshot: numericCoef,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Неизвестная ошибка');

        if (typeof data.newBalance === 'number') {
          setUser(prevUser => {
            if (!prevUser) return prevUser;
            return {
              ...prevUser,
              balance: data.newBalance
            };
          });
        }

        alert('Ставка принята!');
      } catch (error) {
        console.error('Full error object:', error);
        alert(error?.message || error?.toString() || 'Неизвестная ошибка');
      }
    },
    [user, setUser]
  );

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <>
      {showHeader && user && <Header user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/discipline/:disciplineId"
          element={
            <DisciplinePage
              user={user}
              onPlaceBet={handlePlaceBet}
            />
          }
        />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/tariffs" element={<Tariffs user={user} />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
