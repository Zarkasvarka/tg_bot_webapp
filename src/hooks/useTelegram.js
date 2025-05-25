import { useEffect, useState } from 'react';

export function useTelegram(){
    
    const [tg, setTg] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;
            setTg(webApp);
            setUser(webApp.initDataUnsafe?.user || null);

            // Можно настроить интерфейс Web App, например:
            webApp.ready();

            // Пример: слушаем событие закрытия
            // webApp.onEvent('mainButtonClicked', () => {
            //   console.log('Main button clicked');
            // });
        }
    }, []);

    const sendData = (data) => {
        if (tg) {
            tg.sendData(JSON.stringify(data));
        }
    };

    return {
        tg,
        user,
        sendData,
    };
}