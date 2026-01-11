// src/components/DebateScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Clock, Camera } from 'lucide-react';

const DebateScreen = ({ onNext, gameState }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState('user'); // 'user' or 'opponent'
  const [userArgument, setUserArgument] = useState('');
  const [opponentArgument, setOpponentArgument] = useState('');
  const [debatePhase, setDebatePhase] = useState('waiting'); // 'waiting', 'user-turn', 'opponent-turn', 'finished'
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition (Web Speech API)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        setUserArgument(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startUserTurn = () => {
    setDebatePhase('user-turn');
    setCurrentSpeaker('user');
    setTimeLeft(20);
    setTranscript('');
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTurnEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTurnEnd = async () => {
    if (currentSpeaker === 'user') {
      stopRecording();
      // User turn ended, now opponent's turn
      await fetchOpponentArgument();
    } else {
      // Opponent turn ended, finish debate
      finishDebate();
    }
  };

  const toggleRecording = () => {
    if (debatePhase !== 'user-turn') return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const fetchOpponentArgument = async () => {
    setDebatePhase('opponent-turn');
    setCurrentSpeaker('opponent');
    setTimeLeft(20);
    startTimer();

    try {
      // Fetch opponent's counterargument from backend
      const response = await fetch('http://localhost:8000/get-counterargument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: gameState.topic,
          difficulty: gameState.difficulty
        })
      });
      const argument = await response.json();
      setOpponentArgument(argument.data);

      // Use text-to-speech (this would integrate with eleven_labs.py)
      // For now, we'll simulate with browser's speech synthesis
      speakText(argument.data);
    //   finishDebate();
    } catch (error) {
      console.error('Error fetching opponent argument:', error);
      setOpponentArgument("I believe this topic requires careful consideration of multiple perspectives...");
      speakText(opponentArgument);
    //   finishDebate();
    } finally {
        finishDebate()
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const finishDebate = () => {
    setDebatePhase('finished');
    // Navigate to results with arguments
    onNext('result', { 
      userArgument, 
      opponentArgument 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-6xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {gameState.topic}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-2xl font-bold text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Debate Arena */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* User Side */}
          <div className={`p-6 rounded-2xl transition-all ${
            currentSpeaker === 'user' 
              ? 'bg-green-500/30 border-4 border-green-400' 
              : 'bg-white/10 border-2 border-white/20'
          }`}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{gameState.username}</h3>
              {/* PLACEHOLDER: Replace with <img src="/assets/user-avatar.png" className="w-32 h-32 mx-auto rounded-full" /> */}
              <div className="w-32 h-32 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 min-h-[150px]">
              <p className="text-white text-sm">
                {currentSpeaker === 'user' && debatePhase === 'user-turn' 
                  ? (transcript || "Speak your argument...")
                  : userArgument || "Waiting for your turn..."}
              </p>
            </div>
          </div>

          {/* Opponent Side */}
          <div className={`p-6 rounded-2xl transition-all ${
            currentSpeaker === 'opponent' 
              ? 'bg-red-500/30 border-4 border-red-400' 
              : 'bg-white/10 border-2 border-white/20'
          }`}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">AI Opponent</h3>
              {/* PLACEHOLDER: Replace with <img src="/assets/opponent-avatar.png" className="w-32 h-32 mx-auto rounded-full" /> */}
              <div className="w-32 h-32 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 min-h-[150px]">
              <p className="text-white text-sm">
                {opponentArgument || "Waiting for turn..."}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {debatePhase === 'waiting' && (
            <button
              onClick={startUserTurn}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Speaking
            </button>
          )}

          {debatePhase === 'user-turn' && (
            <button
              onClick={toggleRecording}
              className={`px-8 py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white text-purple-900'
              }`}
            >
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <Mic className="w-6 h-6" />
                  Recording...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MicOff className="w-6 h-6" />
                  Start Recording
                </div>
              )}
            </button>
          )}

          {debatePhase === 'opponent-turn' && (
            <div className="text-white text-xl font-semibold">
              Opponent is speaking...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebateScreen;