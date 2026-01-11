// src/components/TopicScreen.jsx
import React, { useState, useEffect } from 'react';



const TopicScreen = ({ onNext, gameState }) => {
  const [topic, setTopic] = useState('');
  const [hints, setHints] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, []);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      // Fetch topic from backend
      const topicResponse = await fetch('http://localhost:8000/get-topic');
      const topicData = await topicResponse.text();
      setTopic(topicData.trim());
      
      // Fetch hints for the topic
      const hintsResponse = await fetch(`http://localhost:8000/get-hints/${encodeURIComponent(topicData.trim())}`);
      const hintsData = await hintsResponse.text();
      setHints(hintsData);
    } catch (error) {
      console.error('Error fetching topic:', error);
      // Fallback demo data
      setTopic("Should artificial intelligence be regulated by governments?");
      setHints("AI regulation involves balancing innovation with safety and ethical concerns...");
    }
    setLoading(false);
  };

  const handleContinue = () => {
    onNext('debate', { topic });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Today's Debate Topic
        </h2>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            <p className="text-white text-xl mt-4">Loading topic...</p>
          </div>
        ) : (
          <>
            <div className="bg-white/20 rounded-2xl p-8 mb-8 border-2 border-white/30">
              <p className="text-3xl text-white font-semibold text-center leading-relaxed">
                {topic}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-xl text-white font-semibold mb-4">Background Information</h3>
              <p className="text-white/80 leading-relaxed">
                {hints || "Prepare your arguments and consider multiple perspectives on this topic."}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={fetchTopic}
                className="flex-1 py-4 bg-white/20 text-white text-xl font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                Get New Topic
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Begin Debate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicScreen;