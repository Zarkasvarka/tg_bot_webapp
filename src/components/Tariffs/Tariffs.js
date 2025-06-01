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
  { tariffid: 11, name: 'GODLIKE', price: '20000₽', tokens_amount: 30000, is_active: true },
];

export default function Tariffs() {
  const [position, setPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const gap = 15;

  // Функция для получения ширины карточки
  const getCardWidth = () => {
    return window.innerWidth <= 480 ? Math.max(100, window.innerWidth - 30) : 300;
  };

  // Рассчёт максимального смещения и шага
  const calculateDimensions = (cardWidth, gap) => {
    if (!containerRef.current) return { maxTranslate: 0, step: 0 };

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = TARIFFS.length * (cardWidth + gap) - gap;
    let maxTranslate = Math.max(contentWidth - containerWidth, 0);

    // Корректировка для точного позиционирования последней карточки
    if (window.innerWidth > 480 && maxTranslate > 0) {
      const totalCardsWidth = TARIFFS.length * cardWidth + (TARIFFS.length - 1) * gap;
      const visibleWidth = containerWidth;
      const lastCardPosition = totalCardsWidth - visibleWidth;
      maxTranslate = Math.max(lastCardPosition, 0);
    }

    // Расчёт видимых карточек
    const visibleCardsFloat = (containerWidth + gap) / (cardWidth + gap);
    const visibleCards = Math.max(1, Math.floor(visibleCardsFloat));

    // Шаг прокрутки (кратен ширине карточек)
    const step = visibleCards * (cardWidth + gap);

    // Корректировка шага для последней страницы (чтобы не было пустого пространства)
    const remainder = maxTranslate % step;
    if (remainder > 0 && window.innerWidth > 480) {
      maxTranslate += step - remainder;
    }

    return { maxTranslate, step, containerWidth };
  };

  // Обновление размеров и позиции при ресайзе
  useEffect(() => {
    const handleResize = () => {
      const newCardWidth = getCardWidth();
      setCardWidth(newCardWidth);
      const { maxTranslate } = calculateDimensions(newCardWidth, gap);

      setPosition(prev => {
        if (window.innerWidth > 480) {
          return Math.min(prev, maxTranslate);
        }
        return prev;
      });
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [gap]);

  // Обработчик скролла
  const handleScroll = (direction) => {
    const { maxTranslate, step } = calculateDimensions(cardWidth, gap);
    const newPosition = direction === 'right'
      ? Math.min(position + step, maxTranslate)
      : Math.max(position - step, 0);
    setPosition(newPosition);
  };

  // Прогресс-бар
  const { maxTranslate } = calculateDimensions(cardWidth, gap);
  const progress = maxTranslate > 0 ? (position / maxTranslate) * 100 : 0;

  // Скрыть стрелки на мобильных устройствах
  const showArrows = window.innerWidth > 480;

  return (
    <div className="tariffs-page">
      <button className="back-arrow-btn" onClick={() => navigate(-1)}>
      </button>
      <h1 className="tariffs-title">Пополнить баланс</h1>
      <div className="tariffs-carousel">
        {showArrows && (
          <button
            className={`carousel-arrow left ${position <= 0 ? 'disabled' : ''}`}
            onClick={() => handleScroll('left')}
            disabled={position <= 0}
          >
            ‹
          </button>
        )}
        <div className="tariffs-cards-container" ref={containerRef}>
          <div
            className="tariffs-cards"
            style={{
              transform: window.innerWidth > 480 ? `translateX(-${position}px)` : 'none',
              gap: `${gap}px`,
              transition: 'transform 0.3s ease',
            }}
          >
            {TARIFFS.map(tariff => (
              <div
                className="tariff-card"
                key={tariff.tariffid}
                style={{ width: window.innerWidth <= 480 ? 'calc(100vw - 30px)' : `${cardWidth}px` }}
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
        {showArrows && (
          <button
            className={`carousel-arrow right ${position >= maxTranslate ? 'disabled' : ''}`}
            onClick={() => handleScroll('right')}
            disabled={position >= maxTranslate}
          >
            ›
          </button>
        )}
      </div>
      {showArrows && (
        <div className="tariffs-scrollbar">
          <div
            className="tariffs-scrollbar-track"
            style={{
              width: `${progress}%`,
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      )}
    </div>
  );
}
