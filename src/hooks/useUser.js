import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;

    fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
      headers: { 'Telegram-InitData': window.Telegram.WebApp.initData }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки пользователя');
        return res.json();
      })
      .then(data => setUser({
        avatarUrl: data.avatar,
        nickname: data.username || 'Гость',
        balance: data.balance,
        telegramid: data.telegramId
      }))
      .catch(error => {
        console.error('Ошибка:', error);
        setUser(null);
      });
  }, []);

  return [user, setUser];
}

