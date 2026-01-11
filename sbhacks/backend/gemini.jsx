import React, { useState } from "react";
import axios from "axios";

const GeminiCaller = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);

  const callGemini = async () => {
  
    try {
      const res = await axios.post("http://localhost:8000/api/gemini",
        {prompt: prompt,},
      );
      setResponse(res.data.response);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch Gemini response"
        );
        };
    };

    return (
        <div>
                {/* however itll look like using {response}*/}
        </div>
    );
};


export default GeminiCaller;
