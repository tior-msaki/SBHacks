document.addEventListener('DOMContentLoaded', function() {
    // Get avatar selections from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const playerAvatar = urlParams.get('player');
    const opponentAvatar = urlParams.get('opponent');
    
    // Map character names to image files
    const avatarMap = {
        'Berta': 'berta.jpg',
        'Andrew': 'andrew.jpg',
        'Sophia': 'sophia.jpg'
    };
    
    // Set avatar images
    const playerAvatarImg = document.getElementById('playerAvatarImg');
    const opponentAvatarImg = document.getElementById('opponentAvatarImg');
    
    if (playerAvatar && avatarMap[playerAvatar]) {
        playerAvatarImg.src = avatarMap[playerAvatar];
    } else {
        playerAvatarImg.src = 'berta.jpg'; // Default
    }
    
    if (opponentAvatar && avatarMap[opponentAvatar]) {
        opponentAvatarImg.src = avatarMap[opponentAvatar];
    } else {
        opponentAvatarImg.src = 'berta.jpg'; // Default
    }
    
    // Recording functionality
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let timerInterval = null;
    let timeRemaining = 60; // 60 seconds
    let recognition = null;
    let transcriptText = '';
    let hasRecorded = false; // Track if recording has been used
    
    const recordButton = document.getElementById('recordButton');
    const timer = document.getElementById('timer');
    const transcript = document.getElementById('transcript');
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = function(event) {
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
            
            transcriptText += finalTranscript;
            
            // Wrap words and spaces in spans with black background (continuous)
            function wrapWords(text) {
                if (!text) return '';
                // Split by spaces but keep them, then wrap each part
                return text.split(/(\s+)/).map(segment => {
                    if (segment.trim()) {
                        // It's a word
                        return `<span class="word">${segment}</span>`;
                    } else if (segment) {
                        // It's spaces - wrap each space
                        return segment.split('').map(() => '<span class="word space"> </span>').join('');
                    }
                    return segment;
                }).join('');
            }
            
            const finalHTML = wrapWords(transcriptText);
            const interimHTML = wrapWords(interimTranscript);
            transcript.innerHTML = finalHTML + (interimHTML ? `<span class="interim" style="opacity: 1;">${interimHTML}</span>` : '');
            
            // Auto-scroll to show the latest line fully (aligned to line boundaries)
            setTimeout(() => {
                const lineHeight = 36; // 24px * 1.5 line-height
                const totalHeight = transcript.scrollHeight;
                const visibleHeight = transcript.clientHeight;
                // Calculate which line to show and align to line boundary
                const lastLineNumber = Math.floor((totalHeight - visibleHeight) / lineHeight);
                transcript.scrollTop = lastLineNumber * lineHeight;
            }, 50);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };
        
        recognition.onend = function() {
            if (isRecording) {
                // Restart recognition if still recording
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Error restarting recognition:', e);
                }
            }
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
    
    function updateTimer() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            stopRecording();
        } else {
            timeRemaining--;
        }
    }
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                console.log('Recording stopped. Audio blob:', audioBlob);
                // You can handle the audio blob here (save, send to server, etc.)
            };
            
            mediaRecorder.start();
            isRecording = true;
            timeRemaining = 60;
            timer.textContent = '1:00'; // Set initial display
            timerInterval = setInterval(updateTimer, 1000);
            recordButton.classList.add('recording');
            
            // Reset transcript
            transcriptText = '';
            transcript.innerHTML = '';
            
            // Start speech recognition
            if (recognition) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Error starting speech recognition:', e);
                }
            }
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check your permissions.');
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            recordButton.classList.remove('recording');
            hasRecorded = true;
            
            // Hide the timer and speech button, but keep the transcript box visible
            recordButton.classList.add('hidden');
            timer.classList.add('hidden');
            
            // Stop speech recognition
            if (recognition) {
                try {
                    recognition.stop();
                } catch (e) {
                    console.error('Error stopping speech recognition:', e);
                }
            }
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            timeRemaining = 60;
            timer.textContent = '1:00';
            
            // Start opponent's speech with text-to-speech
            startOpponentSpeech();
        }
    }
    
    function startOpponentSpeech() {
        const opponentText = "In this debate, we must separate emotional reactions from objective data. Legally, AI training is not theft; it is transformative. In June 2025, U.S. District Judge William Alsup ruled in *Bartz v. Anthropic* that AI training is \"quintessentially transformative,\" as models learn mathematical patterns rather than copying files. Creatively, AI does not devalue art; it democratizes it. Much like photography pushed painting toward Impressionism, AI shifts the creative act from manual labor to conceptual curation and intent. Environmentally, generating one image uses roughly 2.9 Wh—the same as a single smartphone charge. With major providers committing to 100% renewable energy by 2030, the carbon footprint is becoming negligible.";
        
        // Move the transcript box from player to opponent
        const transcriptWrapper = document.querySelector('.transcript-wrapper');
        const opponentContainer = document.querySelector('.opponent-avatar-container');
        
        if (transcriptWrapper && opponentContainer) {
            // Remove from player container and add to opponent container
            transcriptWrapper.remove();
            opponentContainer.insertBefore(transcriptWrapper, opponentContainer.firstChild);
            
            // Update opponent container to row layout (transcript on left, avatar on right)
            opponentContainer.style.flexDirection = 'row';
            opponentContainer.style.alignItems = 'flex-end';
        }
        
        // Use the same transcript box that was used for recording
        const transcript = document.getElementById('transcript');
        const transcriptBox = document.querySelector('.transcript-box');
        
        if (transcript && transcriptBox) {
            // Clear the player's transcript and show opponent's text
            transcript.innerHTML = '';
            
            // Split text into words for highlighting
            const words = opponentText.split(/(\s+)/);
            
            // Initialize transcript with all words (unhighlighted)
            transcript.innerHTML = words.map((word, index) => {
                if (word.trim()) {
                    return `<span class="opponent-word" data-index="${index}">${word}</span>`;
                } else {
                    return word;
                }
            }).join('');
            
            // Use Web Speech API for text-to-speech
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(opponentText);
                utterance.rate = 0.85; // Slightly slower for clarity
                utterance.pitch = 1;
                utterance.volume = 1;
                
                const wordElements = transcript.querySelectorAll('.opponent-word');
                let currentWordIndex = 0;
                
                // Calculate approximate timing for each word (rough estimate)
                const wordsPerMinute = utterance.rate * 150; // Average speaking rate
                const msPerWord = (60 / wordsPerMinute) * 1000;
                
                // Highlight words progressively
                const highlightInterval = setInterval(() => {
                    if (currentWordIndex < wordElements.length) {
                        // Remove previous highlights
                        wordElements.forEach(el => el.classList.remove('highlighted'));
                        
                        // Highlight current word
                        wordElements[currentWordIndex].classList.add('highlighted');
                        
                        // Auto-scroll to show the full line containing the highlighted word
                        setTimeout(() => {
                            const lineHeight = 36; // 24px * 1.5 line-height
                            const wordElement = wordElements[currentWordIndex];
                            if (wordElement) {
                                const wordTop = wordElement.offsetTop;
                                const lineNumber = Math.floor(wordTop / lineHeight);
                                // Scroll to show exactly one line, aligned to line boundaries
                                transcript.scrollTop = lineNumber * lineHeight;
                            }
                        }, 10);
                        
                        currentWordIndex++;
                    } else {
                        clearInterval(highlightInterval);
                    }
                }, msPerWord);
                
                utterance.onend = function() {
                    clearInterval(highlightInterval);
                    // Remove all highlights when done
                    wordElements.forEach(el => el.classList.remove('highlighted'));
                };
                
                utterance.onerror = function(event) {
                    clearInterval(highlightInterval);
                    console.error('Speech synthesis error:', event);
                };
                
                // Start speaking
                speechSynthesis.speak(utterance);
            } else {
                // Fallback: just show the text if TTS is not available
                console.warn('Text-to-speech not supported');
                transcript.innerHTML = opponentText;
            }
        }
    }
    
    recordButton.addEventListener('click', function() {
        // Prevent clicking if already recorded
        if (hasRecorded) {
            return;
        }
        
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
});
