// src/components/ResultScreen.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Camera } from 'lucide-react';

const ResultScreen = ({ onNext, gameState }) => {
  const [winner, setWinner] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluateDebate();
  }, []);

  const evaluateDebate = async () => {
    setLoading(true);
    try {
      // Get winner determination
      const winnerResponse = await fetch('http://localhost:8000/get-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argument: gameState.userArgument,
          counterargument: gameState.opponentArgument,
          topic: gameState.topic
        })
      });
      const winnerResult = await winnerResponse.json();
      setWinner(winnerResult === 0 ? 'user' : 'opponent');

      // Get feedback
      const feedbackResponse = await fetch('http://localhost:8000/get-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argument: gameState.userArgument,
          topic: gameState.topic
        })
      });
      const feedbackText = await feedbackResponse.text();
      setFeedback(feedbackText);
    } catch (error) {
      console.error('Error evaluating debate:', error);
      // Fallback demo data
      setWinner('user');
      setFeedback('• Strong opening with clear thesis statement\n• Consider providing more specific evidence to support your claims');
    }
    setLoading(false);
  };

  const handlePlayAgain = () => {
    onNext('topic');
  };

  const handleMainMenu = () => {
    onNext('home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
            <p className="text-white text-xl">Evaluating debate...</p>
          </div>
        ) : (
          <>
            {/* Winner Announcement */}
            <div className="text-center mb-12">
              {winner === 'user' ? (
                <>
                  {/* PLACEHOLDER: Replace with <img src="/assets/victory-trophy.png" className="w-32 h-32 mx-auto mb-6" /> */}
                  <Trophy className="w-32 h-32 mx-auto mb-6 text-yellow-400" />
                  <h1 className="text-6xl font-bold text-green-400 mb-4">Victory!</h1>
                  <p className="text-2xl text-white">You won the debate!</p>
                </>
              ) : (
                <>
                  {/* PLACEHOLDER: Replace with <img src="/assets/defeat-icon.png" className="w-32 h-32 mx-auto mb-6" /> */}
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/30 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-red-400" />
                  </div>
                  <h1 className="text-6xl font-bold text-red-400 mb-4">Defeat</h1>
                  <p className="text-2xl text-white">Better luck next time!</p>
                </>
              )}
            </div>

            {/* Debate Summary */}
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Debate Topic</h3>
              <p className="text-white/90 text-lg">{gameState.topic}</p>
            </div>

            {/* Feedback Section */}
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Performance Feedback</h3>
              <div className="text-white/90 space-y-2">
                {feedback.split('\n').map((line, index) => (
                  <p key={index} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Arguments Review */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-green-500/20 rounded-xl p-4 border-2 border-green-400/50">
                <h4 className="text-lg font-bold text-white mb-2">Your Argument</h4>
                <p className="text-white/80 text-sm line-clamp-6">
                  {gameState.userArgument || "No argument recorded"}
                </p>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4 border-2 border-red-400/50">
                <h4 className="text-lg font-bold text-white mb-2">Opponent's Argument</h4>
                <p className="text-white/80 text-sm line-clamp-6">
                  {gameState.opponentArgument || "No argument available"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleMainMenu}
                className="flex-1 py-4 bg-white/20 text-white text-xl font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                Main Menu
              </button>
              <button
                onClick={handlePlayAgain}
                className="flex-1 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Debate Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;