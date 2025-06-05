import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;

    if (!initData) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
      headers: { 'Telegram-InitData': initData }
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        setUser({
          avatarUrl: data.avatar,
          nickname: data.username || 'Гость',
          balance: data.balance,
          telegramid: data.telegramId
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки пользователя:', error);
        setUser(null);
        setIsLoading(false);
      });

  }, []);

  return [user, isLoading];
}