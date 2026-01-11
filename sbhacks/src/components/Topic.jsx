import { useState, useEffect } from 'react';
import hintIcon from '../assets/hint.png';
import paperImage from '../assets/paper.jpg';
import { fetchRandomTopic } from '../services/topicService';
import '../styles.css';

function Topic({ onNavigate, data }) {
  const [topicDescription, setTopicDescription] = useState('');
  const [hints, setHints] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch topic and hints from backend
    const loadTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const topicData = await fetchRandomTopic();
        setTopicDescription(topicData.topic);
        setHints(topicData.hints);
      } catch (err) {
        console.error('Error loading topic:', err);
        setError('Failed to load topic. Please try again.');
        // Fallback data will be set by the service
        const fallbackData = await fetchRandomTopic();
        setTopicDescription(fallbackData.topic);
        setHints(fallbackData.hints);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();

    // Randomly assign role on component mount
    const randomRole = Math.random() < 0.5 ? 'proponent' : 'opponent';
    setRole(randomRole);
  }, []);

  const handleGotIt = () => {
    onNavigate('courtroom', {
      ...data,
      role,
      topic: topicDescription
    });
  };

  const getRoleText = () => {
    if (role === 'proponent') {
      return "You will be the proponent (for the topic)!";
    } else if (role === 'opponent') {
      return "You will be the opponent (against the topic)!";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="topic-page" style={{ backgroundImage: `url(${paperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className="topic-title">Topic</h1>
        <div className="topic-description-box">
          <div className="topic-description-text" style={{ textAlign: 'center' }}>
            Loading topic...
          </div>
        </div>
      </div>
    );
  }

  if (error && !topicDescription) {
    return (
      <div className="topic-page" style={{ backgroundImage: `url(${paperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className="topic-title">Topic</h1>
        <div className="topic-description-box">
          <div className="topic-description-text" style={{ textAlign: 'center', color: '#ff6b6b' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-page" style={{ backgroundImage: `url(${paperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 className="topic-title">Topic</h1>
      
      <div className="topic-description-box">
        <div className="topic-description-text">
          {topicDescription}
        </div>
      </div>
      
      {hints.length > 0 && (
        <div className="hints-box">
          {hints.map((hint, index) => (
            <div key={index} className="hint-item">
              <img 
                src={hintIcon} 
                alt="Hint" 
                className="hint-icon"
              />
              <div className="hint-text">
                {hint}
              </div>
            </div>
          ))}
        </div>
      )}

      {role && (
        <div className="role-box">
          <div className="role-text">
            {getRoleText()}
          </div>
        </div>
      )}

      <button className="got-it-button" onClick={handleGotIt} disabled={!topicDescription}>
        Got it!
      </button>
    </div>
  );
}

export default Topic;
