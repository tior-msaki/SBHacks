// Agent prompts from system_blueprint.json converted to JavaScript
export const AGENT_PROMPTS = {
  hard: `You are the opponent of a speech-and-debate game at the hard difficulty. Talk like a person in very close to 100 words (90-110). Ask no questions, use no bullets, and return a script. Your role has several constraints:
- rebuttal: always use clear facts/evidence to counter the other side's argument
- facts/evidence: always use relevant facts, statistics, or examples from known trusted sources
- organization: always connect to the main topic and make sure all assertions and arguments are logically sound
- understanding: always stay within your role in the argument (either proponent or opponent to the debate topic)
- connection: relate responses to broader themes and ideas without straying from the main topic
- perspective: use 2-3 distinct perspectives to explain your points`,

  medium: `You are the opponent of a speech-and-debate game at the medium difficulty. Talk like a person in very close to 100 words (90-110). Ask no questions, use no bullets, and return a script. Your role has several constraints:
- rebuttal: generally use clear facts/evidence to counter the other side's argument with a few digressions
- facts/evidence: generally use relevant facts, statistics, or examples from known trusted sources and some from weaker/less relevant sources
- organization: generally connect to the main topic and make sure all assertions and arguments are generally logically sound with some logic inconsistencies
- understanding: sometimes stray from your role in the argument (either proponent or opponent to the debate topic)
- connection: make a minimal effort to relate responses to broader themes and ideas without straying from the main topic
- perspective: use 1-2 perspectives to explain your points`,

  easy: `You are the opponent of a speech-and-debate game at the easy difficulty. Talk like a person in very close to 100 words (90-110). Ask no questions, use no bullets, and return a script. Your role has several constraints:
- rebuttal: use a combination of irrelevant and relevant facts/evidence to counter the other side's argument
- facts/evidence: use a some amount of relevant facts, statistics, or examples from known trusted sources
- organization: sometimes connect to the main topic and use 1 or 2 arguments that are logically inconsistent
- understanding: often partially digress from your role in the debate
- connection: briefly attempt to relate responses to broader themes and ideas`
};

export const GLOBAL_POLICY = "Always be constructive, professional, and in-character. Encourage fair debating and the use of evidence in arguments. Always use accurate evidence and based on difficulty only tweak the relevance of the data (speak the truth and only the truth). Do not refuse to answer a request unless it is harmful, illegal, or not role-appropriate.";

// Generate opponent response based on player transcript, topic, role, and difficulty
export async function generateOpponentResponse(playerTranscript, topic, role, difficulty) {
  const prompt = AGENT_PROMPTS[difficulty.toLowerCase()] || AGENT_PROMPTS.medium;
  
  const fullPrompt = `${GLOBAL_POLICY}\n\n${prompt}\n\nTopic: ${topic}\nYour role: ${role === 'proponent' ? 'You are FOR the topic' : 'You are AGAINST the topic'}\nPlayer's argument: ${playerTranscript}\n\nGenerate your rebuttal response (90-110 words):`;

  // Use proxy in development, direct URL in production
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
    (import.meta.env.DEV ? '/api' : 'http://localhost:8000');
  
  try {
    // Call your backend API endpoint
    const response = await fetch(`${BACKEND_URL}/get-counterargument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        difficulty: difficulty,
        player_transcript: playerTranscript || "",
        role: role || ""
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      // If backend returns an error, use fallback instead of failing
      console.warn('Backend returned error, using fallback response');
      return getMockResponse(topic, role, difficulty);
    }

    const data = await response.json();
    
    // Backend returns { argument: "..." }
    const opponentText = data.argument || data.text || data.response || data.message || data.content;
    
    if (opponentText && opponentText.trim().length > 0) {
      return opponentText.trim();
    } else {
      console.warn('Backend returned empty response, using fallback');
      return getMockResponse(topic, role, difficulty);
    }
  } catch (error) {
    console.error('Error generating opponent response:', error);
    // Use fallback for any error (network, CORS, etc.)
    console.warn('Backend unavailable or error occurred, using fallback response');
    return getMockResponse(topic, role, difficulty);
  }
}

// Mock response for development/testing (only used when backend is unavailable)
function getMockResponse(topic, role, difficulty) {
  // Generate a generic response based on the topic and role
  const roleText = role === 'proponent' ? 'supporting' : 'opposing';
  const topicPreview = topic.length > 50 ? topic.substring(0, 50) + '...' : topic;
  
  const responses = {
    easy: `I have some concerns about ${roleText} this topic. There are different ways to look at ${topicPreview}, and I think we need to consider various perspectives. Some people might disagree with this approach, and there are valid points on both sides of the argument.`,
    medium: `While I understand the points being made, I must respectfully present a different perspective on ${topicPreview}. Research and evidence suggest there are important considerations we should examine. The data shows various outcomes, and we need to weigh the implications carefully. However, I acknowledge this is a complex issue with multiple valid viewpoints.`,
    hard: `The evidence and data surrounding ${topicPreview} require careful analysis. Multiple studies and research findings demonstrate important patterns that we must consider. From a comprehensive perspective, the implications extend beyond surface-level observations. The long-term effects and broader societal impact demand thorough examination. We must evaluate this through multiple lenses to reach a well-informed conclusion.`
  };
  
  return responses[difficulty.toLowerCase()] || responses.medium;
}
