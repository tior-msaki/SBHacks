// src/api.js

const BASE_URL = "http://localhost:8000";

export const api = {
  async getTopic() {
    const res = await fetch(`${BASE_URL}/get-topic`);
    if (!res.ok) throw new Error("Failed to fetch topic");
    return res.text();
  },

  async getCounterargument(topic, difficulty, avatar = 2) {
    const res = await fetch(`${BASE_URL}/get-counterargument`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty, avatar }),
    });

    if (!res.ok) throw new Error("Failed to get counterargument");
    return res.json(); // { text, audio_base64 }
  },

  async speechToText(audioBlob) {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "speech.wav");

    const res = await fetch(`${BASE_URL}/speech-to-text`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Speech-to-text failed");
    return res.json(); // { success, text }
  },

  async getWinner(argument, counterargument, topic) {
    const res = await fetch(`${BASE_URL}/get-winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ argument, counterargument, topic }),
    });

    if (!res.ok) throw new Error("Failed to get winner");
    return res.json();
  },

  async getFeedback(argument, topic) {
    const res = await fetch(`${BASE_URL}/get-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ argument, topic }),
    });

    if (!res.ok) throw new Error("Failed to get feedback");
    return res.json();
  },
};
