import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;

    fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
      headers: {
        'Telegram-InitData': window.Telegram.WebApp.initData
      }
    })
      .then(res => res.json())
      .then(data => setUser({
        avatarUrl: data.username 
          ? `https://t.me/i/userpic/320/${data.username}.jpg`
          : 'https://t.me/i/userpic/320/Amaizek.jpg', // Заглушка
        nickname: data.username || 'Гость',
        balance: data.token_balance,
        telegramid: data.telegramId,
      }))
      .catch(() => setUser(null));
  }, []);

  return [user, setUser];
}
