# Intelli-Complaint: AI-Powered Multilingual Support System

Intelli-Complaint is a state-of-the-art civic complaint management system designed to bridge the language gap between citizens and administration. It uses **Whisper** for high-accuracy local speech-to-text and **Llama 2 (via Ollama)** for intelligent complaint analysis. This system enables residents to file complaints in their preferred language (Hindi, English, or Hinglish) and provides administrators with AI-powered insights for efficient complaint resolution.

## Overview

The Intelli-Complaint system is built to solve critical infrastructure issues in municipal administrations by:
- Providing citizens with an easy-to-use voice-based complaint interface
- Automatically categorizing and extracting actionable information from complaints
- Empowering administrators with real-time dashboards to track and resolve issues
- Eliminating language barriers to improve civic participation

This solution is particularly beneficial for regions with diverse language speakers and limited digital literacy, making civic engagement more accessible and inclusive.

## Key Features

- **Multilingual Voice Input**: Supports Hindi, English, and Hinglish with intelligent auto-detection capabilities.
- **AI-Powered Analysis**: Automatic extraction of issue categories, affected areas, temporal information, and severity levels (e.g., "since 2 days").
- **Admin Dashboard**: Real-time analytics, status tracking, issue distribution charts, and complaint history management.
- **Robust Data Persistence**: SQLite database with automated JSON backups ensuring no data loss.
- **Premium User Interface**: Glassmorphic design with smooth animations, responsive layout, and accessibility features.
- **Entity Extraction**: Intelligent parsing of ward numbers, zone information, and location details from complaint descriptions.
- **Complaint History Tracking**: Complete audit trail of complaint lifecycle from submission to resolution.

---

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Recharts for data visualization.
- **Backend**: FastAPI (Python), Whisper for speech recognition, Ollama for local LLM integration (Llama 2).
- **Database**: SQLite3 with automated backup mechanisms.
- **Audio Processing**: FFmpeg for audio format conversion and processing.

---

## System Workflow

The Intelli-Complaint system follows a structured workflow to ensure efficient complaint processing:

### 1. Complaint Submission Phase
- Citizen accesses the complaint interface via web portal
- User selects input method: Voice recording or text entry
- For voice input: System captures audio in any supported language
- User provides complaint details (location, issue type, description, contact info)

### 2. Audio Processing Phase
- Audio file is validated and converted to compatible format using FFmpeg
- Audio quality assessment ensures clarity for transcription
- Temporary audio files are stored in designated folders for processing

### 3. Speech-to-Text Conversion
- Whisper speech recognition engine processes the audio independently on the user's machine
- Language is auto-detected from audio (Hindi, English, or Hinglish)
- Transcribed text is extracted and cleaned
- High-accuracy transcription with confidence scores ensures quality results

### 4. AI Analysis and Entity Extraction
- Llama 2 model (running locally via Ollama) analyzes the transcribed complaint
- Intelligent entity extraction identifies:
  - Issue category (pothole, water leakage, street light, etc.)
  - Ward and zone information
  - Affected location details
  - Temporal descriptors (when the issue started)
  - Severity assessment
- Structured complaint data is generated from unstructured text

### 5. Database Storage
- Complaint record is created in SQLite database with:
  - Complaint metadata (submission time, citizen ID)
  - Original transcribed text
  - Extracted entities and categories
  - Initial status (Pending)
  - Timestamp information
- Automated backup creates JSON snapshot of the complaint

### 6. Admin Processing Phase
- Administrator accesses dashboard to view incoming complaints
- Real-time analytics display complaint distribution by category, area, and status
- Admin can prioritize complaints based on severity and location
- Status updates: Pending → In Progress → Completed

### 7. Resolution Tracking
- System maintains complete audit trail of complaint lifecycle
- Historical data enables trend analysis and pattern identification
- Completed complaints are archived with resolution notes

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg**: Required for audio processing. Download [here](https://ffmpeg.org/download.html) and add to system PATH or specify in `.env`.
- **Ollama**: Download from [ollama.com](https://ollama.com) and pull Llama 2:
  ```bash
  ollama pull llama2
  ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   - Copy `.env.example` in the root (or backend folder) to `.env`.
   - Update `FFMPEG_BIN` and `FFPROBE_BIN` paths if they are not in your system PATH.
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Project Structure

```
ai-call-center/
├── backend/                  # FastAPI Server & AI Logic
│   ├── main.py              # Main API endpoints and request handlers
│   ├── complaint_logic.py    # Core complaint processing logic
│   ├── complaint_registration.py # Complaint registration and storage
│   ├── entity_extraction.py  # Entity extraction from transcribed text
│   ├── stt.py              # Speech-to-text integration with Whisper
│   ├── municipal_integration.py # Municipal database integration
│   ├── ward_zone.py        # Ward and zone information management
│   ├── requirements.txt     # Python package dependencies
│   └── .env                # Environment variables and configuration
│
├── frontend/               # React Frontend (Vite)
│   ├── src/pages/         # Dashboard, home, and admin pages
│   ├── src/services/      # API integration and services
│   ├── src/components/    # Reusable React components
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # TailwindCSS configuration
│
├── uploads/               # Temporary storage for audio files
├── audio_dataset/         # Audio samples for testing
├── data/                  # SQLite database and JSON backups
└── README.md             # Project documentation
```

---

## Usage

### Citizen Portal
1. Access the complaint submission interface
2. Choose input method (voice or text)
3. Speak or type your complaint describing:
   - Location and affected area (ward/zone)
   - Type of issue (infrastructure, sanitation, etc.)
   - Duration (how long the issue has existed)
   - Any additional context
4. Submit the complaint

### Admin Dashboard
1. Access the administrative dashboard
2. View incoming complaints with:
   - Real-time analytics showing complaint distribution by category
   - Geographic visualization of affected areas
   - Status breakdown (Pending, In Progress, Completed)
3. Update complaint status as work progresses
4. View detailed extraction of issue areas and temporal information
5. Track resolution metrics and performance trends

---

## Contribution

Feel free to fork this project and submit PRs. For major changes, please open an issue first.

## License

MIT License
