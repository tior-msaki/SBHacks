// src/components/HomeScreen.jsx
import React, { useState } from 'react';
import { Camera } from 'lucide-react';

const HomeScreen = ({ onNext, gameState }) => {
  const [username, setUsername] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [userAvatar, setUserAvatar] = useState(null);
  const [opponentAvatar, setOpponentAvatar] = useState(null);

  const avatars = [
    { id: 1, name: 'Berta', description: 'Middle-aged professional' },
    { id: 2, name: 'Andrew', description: 'Deep voice debater' },
    { id: 3, name: 'Sophia', description: 'Corporate speaker' }
  ];

  const handleStart = async () => {
    if (!username || !userAvatar || !opponentAvatar) {
      alert('Please fill in all fields');
      return;
    }
    if (userAvatar === opponentAvatar) {
      alert('Please select different avatars for you and your opponent');
      return;
    }

    // Call backend to log in user
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          difficulty, 
          avatar: userAvatar 
        })
      });
      const data = await response.json();
      console.log('User logged in:', data);
    } catch (error) {
      console.error('Login error:', error);
    }
    
    onNext('topic', { username, difficulty, userAvatar, opponentAvatar });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
        <h1 className="text-6xl font-bold text-white text-center mb-4">
          Debate Arena
        </h1>
        <p className="text-xl text-white/80 text-center mb-12">
          Sharpen your skills against AI opponents
        </p>

        <div className="space-y-8">
          {/* Username Input */}
          <div>
            <label className="block text-white text-lg mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-white/30 focus:border-white/60 focus:outline-none text-lg"
              placeholder="Enter your username"
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-white text-lg mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all ${
                    difficulty === level
                      ? 'bg-white text-purple-900 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="grid grid-cols-2 gap-8">
            {/* User Avatar */}
            <div>
              <label className="block text-white text-lg mb-4">Your Avatar</label>
              <div className="space-y-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setUserAvatar(avatar.id)}
                    disabled={opponentAvatar === avatar.id}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      userAvatar === avatar.id
                        ? 'bg-green-500 text-white shadow-lg'
                        : opponentAvatar === avatar.id
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {/* PLACEHOLDER: Replace with <img src="/assets/avatar-{avatar.id}.png" /> */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold">{avatar.name}</div>
                        <div className="text-sm opacity-80">{avatar.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Opponent Avatar */}
            <div>
              <label className="block text-white text-lg mb-4">Opponent Avatar</label>
              <div className="space-y-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setOpponentAvatar(avatar.id)}
                    disabled={userAvatar === avatar.id}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      opponentAvatar === avatar.id
                        ? 'bg-red-500 text-white shadow-lg'
                        : userAvatar === avatar.id
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {/* PLACEHOLDER: Replace with <img src="/assets/avatar-{avatar.id}.png" /> */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold">{avatar.name}</div>
                        <div className="text-sm opacity-80">{avatar.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start Debate
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;