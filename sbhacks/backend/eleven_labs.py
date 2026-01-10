
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import base64
import os 

load_dotenv()

MODEL_VERSION = "eleven_multilingual_ttv_v2"

voice_ids = {
    1: "KnTv6RLzB4khP0x7xem1",
    2: "WLOYW6YwyA4c6LBQKJ36",
    3: "l2xKdzGYYWPy0gKbjRXC"
}

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

voice = elevenlabs.text_to_voice.create(
    voice_name="Berta",
    voice_description="Middle-aged black lady",
    # The generated voice ID of the preview you want to use,
    # using the first in the list for this example
    generated_voice_id=voice_ids[1]
)

voice = elevenlabs.text_to_voice.create(
    voice_name="Andrew",
    voice_description="New grad male, deep voice.",
    # The generated voice ID of the preview you want to use,
    # using the first in the list for this example
    generated_voice_id=voice_ids[2]
)

voice = elevenlabs.text_to_voice.create(
    voice_name="Sophia",
    voice_description="Young, corporate woman",
    # The generated voice ID of the preview you want to use,
    # using the first in the list for this example
    generated_voice_id=voice_ids[3]
)


# def generate_speech(text, avatar, model_ver=MODEL_VERSION):
#     elevenlabs = ElevenLabs(
#         api_key=os.getenv("ELEVENLABS_API_KEY"),
#         )

#     client = ElevenLabs()

#     audio = client.text_to_speech.convert(
#         text=f"{text}",
#         voice_id=f"{voice_ids[avatar]}",
#         model_id=f"{model_ver}",
#         output_format="mp3_44100_128",
#     )

#     play(audio)

# if __name__ == "__main__":
#     generate_speech("Hello, this is a test of the Eleven Labs text to speech synthesis.", 1)    