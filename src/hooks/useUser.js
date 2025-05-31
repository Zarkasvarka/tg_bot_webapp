import { useState, useEffect } from 'react';

/**
 * Кастомный хук для получения и управления данными пользователя.
 * Возвращает [user, setUser], чтобы можно было обновлять состояние.
 */
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      // Здесь будет реальный запрос к API или Telegram WebApp
      const userData = {
        avatarUrl: 'https://t.me/i/userpic/320/zarkasvarka.jpg',
        nickname: 'Негадяй',
        balance: 10234.11,
      };
      setUser(userData);
    }
    fetchUser();
  }, []);

  return [user, setUser];
}
