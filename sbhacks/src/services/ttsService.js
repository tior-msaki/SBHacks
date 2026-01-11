// Text-to-Speech service using ElevenLabs API
// Voice IDs from the Python backend (matching eleven_labs.py)
const VOICE_IDS = {
  'Berta': 'KnTv6RLzB4khP0x7xem1',  // Voice ID 1
  'Andrew': 'WLOYW6YwyA4c6LBQKJ36',  // Voice ID 2
  'Sophia': 'l2xKdzGYYWPy0gKbjRXC'   // Voice ID 3
};

// Avatar to number mapping (matching Python backend)
const AVATAR_TO_NUMBER = {
  'Berta': 1,
  'Andrew': 2,
  'Sophia': 3
};

const MODEL_VERSION = 'eleven_multilingual_v2';

// Backend URL - use proxy in development, direct URL in production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:8000');

/**
 * Generate speech audio using ElevenLabs API via backend
 * @param {string} text - Text to convert to speech
 * @param {string} avatar - Avatar name (Berta, Andrew, or Sophia)
 * @returns {Promise<Blob>} Audio blob
 */
export async function generateSpeech(text, avatar) {
  const avatarNumber = AVATAR_TO_NUMBER[avatar] || 1;
  const voiceId = VOICE_IDS[avatar] || VOICE_IDS['Berta'];
  
  console.log('🔊 Generating speech with ElevenLabs:', {
    avatar: avatar,
    avatarNumber: avatarNumber,
    voiceId: voiceId,
    expectedVoice: avatar === 'Andrew' ? 'MALE (WLOYW6YwyA4c6LBQKJ36)' : 
                   avatar === 'Berta' ? 'FEMALE (KnTv6RLzB4khP0x7xem1)' :
                   avatar === 'Sophia' ? 'FEMALE (l2xKdzGYYWPy0gKbjRXC)' : 'UNKNOWN',
    textLength: text.length
  });
  
  try {
    // Call your backend API endpoint that handles ElevenLabs
    const response = await fetch(`${BACKEND_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        avatar: avatarNumber,
        model_ver: MODEL_VERSION
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend TTS error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${BACKEND_URL}/text-to-speech`
      });
      throw new Error(`Failed to generate speech: ${response.status} ${errorText}`);
    }

    const audioBlob = await response.blob();
    console.log('Successfully received audio blob:', audioBlob.size, 'bytes');
    return audioBlob;
  } catch (error) {
    console.error('❌ Error generating speech with ElevenLabs:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    console.warn('⚠️ Falling back to browser TTS - ElevenLabs unavailable');
    // Fallback to browser's built-in TTS
    return null;
  }
}

/**
 * Play audio blob
 * @param {Blob} audioBlob - Audio blob to play
 */
export function playAudio(audioBlob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });

  // Clean up URL after playback
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl);
  });

  return audio;
}

/**
 * Speak text using ElevenLabs TTS for opponent avatar, with word highlighting
 * @param {string} text - Text to speak
 * @param {string} avatar - Avatar name (Berta, Andrew, or Sophia)
 * @param {Function} onWordHighlight - Callback for word highlighting
 * @returns {Promise<{audio: HTMLAudioElement, onEnd: Function}>} Audio element and callback setter
 */
