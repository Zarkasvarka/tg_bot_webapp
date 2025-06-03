import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Получаем данные из Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch('https://tg-bot-741h.onrender.com/api/user', {
          headers: {
            'Telegram-InitData': initData
          }
        });
        
        if (!response.ok) throw new Error('Ошибка авторизации');
        
        const userData = await response.json();
        
        // Форматируем данные для фронта
        const formattedUser = {
          avatarUrl: userData.avatar_url || 'https://t.me/i/userpic/320/zarkasvarka.jpg',
          nickname: userData.username || `User${userData.telegramid}`,
          balance: userData.token_balance,
          telegramid: userData.telegramid
        };
        
        setUser(formattedUser);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        setUser(null);
      }
    };

    if (window.Telegram?.WebApp) {
      fetchUser();
    }
  }, []);

  return [user, setUser];
}
