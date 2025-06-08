import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initData = window.Telegram?.WebApp?.initData;

    if (!initData) {
      if (isMounted) {
        setIsLoading(false);
        setUser(null);
      }
      return;
    }

    setIsLoading(true);

    fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
      headers: { 'Telegram-InitData': initData }
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || 'Ошибка авторизации');
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setUser({
          avatarUrl: data.avatar || '/default-avatar.png',
          nickname: data.username || `User_${data.telegramId?.slice(-4) || '0000'}`,
          balance: Number(data.balance) || 0,
          telegramid: data.telegramId
        });
      })
      .catch(error => {
        console.error('Ошибка загрузки пользователя:', error);
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return [user, setUser, isLoading];
}
