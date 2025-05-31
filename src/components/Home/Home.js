import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Добро пожаловать!</h1>
      <p>Для начала работы перейдите в Telegram-бота:</p>
      <a
        href="https://t.me/KHPI_KemGU_betbot"
        target="_blank"
        rel="noopener noreferrer"
        className="telegram-button"
      >
        Открыть @KHPI_KemGU_betbot
      </a>
    </div>
  );
}
