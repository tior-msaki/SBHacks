// Service to evaluate player performance and generate feedback
export function evaluatePerformance(playerTranscript, recordingDuration, difficulty, topic, role) {
  // Calculate score based on various factors
  let score = 0;
  const feedback = [];

  // Duration scoring (0-30 points)
  if (recordingDuration >= 30) {
    score += 30;
  } else if (recordingDuration >= 15) {
    score += 20;
  } else if (recordingDuration >= 5) {
    score += 10;
  } else {
    feedback.push('*try speaking for longer to develop your argument more fully');
  }

  // Content analysis (0-40 points)
  const wordCount = playerTranscript.split(/\s+/).length;
  if (wordCount >= 80) {
    score += 20;
  } else if (wordCount >= 50) {
    score += 15;
  } else if (wordCount >= 30) {
    score += 10;
  } else {
    feedback.push('*try using broader concepts that relate to the main topic');
  }

  // Evidence and sources (0-30 points)
  const hasEvidence = /(study|research|data|statistic|source|evidence|according|shows|proves)/i.test(playerTranscript);
  if (hasEvidence) {
    score += 30;
  } else {
    feedback.push('*you should use more relevant sources and pieces of evidence');
  }

  // Default feedback if none generated
  if (feedback.length === 0) {
    feedback.push('*great job! Keep developing your arguments with more evidence');
    feedback.push('*consider connecting your points to broader themes');
  }

  // Determine win/loss (for now, based on duration - can be enhanced)
  const won = recordingDuration >= 5;

  return {
    score: Math.min(100, score),
    feedback,
    won,
    recordingDuration
  };
}
