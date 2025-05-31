import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCard.css';

export default function UserCard({ user }) {
  const [showHistoryBtn, setShowHistoryBtn] = useState(false);
  const navigate = useNavigate();

  const toggleHistory = useCallback(() => {
    setShowHistoryBtn(prev => !prev);
  }, []);

  const goToTariffs = useCallback((e) => {
    e.stopPropagation();
    navigate('/tariffs');
  }, [navigate]);

  const goToHistory = useCallback((e) => {
    e.stopPropagation();
    navigate('/history');
  }, [navigate]);

  return (
    <div className="user-card" onClick={toggleHistory} role="button" tabIndex={0} aria-label="Профиль пользователя">
      <img className="user-card__avatar" src={user.avatarUrl} alt="Аватар пользователя" />
      <div className="user-card__info">
        <div className="user-card__nickname">{user.nickname}</div>
        <div className="user-card__balance-block">
          <div className="user-card__balance">{user.balance} токенов</div>
          <button
            className="user-card__add-btn"
            onClick={goToTariffs}
            aria-label="Перейти к тарифам"
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div
        className={`user-card__history-popup ${showHistoryBtn ? 'visible' : ''}`}
        onClick={goToHistory}
        role="button"
        tabIndex={0}
        aria-label="Перейти в историю"
        >
        История
        </div>
    </div>
  );
}
