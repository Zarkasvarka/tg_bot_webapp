//import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import DisciplinePage from './components/DisciplinePage/DisciplinePage';
import History from './components/History/History';
import Tariffs from './components/Tariffs/Tariffs';
import { useUser } from './hooks/useUser'; // импортируем хук

// App.js
function App() {
  const [user, setUser] = useUser();
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  // Логика ставок
  const handlePlaceBet = async (matchId, team, amount, coefficient) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Telegram-InitData': window.Telegram.WebApp.initData
        },
        body: JSON.stringify({
          matchid: matchId,
          bet_amount: amount,
          selected_team: team,
          coefficient_snapshot: coefficient
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Ошибка при ставке');
        return;
      }

      // Обновляем баланс
      const newBalance = user.balance - amount;
      setUser(prev => ({ ...prev, balance: newBalance }));
      alert('Ставка принята!');

    } catch (error) {
      alert('Ошибка сети');
    }
  };

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
              onPlaceBet={handlePlaceBet} // Передаем обработчик
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
