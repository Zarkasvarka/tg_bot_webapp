import React, { useState, useRef, useEffect } from 'react';
import './Tariffs.css';
import { useNavigate } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api/tariffs`;

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [position, setPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const gap = 15;

  // Получение тарифов с сервера
  useEffect(() => {
    async function fetchTariffs() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Ошибка загрузки тарифов');
        const data = await res.json();
        setTariffs(data);
      } catch (e) {
        setTariffs([]);
      }
      setLoading(false);
    }
    fetchTariffs();
  }, []);

  // Функция для получения ширины карточки
  const getCardWidth = () => {
    return window.innerWidth <= 480 ? Math.max(100, window.innerWidth - 30) : 300;
  };

  // Рассчёт максимального смещения и шага
  const calculateDimensions = (cardWidth, gap) => {
    if (!containerRef.current) return { maxTranslate: 0, step: 0 };

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = tariffs.length * (cardWidth + gap) - gap;
    let maxTranslate = Math.max(contentWidth - containerWidth, 0);

    if (window.innerWidth > 480 && maxTranslate > 0) {
      const totalCardsWidth = tariffs.length * cardWidth + (tariffs.length - 1) * gap;
      const visibleWidth = containerWidth;
      const lastCardPosition = totalCardsWidth - visibleWidth;
      maxTranslate = Math.max(lastCardPosition, 0);
    }

    const visibleCardsFloat = (containerWidth + gap) / (cardWidth + gap);
    const visibleCards = Math.max(1, Math.floor(visibleCardsFloat));
    const step = visibleCards * (cardWidth + gap);

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
    // eslint-disable-next-line
  }, [gap, tariffs.length]);

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

  const showArrows = window.innerWidth > 480;

  return (
    <div className="tariffs-page">
      <button className="back-arrow-btn" onClick={() => navigate(-1)} />
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
            {loading ? (
              <div className="tariffs-loading">Загрузка...</div>
            ) : tariffs.length === 0 ? (
              <div className="tariffs-empty">Тарифы не найдены</div>
            ) : (
              tariffs.map(tariff => (
                <div
                  className="tariff-card"
                  key={tariff.tariffid}
                  style={{ width: window.innerWidth <= 480 ? 'calc(100vw - 30px)' : `${cardWidth}px` }}
                >
                  <div className="tariff-name">{tariff.name}</div>
                  <div className="tariff-price">{tariff.price}₽</div>
                  <div className="tariff-tokens">+{tariff.token_amount} токенов</div>
                  <button
                    className={`buy-btn ${!tariff.is_active ? 'disabled' : ''}`}
                    disabled={!tariff.is_active}
                  >
                    {tariff.is_active ? 'Купить' : 'Недоступно'}
                  </button>
                </div>
              ))
            )}
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