# ElevenLabs TTS Integration Guide

## Overview
The opponent's voice now uses ElevenLabs text-to-speech, with different voices for each avatar (Berta, Andrew, Sophia).

## Backend Setup

### 1. Add to `app.py`

Add these imports at the top:
```python
from elevenlabs.client import ElevenLabs
from fastapi.responses import Response
```

Add this model class with your other Pydantic models:
```python
class TextToSpeechRequest(BaseModel):
    text: str
    avatar: int  # 1 = Berta, 2 = Andrew, 3 = Sophia
    model_ver: str = "eleven_multilingual_v2"
```

Add these constants:
```python
MODEL_VERSION = "eleven_multilingual_v2"

VOICE_IDS = {
    1: "KnTv6RLzB4khP0x7xem1",  # Berta
    2: "WLOYW6YwyA4c6LBQKJ36",  # Andrew
    3: "l2xKdzGYYWPy0gKbjRXC"   # Sophia
}
```

Add this endpoint:
```python
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
```

### 2. Environment Variable
Make sure your `.env` file has:
```
ELEVENLABS_API_KEY=your_api_key_here
```

## Frontend Changes

The frontend has been updated to:
- Use ElevenLabs TTS for opponent speech based on avatar
- Fall back to browser TTS if ElevenLabs is unavailable
- Maintain word highlighting during speech

## How It Works

1. When the opponent speaks, the Courtroom component calls `speakWithElevenLabs()`
2. This function sends a request to `/text-to-speech` with:
   - `text`: The opponent's argument
   - `avatar`: 1 (Berta), 2 (Andrew), or 3 (Sophia)
3. The backend generates audio using ElevenLabs with the correct voice
4. The frontend plays the audio and highlights words as they're spoken

## Voice Mapping

- **Berta** (avatar 1) → Voice ID: `KnTv6RLzB4khP0x7xem1`
- **Andrew** (avatar 2) → Voice ID: `WLOYW6YwyA4c6LBQKJ36`
- **Sophia** (avatar 3) → Voice ID: `l2xKdzGYYWPy0gKbjRXC`

## Testing

1. Start your backend: `python -m uvicorn app:app --reload --port 8000`
2. Start your frontend: `npm run dev`
3. Go through the debate flow
4. When the opponent speaks, you should hear their unique voice!

## Troubleshooting

- **No audio playing**: Check browser console for errors
- **Wrong voice**: Verify the avatar name matches (Berta, Andrew, Sophia)
- **Backend error**: Check that `ELEVENLABS_API_KEY` is set in your `.env` file
- **CORS errors**: Make sure CORS middleware is enabled in your FastAPI app
