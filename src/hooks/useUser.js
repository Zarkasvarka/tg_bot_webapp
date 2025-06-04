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
        avatarUrl: `https://t.me/i/userpic/320/${data.username}.jpg`,
        nickname: data.username,
        balance: data.token_balance,
        telegramid: data.telegramid,
      }))
      .catch(() => setUser(null));
  }, []);

  return [user, setUser];
}
