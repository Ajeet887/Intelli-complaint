from vosk import Model, KaldiRecognizer
import wave
import json
import os
import subprocess
from pydub import AudioSegment

from dotenv import load_dotenv

load_dotenv()

# ---------------------------
# FFmpeg setup
# ---------------------------
FFMPEG_BIN = os.getenv("FFMPEG_BIN", "ffmpeg")
FFPROBE_BIN = os.getenv("FFPROBE_BIN", "ffprobe")

# Configure pydub
AudioSegment.converter = FFMPEG_BIN
AudioSegment.ffprobe = FFPROBE_BIN

# ---------------------------
# Load Vosk model
# ---------------------------
MODEL_PATH = "models/vosk-model-hi-0.22"
model = Model(MODEL_PATH) if os.path.exists(MODEL_PATH) else None


# ---------------------------
# Convert any audio → WAV mono PCM
# ---------------------------
def convert_to_wav_mono(input_path):
    """
    Converts audio to:
    - WAV
    - Mono
    - PCM 16-bit
    - 16kHz sample rate
    """
    output_path = input_path.rsplit(".", 1)[0] + ".wav"

    command = [
        FFMPEG_BIN,
        "-y",
        "-i", input_path,
        "-ac", "1",               # mono
        "-ar", "16000",           # sample rate
        "-c:a", "pcm_s16le",      # PCM
        output_path
    ]

    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_path


# ---------------------------
# Transcription function
# ---------------------------
def transcribe_audio(file_path):
    if model is None:
        return "Vosk model not found. Please download and place it in models/ folder."

    try:
        # ALWAYS convert first (even if already wav)
        wav_path = convert_to_wav_mono(file_path)

        wf = wave.open(wav_path, "rb")

        # Final safety check
        if (
            wf.getnchannels() != 1 or
            wf.getsampwidth() != 2 or
            wf.getcomptype() != "NONE"
        ):
            wf.close()
            return "Audio file must be WAV format mono PCM."

        rec = KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)

        text = ""

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                text += result.get("text", "") + " "

        final_result = json.loads(rec.FinalResult())
        text += final_result.get("text", "")

        wf.close()
        return text.strip() if text.strip() else "No speech detected"

    except Exception as e:
        return f"Transcription failed: {str(e)}"
