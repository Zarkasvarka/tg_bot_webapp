import { useEffect, useState } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      webApp.ready();
    }
  }, []);

  return { tg };
}