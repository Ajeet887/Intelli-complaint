import whisper
import os
from dotenv import load_dotenv

load_dotenv()

# Load Whisper model
# "base" is a good balance between speed and accuracy
# It will download on first run (approx 140MB)
print("Loading Whisper model...")
model = whisper.load_model("base")

def transcribe_audio(file_path):
    """
    Transcribes audio using OpenAI Whisper.
    Supports multilingual input automatically.
    """
    try:
        if not os.path.exists(file_path):
            return "Audio file not found."
            
        # Whisper handles complex audio formats automatically via ffmpeg
        result = model.transcribe(file_path)
        return result["text"].strip()
    except Exception as e:
        print(f"Whisper Error: {str(e)}")
        return f"Transcription failed: {str(e)}"
