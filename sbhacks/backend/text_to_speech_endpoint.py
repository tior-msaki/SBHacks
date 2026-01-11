"""
FastAPI endpoint for ElevenLabs text-to-speech
Add this to your app.py file
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os

load_dotenv()

MODEL_VERSION = "eleven_multilingual_v2"

VOICE_IDS = {
    1: "KnTv6RLzB4khP0x7xem1",  # Berta
    2: "WLOYW6YwyA4c6LBQKJ36",  # Andrew
    3: "l2xKdzGYYWPy0gKbjRXC"   # Sophia
}

class TextToSpeechRequest(BaseModel):
    text: str
    avatar: int  # 1 = Berta, 2 = Andrew, 3 = Sophia
    model_ver: str = MODEL_VERSION

@app.post('/text-to-speech')
async def text_to_speech(request: TextToSpeechRequest):
    """Generate speech using ElevenLabs API"""
    try:
        elevenlabs = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY"),
        )

        # Get voice ID for the avatar
        voice_id = VOICE_IDS.get(request.avatar, VOICE_IDS[1])
        
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

        # Return audio as MP3
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=speech.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
