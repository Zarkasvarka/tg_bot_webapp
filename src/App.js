import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import DisciplinePage from './components/DisciplinePage/DisciplinePage';
import History from './components/History/History';
import Tariffs from './components/Tariffs/Tariffs';
import { useUser } from './hooks/useUser'; // импортируем хук

function App() {
  const [user, setUser] = useUser();
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  useEffect(() => {
    console.log('initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
    console.log('initDataUnsafe.user:', window.Telegram?.WebApp?.initDataUnsafe?.user);
  }, []);

  // Функция обновления баланса
  const updateBalance = (newBalance) => {
    setUser(prevUser => prevUser ? { ...prevUser, balance: newBalance } : prevUser);
  };

  return (
    <>
      {showHeader && user && <Header user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discipline/:disciplineId" element={<DisciplinePage user={user} updateBalance={updateBalance} />} />
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
