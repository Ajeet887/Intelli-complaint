import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")

def process_complaint(raw_text):
    """
    Processes a complaint written in Hindi, English, or Hinglish.
    """
    if not raw_text or raw_text.strip() == "":
        return {
            "processed_text": "Error: No complaint text provided.",
            "issue": "Input Error",
            "area": "Not Specified",
            "time": "Not Specified",
            "error": True
        }

    prompt = f"""
Analyze this civic complaint and provide a structured JSON response.
The complaint can be in Hindi, English, or Hinglish.

Complaint Text: "{raw_text}"

You MUST respond with a JSON object in this EXACT format:
{{
  "processed_text": "A concise summary of the complaint",
  "issue": "A specific English category (e.g., Garbage Collection, Road Damage, Water Leakage)",
  "area": "The name of the area mentioned, or 'Not Specified'",
  "time": "The time duration or when the issue started, or 'Not Specified'"
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",  # FORCES OLLAMA TO RETURN JSON
                "options": {
                    "temperature": 0.1,
                    "num_predict": 150
                }
            },
            timeout=180
        )

        if response.status_code == 200:
            result_text = response.json().get("response", "").strip()
            print(f"DEBUG: Raw AI Response -> {result_text}")

            # Extract JSON safely
            start = result_text.find("{")
            end = result_text.rfind("}") + 1

            if start != -1 and end > start:
                try:
                    parsed = json.loads(result_text[start:end])
                    
                    # REJECTION TEST: If the AI puts English explanation in the summary, reject it.
                    sum_text = parsed.get("processed_text", "")
                    if "written in" in sum_text.lower() or "translated" in sum_text.lower():
                         raise Exception("AI provided meta-commentary instead of summary")

                    return parsed
                except json.JSONDecodeError:
                    print(f"DEBUG: Failed to parse JSON from -> {result_text[start:end]}")

        print(f"DEBUG: AI Call Failed with status {response.status_code}")
        raise Exception(f"Invalid AI response (Status: {response.status_code})")

    except Exception as e:
        print(f"DEBUG: Exception in process_complaint -> {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "processed_text": f"Error: Failed to process complaint (System Busy: {str(e)}).",
            "issue": "Other Civic Issue",
            "area": "Not Specified",
            "time": "Not Specified",
            "error": True
        }
