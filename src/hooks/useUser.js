import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для безопасного обновления состояния
  const updateUser = (newUserData) => {
    setUser(prev => {
      if (!prev) return newUserData; // Если пользователя не было
      return { ...prev, ...newUserData }; // Мердж существующих данных
    });
  };

  useEffect(() => {
    let isMounted = true; // Флаг для отслеживания монтирования
    
    const initData = window.Telegram?.WebApp?.initData;
    
    // Если нет данных авторизации
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
        
        // Валидация ответа сервера
        if (!data?.telegramId) {
          throw new Error('Некорректные данные пользователя');
        }

        setUser({
          avatarUrl: data.avatar || '/default-avatar.png',
          nickname: data.username || `User_${data.telegramId.slice(-4)}`,
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

  return [user, updateUser, isLoading];
}
