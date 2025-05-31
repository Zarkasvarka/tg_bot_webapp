import React, { useState, useRef, useEffect } from 'react';
import './Tariffs.css';
import { useNavigate } from 'react-router-dom';

const TARIFFS = [
  { tariffid: 1, name: 'Стартовый', price: '100₽', tokens_amount: 100, is_active: true },
  { tariffid: 2, name: 'Базовый', price: '300₽', tokens_amount: 350, is_active: true },
  { tariffid: 3, name: 'Продвинутый', price: '500₽', tokens_amount: 600, is_active: true },
  { tariffid: 4, name: 'VIP', price: '1000₽', tokens_amount: 1300, is_active: true },
  { tariffid: 5, name: 'Премиум', price: '2000₽', tokens_amount: 2800, is_active: true },
  { tariffid: 6, name: 'Эксперт', price: '3500₽', tokens_amount: 5000, is_active: true },
  { tariffid: 7, name: 'Мастер', price: '5000₽', tokens_amount: 7500, is_active: true },
  { tariffid: 8, name: 'Грандмастер', price: '7500₽', tokens_amount: 12000, is_active: true },
  { tariffid: 9, name: 'Легенда', price: '10000₽', tokens_amount: 17000, is_active: true },
  { tariffid: 10, name: 'Элитный', price: '15000₽', tokens_amount: 25000, is_active: true },
];

export default function Tariffs() {
  const [position, setPosition] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const cardWidth = 300;
  const gap = 15;
  const [maxTranslate, setMaxTranslate] = useState(0);

  // Рассчёт максимального смещения
  const calculateMaxTranslate = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = TARIFFS.length * (cardWidth + gap) - gap;
    return Math.max(contentWidth - containerWidth, 0);
  };

  // Обновление размеров при изменении экрана
  useEffect(() => {
    const handleResize = () => {
      const newMax = calculateMaxTranslate();
      setMaxTranslate(newMax);
      setPosition(prev => Math.min(prev, newMax));
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Обработчики скролла
  const handleScroll = (direction) => {
    const step = cardWidth + gap;
    let newPosition = direction === 'right' 
      ? position + step 
      : position - step;
    
    newPosition = Math.max(0, Math.min(newPosition, maxTranslate));
    setPosition(newPosition);
  };

  // Прогресс-бар
  const progress = maxTranslate > 0 ? (position / maxTranslate) * 100 : 0;

  return (
    <div className="tariffs-page">
      <button className="back-arrow-btn" onClick={() => navigate(-1)}>
      </button>
      <h1 className="tariffs-title">Пополнить баланс</h1>
      <div className="tariffs-carousel">
        <button
          className={`carousel-arrow left ${position <= 0 ? 'disabled' : ''}`}
          onClick={() => handleScroll('left')}
          disabled={position <= 0}
        >
          ‹
        </button>

        <div className="tariffs-cards-container" ref={containerRef}>
          <div
            className="tariffs-cards"
            style={{
              transform: `translateX(-${position}px)`,
              gap: `${gap}px`
            }}
          >
            {TARIFFS.map(tariff => (
              <div
                className="tariff-card"
                key={tariff.tariffid}
                style={{ width: `${cardWidth}px` }}
              >
                <div className="tariff-name">{tariff.name}</div>
                <div className="tariff-price">{tariff.price}</div>
                <div className="tariff-tokens">+{tariff.tokens_amount} токенов</div>
                <button
                  className={`buy-btn ${!tariff.is_active ? 'disabled' : ''}`}
                  disabled={!tariff.is_active}
                >
                  {tariff.is_active ? 'Купить' : 'Недоступно'}
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          className={`carousel-arrow right ${position >= maxTranslate ? 'disabled' : ''}`}
          onClick={() => handleScroll('right')}
          disabled={position >= maxTranslate}
        >
          ›
        </button>
      </div>

      <div className="tariffs-scrollbar">
        <div
          className="tariffs-scrollbar-track"
          style={{
            width: `${progress}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}
