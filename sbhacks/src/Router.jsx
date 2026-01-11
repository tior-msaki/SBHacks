// src/Router.jsx
import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import TopicScreen from './components/TopicScreen';
import DebateScreen from './components/DebateScreen';
import ResultScreen from './components/ResultScreen';

const Router = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [gameState, setGameState] = useState({
    username: '',
    difficulty: 'easy',
    userAvatar: null,
    opponentAvatar: null,
    topic: '',
    userArgument: '',
    opponentArgument: '',
    winner: null,
    feedback: ''
  });

  const navigateTo = (screen, newState = {}) => {
    setGameState(prev => ({ ...prev, ...newState }));
    setCurrentScreen(screen);
  };

  const screens = {
    home: <HomeScreen onNext={navigateTo} gameState={gameState} />,
    topic: <TopicScreen onNext={navigateTo} gameState={gameState} />,
    debate: <DebateScreen onNext={navigateTo} gameState={gameState} />,
    result: <ResultScreen onNext={navigateTo} gameState={gameState} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {screens[currentScreen]}
    </div>
  );
};

export default Router;