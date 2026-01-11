import { useState, useEffect, useRef } from 'react';
import judgeImage from '../assets/judge.jpg';
import soundIcon from '../assets/sound_icon.jpg';
import bertaImage from '../assets/berta.jpg';
import andrewImage from '../assets/andrew.jpg';
import sophiaImage from '../assets/sophia.jpg';
import paperImage from '../assets/paper.jpg';
import { generateOpponentResponse } from '../services/agentService';
import { speakWithElevenLabs, speakWithBrowserTTS } from '../services/ttsService';
import { evaluatePerformance } from '../services/evaluationService';
import '../styles.css';

function Courtroom({ onNavigate, data }) {
  const { player, opponent, difficulty, topic, role } = data;
  
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [transcriptText, setTranscriptText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [transcriptPosition, setTranscriptPosition] = useState('player');
  const [opponentWords, setOpponentWords] = useState([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [responseError, setResponseError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);
  const highlightIntervalRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const isRecordingRef = useRef(false);
  const recordingStartTimeRef = useRef(null);
  const recordingDurationRef = useRef(0);

  const avatarMap = {
    'Berta': bertaImage,
    'Andrew': andrewImage,
    'Sophia': sophiaImage
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          finalTranscriptRef.current += final;
          setTranscriptText(finalTranscriptRef.current);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      };
    }
  }, []);

  useEffect(() => {
    if (transcriptRef.current && (transcriptText || interimTranscript)) {
      setTimeout(() => {
        const lineHeight = 36;
        const totalHeight = transcriptRef.current.scrollHeight;
        const visibleHeight = transcriptRef.current.clientHeight;
        const lastLineNumber = Math.floor((totalHeight - visibleHeight) / lineHeight);
        transcriptRef.current.scrollTop = lastLineNumber * lineHeight;
      }, 50);
    }
  }, [transcriptText, interimTranscript]);

  useEffect(() => {
    if (timeRemaining <= 0 && isRecordingRef.current && mediaRecorderRef.current) {
      recordingDurationRef.current = recordingStartTimeRef.current 
        ? (Date.now() - recordingStartTimeRef.current) / 1000 
        : 0;
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      setShowControls(false);
      setInterimTranscript('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setTimeRemaining(60);
      
      setTimeout(() => {
        setTranscriptPosition('opponent');
        startOpponentSpeech();
      }, 100);
    }
  }, [timeRemaining]);

  const wrapWords = (text) => {
    if (!text) return '';
    return text.split(/(\s+)/).map(segment => {
      if (segment.trim()) {
        return `<span class="word">${segment}</span>`;
      } else if (segment) {
        return segment.split('').map(() => '<span class="word space"> </span>').join('');
      }
      return segment;
    }).join('');
  };

  const updateTimer = () => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Recording stopped. Audio blob:', audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      recordingStartTimeRef.current = Date.now();
      setTimeRemaining(60);
      setTranscriptText('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      setHasRecorded(true);

      timerIntervalRef.current = setInterval(updateTimer, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error starting speech recognition:', e);
        }
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      recordingDurationRef.current = recordingStartTimeRef.current 
        ? (Date.now() - recordingStartTimeRef.current) / 1000 
        : 0;
      
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      isRecordingRef.current = false;
      setShowControls(false);
      setInterimTranscript('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setTimeRemaining(60);
      
      setTimeout(() => {
        setTranscriptPosition('opponent');
        startOpponentSpeech();
      }, 100);
    }
  };

  const startOpponentSpeech = async () => {
    setIsGeneratingResponse(true);
    setResponseError(null);
    
    try {
      // Generate opponent response using backend service
      const opponentText = await generateOpponentResponse(
        finalTranscriptRef.current,
        topic,
        role,
        difficulty
      );

      setIsGeneratingResponse(false);
      const words = opponentText.split(/(\s+)/);
      setOpponentWords(words);
      setTranscriptText(opponentText);

      // Use ElevenLabs TTS with the opponent's avatar voice
      console.log('Starting opponent speech with avatar:', opponent);
      try {
        const ttsResult = await speakWithElevenLabs(opponentText, opponent, (wordIndex) => {
          setHighlightedWordIndex(wordIndex);
          
          if (wordIndex >= 0 && transcriptRef.current) {
            setTimeout(() => {
              const wordElements = transcriptRef.current.querySelectorAll('.opponent-word');
              if (wordElements[wordIndex]) {
                const lineHeight = 36;
                const wordTop = wordElements[wordIndex].offsetTop;
                const lineNumber = Math.floor(wordTop / lineHeight);
                transcriptRef.current.scrollTop = lineNumber * lineHeight;
              }
            }, 10);
          }
        });

        // Handle both ElevenLabs (returns object) and browser TTS (returns utterance)
        if (ttsResult && typeof ttsResult === 'object' && ttsResult.audio) {
          // ElevenLabs TTS result
          if (ttsResult.setOnEnd) {
            ttsResult.setOnEnd(() => {
              console.log('Opponent speech finished (ElevenLabs), evaluating performance...');
              const evaluation = evaluatePerformance(
                finalTranscriptRef.current,
                recordingDurationRef.current,
                difficulty,
                topic,
                role
              );

              onNavigate(evaluation.won ? 'win' : 'lose', {
                ...data,
                ...evaluation
              });
            });

            ttsResult.setOnError(() => {
              console.log('ElevenLabs TTS error, evaluating performance anyway...');
              setTimeout(() => {
                const evaluation = evaluatePerformance(
                  finalTranscriptRef.current,
                  recordingDurationRef.current,
                  difficulty,
                  topic,
                  role
                );
                onNavigate(evaluation.won ? 'win' : 'lose', {
                  ...data,
                  ...evaluation
                });
              }, 1000);
            });
          }
        } else if (ttsResult) {
          // Browser TTS fallback (returns utterance)
          const utterance = ttsResult;
          if (utterance.setOnEnd) {
            utterance.setOnEnd(() => {
              console.log('Opponent speech finished (Browser TTS), evaluating performance...');
              const evaluation = evaluatePerformance(
                finalTranscriptRef.current,
                recordingDurationRef.current,
                difficulty,
                topic,
                role
              );

              onNavigate(evaluation.won ? 'win' : 'lose', {
                ...data,
                ...evaluation
              });
            });

            utterance.setOnError(() => {
              console.log('Browser TTS error, evaluating performance anyway...');
              setTimeout(() => {
                const evaluation = evaluatePerformance(
                  finalTranscriptRef.current,
                  recordingDurationRef.current,
                  difficulty,
                  topic,
                  role
                );
                onNavigate(evaluation.won ? 'win' : 'lose', {
                  ...data,
                  ...evaluation
                });
              }, 1000);
            });
          } else {
            utterance.onend = () => {
              const evaluation = evaluatePerformance(
                finalTranscriptRef.current,
                recordingDurationRef.current,
                difficulty,
                topic,
                role
              );
              onNavigate(evaluation.won ? 'win' : 'lose', {
                ...data,
                ...evaluation
              });
            };
          }
        } else {
          // No TTS available, use fallback timer
          console.log('TTS not available, using fallback timer');
          const wordCount = opponentText.split(/\s+/).length;
          const estimatedDuration = (wordCount / 150) * 60 * 1000; // Estimate duration
          setTimeout(() => {
            const evaluation = evaluatePerformance(
              finalTranscriptRef.current,
              recordingDurationRef.current,
              difficulty,
              topic,
              role
            );
            onNavigate(evaluation.won ? 'win' : 'lose', {
              ...data,
              ...evaluation
            });
          }, estimatedDuration + 1000);
        }
      } catch (ttsError) {
        console.error('Error with TTS:', ttsError);
        // Fallback: navigate after estimated duration
        const wordCount = opponentText.split(/\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60 * 1000;
        setTimeout(() => {
          const evaluation = evaluatePerformance(
            finalTranscriptRef.current,
            recordingDurationRef.current,
            difficulty,
            topic,
            role
          );
          onNavigate(evaluation.won ? 'win' : 'lose', {
            ...data,
            ...evaluation
          });
        }, estimatedDuration + 1000);
      }
    } catch (error) {
      console.error('Error starting opponent speech:', error);
      setIsGeneratingResponse(false);
      
      // Even if there's an error, try to use a fallback response
      try {
        const fallbackText = `I understand your points, but I have a different perspective on this topic. There are important considerations we should examine. The evidence suggests we need to look at this from multiple angles.`;
        const words = fallbackText.split(/(\s+)/);
        setOpponentWords(words);
        setTranscriptText(fallbackText);
        
        // Use browser TTS with fallback text
        const utterance = speakWithBrowserTTS(fallbackText, (wordIndex) => {
          setHighlightedWordIndex(wordIndex);
        });

        if (utterance) {
          if (utterance.setOnEnd) {
            utterance.setOnEnd(() => {
              const evaluation = evaluatePerformance(
                finalTranscriptRef.current,
                recordingDurationRef.current,
                difficulty,
                topic,
                role
              );
              onNavigate(evaluation.won ? 'win' : 'lose', {
                ...data,
                ...evaluation
              });
            });
          } else {
            utterance.onend = () => {
              const evaluation = evaluatePerformance(
                finalTranscriptRef.current,
                recordingDurationRef.current,
                difficulty,
                topic,
                role
              );
              onNavigate(evaluation.won ? 'win' : 'lose', {
                ...data,
                ...evaluation
              });
            };
          }
        } else {
          // If TTS fails too, just navigate after delay
          setTimeout(() => {
            const evaluation = evaluatePerformance(
              finalTranscriptRef.current,
              recordingDurationRef.current,
              difficulty,
              topic,
              role
            );
            onNavigate(evaluation.won ? 'win' : 'lose', {
              ...data,
              ...evaluation
            });
          }, 3000);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Last resort: navigate after delay
        setTimeout(() => {
          const evaluation = evaluatePerformance(
            finalTranscriptRef.current,
            recordingDurationRef.current,
            difficulty,
            topic,
            role
          );
          onNavigate(evaluation.won ? 'win' : 'lose', {
            ...data,
            ...evaluation
          });
        }, 2000);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTranscript = () => {
    // Show loading state when generating opponent response
    if (transcriptPosition === 'opponent' && isGeneratingResponse) {
      return (
        <div ref={transcriptRef} className="transcript-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ opacity: 0.7 }}>Generating opponent response...</span>
        </div>
      );
    }

    // Show error state if response generation failed
    if (transcriptPosition === 'opponent' && responseError) {
      return (
        <div ref={transcriptRef} className="transcript-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#ff6b6b', opacity: 0.9 }}>{responseError}</span>
        </div>
      );
    }

    if (transcriptPosition === 'opponent' && opponentWords.length > 0) {
      let wordIndex = 0;
      return (
        <div ref={transcriptRef} className="transcript-text" style={{ color: '#000' }}>
          {opponentWords.map((segment, index) => {
            if (segment.trim()) {
              const currentIndex = wordIndex++;
              return (
                <span
                  key={index}
                  className={`opponent-word ${highlightedWordIndex === currentIndex ? 'highlighted' : ''}`}
                  style={{ color: '#000' }}
                >
                  {segment}
                </span>
              );
            } else {
              return <span key={index} style={{ color: '#000' }}>{segment}</span>;
            }
          })}
        </div>
      );
    } else {
      const finalHTML = wrapWords(transcriptText);
      const interimHTML = wrapWords(interimTranscript);
      return (
        <div 
          ref={transcriptRef}
          className="transcript-text" 
          dangerouslySetInnerHTML={{ 
            __html: finalHTML + (interimHTML ? `<span class="interim" style="opacity: 1;">${interimHTML}</span>` : '')
          }}
        />
      );
    }
  };

  return (
    <div className="courtroom-frame" style={{ backgroundImage: `url(${paperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="judge-container">
        <img src={judgeImage} alt="Judge" className="judge-image" />
      </div>
      
      <div className="avatars-container">
        <div className={`player-avatar-container ${transcriptPosition === 'opponent' ? 'no-transcript' : ''}`}>
          <img 
            src={avatarMap[player] || bertaImage} 
            alt="Player Avatar" 
            className="avatar-image" 
          />
          {transcriptPosition === 'player' && (
            <div className="transcript-wrapper">
              <div className="transcript-box">
                {renderTranscript()}
              </div>
              {showControls && (
                <>
                  <button
                    className={`record-button ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={hasRecorded && !isRecording}
                  >
                    <img src={soundIcon} alt="Record" className="sound-icon" />
                  </button>
                  <div className="timer">{formatTime(timeRemaining)}</div>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className={`opponent-avatar-container ${transcriptPosition === 'opponent' ? 'has-transcript' : ''}`}>
          {transcriptPosition === 'opponent' && (
            <div className="transcript-wrapper">
              <div className="transcript-box">
                {renderTranscript()}
              </div>
            </div>
          )}
          <img 
            src={avatarMap[opponent] || bertaImage} 
            alt="Opponent Avatar" 
            className="avatar-image" 
          />
        </div>
      </div>
    </div>
  );
}

export default Courtroom;
