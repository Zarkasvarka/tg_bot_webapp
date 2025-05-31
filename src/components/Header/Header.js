import React from 'react';
import UserCard from '../UserCard/UserCard';
import './Header.css';

export default function Header({ user }) {
  return (
    <header className="header">
      <div className="header__title">KyberBet</div>
      <UserCard user={user} />
    </header>
  );
}
