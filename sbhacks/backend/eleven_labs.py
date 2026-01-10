# example.py
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import base64
import os 

load_dotenv()

#MODEL_VERSION = "eleven_multilingual_ttv_v2"

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

# voices = elevenlabs.text_to_voice.design(
#     model_id="eleven_multilingual_ttv_v2",
#     voice_description="A middle-aged woman speaking at a quick pace. She has a gentle and soft tone.",
#     text="Your weapons are but toothpicks to me. Surrender now and I may grant you a swift end. I've toppled kingdoms and devoured armies. What hope do you have against me?",
# )

#KnTv6RLzB4khP0x7xem1

# voices = elevenlabs.text_to_voice.design(
#     model_id="eleven_multilingual_ttv_v2",
#     voice_description="A fresh-graduate out of college who speaks in a deep-voiced, bright tone. He speaks at a medium speed",
#     text="Your weapons are but toothpicks to me. Surrender now and I may grant you a swift end. I've toppled kingdoms and devoured armies. What hope do you have against me?",
# )

#WLOYW6YwyA4c6LBQKJ36

voices = elevenlabs.text_to_voice.design(
    model_id="eleven_multilingual_ttv_v2",
    voice_description="A woman who works in corporate with a fast, excited tone. She speaks in a decently high pitch",
    text="Your weapons are but toothpicks to me. Surrender now and I may grant you a swift end. I've toppled kingdoms and devoured armies. What hope do you have against me?",
)

#l2xKdzGYYWPy0gKbjRXC

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

# voice_ids = {
#     1: 

# }

# client = ElevenLabs()

# audio = client.text_to_speech.convert(
#     text=f"{text}",
#     voice_id=f"{voice_ids[avatar]}",
#     model_id=f"{MODEL_VERSION}",
#     output_format="mp3_44100_128",
# )

#play(audio)