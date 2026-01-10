
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import base64
import os 

MODEL_VERSION = "eleven_multilingual_v2"

VOICE_IDS = {
    1: "KnTv6RLzB4khP0x7xem1",
    2: "WLOYW6YwyA4c6LBQKJ36",
    3: "l2xKdzGYYWPy0gKbjRXC"
}
voice = elevenlabs.text_to_voice.create(
    voice_name="Berta",
    voice_description="Middle-aged black lady",
    # The generated voice ID of the preview you want to use,
    # using the first in the list for this example
    generated_voice_id=voice_ids[1]
)

#l2xKdzGYYWPy0gKbjRXC

for preview in voices.previews:
    # Convert base64 to audio buffer
    audio_buffer = base64.b64decode(preview.audio_base_64)

    print(f"Playing preview: {preview.generated_voice_id}")

# voice = elevenlabs.text_to_voice.create(
#     voice_name="Berta",
#     voice_description="Middle-aged black lady",
#     # The generated voice ID of the preview you want to use,
#     # using the first in the list for this example
#     generated_voice_id=voice_ids[1]
# )

# voice = elevenlabs.text_to_voice.create(
#     voice_name="Andrew",
#     voice_description="New grad male, deep voice.",
#     # The generated voice ID of the preview you want to use,
#     # using the first in the list for this example
#     generated_voice_id=voice_ids[2]
# )

# voice = elevenlabs.text_to_voice.create(
#     voice_name="Sophia",
#     voice_description="Young, corporate woman",
#     # The generated voice ID of the preview you want to use,
#     # using the first in the list for this example
#     generated_voice_id=voice_ids[3]
# )

def generate_speech(text, avatar, model_ver=MODEL_VERSION):
    load_dotenv()

    elevenlabs = ElevenLabs(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
    )

    audio = elevenlabs.text_to_speech.convert(
        text=f"{text}",
        voice_id=f"{VOICE_IDS[avatar]}",
        model_id=f"{model_ver}",
        output_format="mp3_44100_128",
    )

    play(audio)

if __name__ == "__main__":
    generate_speech("Hello, this is a test of the Eleven Labs text to speech synthesis.", 2)    