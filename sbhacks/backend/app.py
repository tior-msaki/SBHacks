import json
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

from search_engine import search
from scraper import process_html
from google import genai
from user_storage import log_in
from dotenv import load_dotenv
import os
from elevenlabs.client import ElevenLabs
from fastapi.responses import Response

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# ElevenLabs configuration
MODEL_VERSION = "eleven_multilingual_v2"
VOICE_IDS = {
    1: "KnTv6RLzB4khP0x7xem1",  # Berta
    2: "WLOYW6YwyA4c6LBQKJ36",  # Andrew
    3: "l2xKdzGYYWPy0gKbjRXC"   # Sophia
}

app = FastAPI()

# Enable CORS so your React app can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class LoginRequest(BaseModel):
    username: str
    difficulty: str = "easy"
    avatar: int = 1

class CounterArgumentRequest(BaseModel):
    topic: str
    difficulty: str
    player_transcript: str = ""  # Optional: player's argument
    role: str = ""  # Optional: proponent or opponent

class WinnerRequest(BaseModel):
    argument: str
    counterargument: str
    topic: str

class FeedbackRequest(BaseModel):
    argument: str
    topic: str

class TextToSpeechRequest(BaseModel):
    text: str
    avatar: int  # 1 = Berta, 2 = Andrew, 3 = Sophia
    model_ver: str = "eleven_multilingual_v2"


@app.get('/get-topic')
def get_topic():
    """Get a random debate topic from topics.txt"""
    file_path = "./topics.txt"
    try:
        import os
        if not os.path.exists(file_path):
            # Return a default topic if file doesn't exist
            default_topics = [
                "Social media has a positive impact on society",
                "Remote work is more productive than office work",
                "Artificial intelligence will create more jobs than it eliminates",
                "Pizzas with pineapple are the absolute best!"
            ]
            topic = random.choice(default_topics)
            print(f"Topics file not found, using default topic: {topic}")
            return {"topic": topic}
        
        with open(file_path, 'r') as f:
            topics = f.readlines()
            if not topics:
                raise ValueError("topics.txt is empty")
            idx = random.randint(0, len(topics) - 1)
            topic = topics[idx].strip()
            return {"topic": topic}
    except Exception as e:
        print(f"Error in get_topic: {str(e)}")
        # Return a default topic instead of failing
        default_topics = [
            "Social media has a positive impact on society",
            "Remote work is more productive than office work",
            "Artificial intelligence will create more jobs than it eliminates"
        ]
        topic = random.choice(default_topics)
        return {"topic": topic}


@app.get('/get-hints/{topic}')
def get_hints(topic: str):
    """Get hints/background information for a debate topic"""
    try:
        urls = search(topic)
        s = requests.Session()
        info_list = []
        for url in urls[:3]:  # Limit to first 3 URLs
            info = process_html(s, url)
            if info:
                info_list.append(info)
        
        combined_info = "\n\n".join(info_list)
        if combined_info:
            return {"hints": combined_info[:1000]}  # Limit response size
        else:
            # Return default hints if search fails
            return {"hints": f"Research shows various perspectives on {topic}. Multiple studies have examined this issue. Experts have differing opinions on the topic."}
    except Exception as e:
        print(f"Error in get_hints: {str(e)}")
        # Return default hints instead of failing
        return {"hints": f"Research shows various perspectives on {topic}. Multiple studies have examined this issue. Experts have differing opinions on the topic."}


@app.post('/get-counterargument')
def counterargument(request: CounterArgumentRequest):
    """Generate AI opponent's counterargument"""
    try:
        import os
        blueprint_path = 'system_blueprint.json'
        if not os.path.exists(blueprint_path):
            print(f"system_blueprint.json not found at {blueprint_path}")
            # Return a simple fallback response
            return {"argument": f"I understand your perspective on {request.topic}, but I must respectfully disagree. There are important considerations we should examine. The evidence suggests we need to look at this from multiple angles."}
        
        with open(blueprint_path, 'r') as file:
            data = json.load(file)
        
        contents = f"The topic is {request.topic}. "
        if request.player_transcript:
            contents += f"The player's argument: {request.player_transcript}. "
        contents += data.get("global_policy", "")
        if request.difficulty in data.get("agents", {}):
            contents += data["agents"][request.difficulty].get("prompt", "")
        
        if not api_key:
            print("GEMINI_API_KEY not set, using fallback response")
            return {"argument": f"While I understand your points about {request.topic}, I have a different perspective. Research and evidence suggest there are important considerations we should examine."}
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        return {"argument": response.text}
    except Exception as e:
        print(f"Error in get-counterargument: {str(e)}")
        # Return a fallback instead of failing
        return {"argument": f"I have concerns about the topic: {request.topic}. There are different perspectives to consider, and I believe we need to examine the evidence more carefully."}


@app.post('/get-winner')
def get_winner(request: WinnerRequest):
    """Determine the winner of the debate"""
    try:
        contents = f"The topic is {request.topic}. This is the argument: {request.argument}. This is the counter argument: {request.counterargument}. Do not be biased on emotion. Determine whose argument is better SOLELY based on clarity, organization, structure, and relevance. Your answer should be 'argument' or 'counterargument'"
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        # Return 0 if user wins, 1 if opponent wins
        if 'argument' in response.text.lower() and 'counterargument' not in response.text.lower():
            return {"winner": 0}
        return {"winner": 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/get-feedback')
def get_feedback(request: FeedbackRequest):
    """Get constructive feedback on user's argument"""
    try:
        contents = f"This is the user argument: {request.argument} for topic {request.topic}. Provide 2 bullet points of constructive criticism based on good speech and debate principles. Maintain politeness."
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        return {"feedback": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/login')
def login(request: LoginRequest):
    """Handle user login/registration"""
    try:
        message, user = log_in(
            request.username,
            new_diff=request.difficulty,
            new_avi=request.avatar
        )
        return {"message": message, "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/text-to-speech')
async def text_to_speech(request: TextToSpeechRequest):
    """Generate speech using ElevenLabs API"""
    try:
        print(f"TTS Request: avatar={request.avatar}, text_length={len(request.text)}")
        
        elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        if not elevenlabs_api_key:
            print("ERROR: ELEVENLABS_API_KEY not set in environment")
            raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not configured")
        
        elevenlabs = ElevenLabs(
            api_key=elevenlabs_api_key,
        )

        # Get voice ID for the avatar
        voice_id = VOICE_IDS.get(request.avatar, VOICE_IDS[1])
        print(f"Using voice_id: {voice_id} for avatar {request.avatar}")
        
        # Generate audio
        audio = elevenlabs.text_to_speech.convert(
            text=request.text,
            voice_id=voice_id,
            model_id=request.model_ver,
            output_format="mp3_44100_128",
        )

        # Read the audio bytes
        audio_bytes = b""
        for chunk in audio:
            audio_bytes += chunk

        print(f"Generated audio: {len(audio_bytes)} bytes")
        
        # Return audio as MP3
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=speech.mp3"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"TTS Error: {error_msg}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"TTS Error: {error_msg}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)