export async function speakWithElevenLabs(text, avatar, onWordHighlight) {
  console.log('speakWithElevenLabs called:', { avatar, textLength: text.length });
  
  try {
    // Generate speech using ElevenLabs
    const audioBlob = await generateSpeech(text, avatar);
    
    if (!audioBlob) {
      console.warn('ElevenLabs returned no audio, falling back to browser TTS');
      // Fallback to browser TTS if ElevenLabs fails
      return speakWithBrowserTTS(text, onWordHighlight);
    }
    
    console.log('Playing ElevenLabs audio for avatar:', avatar);

    // Play the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Word highlighting logic (same as browser TTS)
    const words = text.split(/\s+/);
    let currentWordIndex = 0;
    const wordsPerMinute = 150; // Average speaking rate
    const estimatedDuration = (words.length / wordsPerMinute) * 60 * 1000; // Total duration in ms
    const msPerWord = estimatedDuration / words.length;

    let highlightInterval = null;
    let isPlaying = true;

    const callbacks = {
      onEnd: null,
      onError: null
    };

    if (onWordHighlight) {
      highlightInterval = setInterval(() => {
        if (currentWordIndex < words.length && isPlaying) {
          onWordHighlight(currentWordIndex);
          currentWordIndex++;
        } else {
          if (highlightInterval) {
            clearInterval(highlightInterval);
            highlightInterval = null;
          }
        }
      }, msPerWord);
    }

    audio.addEventListener('play', () => {
      console.log('ElevenLabs audio started playing');
      isPlaying = true;
    });

    audio.addEventListener('ended', () => {
      console.log('ElevenLabs audio finished');
      isPlaying = false;
      if (highlightInterval) {
        clearInterval(highlightInterval);
        highlightInterval = null;
      }
      if (onWordHighlight) {
        onWordHighlight(-1); // Clear highlight
      }
      URL.revokeObjectURL(audioUrl);
      if (callbacks.onEnd) {
        callbacks.onEnd();
      }
    });

    audio.addEventListener('error', (event) => {
      console.error('ElevenLabs audio error:', event);
      isPlaying = false;
      if (highlightInterval) {
        clearInterval(highlightInterval);
        highlightInterval = null;
      }
      URL.revokeObjectURL(audioUrl);
      if (callbacks.onError) {
        callbacks.onError(event);
      }
    });

    // Start playing
    await audio.play();

    // Return object with audio and callback setters
    return {
      audio,
      setOnEnd: (callback) => {
        callbacks.onEnd = callback;
      },
      setOnError: (callback) => {
        callbacks.onError = callback;
      }
    };
  } catch (error) {
    console.error('Error with ElevenLabs TTS, falling back to browser TTS:', error);
    return speakWithBrowserTTS(text, onWordHighlight);
  }
}

/**
 * Use browser's built-in speech synthesis as fallback
 * @param {string} text - Text to speak
 * @param {Function} onWordHighlight - Callback for word highlighting
 * @returns {SpeechSynthesisUtterance|null} The utterance object or null if not supported
 */
export function speakWithBrowserTTS(text, onWordHighlight) {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = 'en-US';

  // Word highlighting logic
  const words = text.split(/\s+/);
  let currentWordIndex = 0;
  const wordsPerMinute = utterance.rate * 150;
  const msPerWord = (60 / wordsPerMinute) * 1000;

  let highlightInterval = null;
  let isSpeaking = true;

  // Store callbacks
  const callbacks = {
    onEnd: null,
    onError: null
  };

  if (onWordHighlight) {
    highlightInterval = setInterval(() => {
      if (currentWordIndex < words.length && isSpeaking) {
        onWordHighlight(currentWordIndex);
        currentWordIndex++;
      } else {
        if (highlightInterval) {
          clearInterval(highlightInterval);
          highlightInterval = null;
        }
      }
    }, msPerWord);
  }

  utterance.onstart = () => {
    console.log('Speech synthesis started');
    isSpeaking = true;
  };

  utterance.onend = (event) => {
    console.log('Speech synthesis ended');
    isSpeaking = false;
    if (highlightInterval) {
      clearInterval(highlightInterval);
      highlightInterval = null;
    }
    if (onWordHighlight) {
      onWordHighlight(-1); // Clear highlight
    }
    if (callbacks.onEnd) {
      callbacks.onEnd(event);
    }
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    isSpeaking = false;
    if (highlightInterval) {
      clearInterval(highlightInterval);
      highlightInterval = null;
    }
    if (callbacks.onError) {
      callbacks.onError(event);
    }
  };

  // Add methods to set callbacks
  utterance.setOnEnd = (callback) => {
    callbacks.onEnd = callback;
  };

  utterance.setOnError = (callback) => {
    callbacks.onError = callback;
  };

  // Small delay to ensure previous speech is cancelled
  setTimeout(() => {
    speechSynthesis.speak(utterance);
  }, 100);

  return utterance;
}
