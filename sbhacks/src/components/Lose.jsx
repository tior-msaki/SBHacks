import paperImage from '../assets/paper.jpg';
import '../styles.css';

function Lose({ onNavigate, data }) {
  const { feedback = [], score = 0 } = data;

  const defaultFeedback = [
    '*try using broader concepts that relate to the main topic',
    '*you should use more relevant sources and pieces of evidence'
  ];

  const displayFeedback = feedback.length > 0 ? feedback : defaultFeedback;

  return (
    <div className="win-frame" style={{ backgroundImage: `url(${paperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 className="win-title">You Lose!</h1>
      
      <div className="feedback-box">
        <h2 className="feedback-label">Feedback</h2>
        <div className="feedback-content">
          {displayFeedback.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      </div>
      
      <div className="score-container">
        <div className="score-label-box">Score:</div>
        <div className="score-value-box">{score}</div>
      </div>
    </div>
  );
}

export default Lose;
