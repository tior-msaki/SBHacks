# example.py
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import base64
import os 

load_dotenv()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

voices = elevenlabs.text_to_voice.design(
    model_id="eleven_multilingual_ttv_v2",
    voice_description="A woman in her 50s, who speaks gently and slowly.",
    text="Balanced analysis weighs benefits against risks, acknowledging tradeoffs without extreme or claims.",
)

for preview in voices.previews:
    # Convert base64 to audio buffer
    audio_buffer = base64.b64decode(preview.audio_base_64)

    print(f"Playing preview: {preview.generated_voice_id}")

    play(audio_buffer)

# voice = elevenlabs.text_to_voice.create(
#     voice_name="Woman in her 50s",
#     voice_description="A woman in her 50s, who speaks in a high pitched, breathy, shaky tone. She speaks slowly.",
#     # The generated voice ID of the preview you want to use,
#     # using the first in the list for this example
#     generated_voice_id=DVbI3B0eWxuh6I5AXg7w
# )

voice_ids = {
    1: 

}

client = ElevenLabs()

audio = client.text_to_speech.convert(
    text=f"{text}",
    voice_id=f"{voice_ids[avatar]}",
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",
)

play(audio)