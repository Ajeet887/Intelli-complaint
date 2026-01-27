# 🇮🇳 Intelli-Complaint: AI-Powered Multilingual Support System

Intelli-Complaint is a state-of-the-art civic complaint management system designed to bridge the language gap between citizens and administration. It uses **Vosk** for high-accuracy local speech-to-text and **Llama 2 (via Ollama)** for intelligent complaint analysis.

## 🚀 Key Features
- **🎙️ Multilingual Voice Input**: Supports Hindi, English, and Hinglish with auto-detection.
- **🧠 AI Analysis**: Automatically extracts specific issue categories, areas, and temporal information (e.g., "since 2 days").
- **📊 Admin Dashboard**: Real-time analytics, status tracking, and issue distribution charts.
- **📁 Robust Storage**: SQLite database for persistence with automated JSON backups.
- **📱 Premium UI**: Glassmorphic design with smooth transitions and responsive layout.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Lucide Icons, Recharts.
- **Backend**: FastAPI (Python), Vosk, Ollama (Llama 2).
- **Database**: SQLite3.

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

## 📁 Project Structure
```text
ai-call-center/
├── backend/            # FastAPI Server & AI Logic
│   ├── main.py         # API Endpoints
│   ├── speech_to_text.py # Vosk Integration
│   ├── ai_processor.py # Ollama/Llama Logic
│   └── .env            # Private configurations
├── frontend/           # React Frontend (Vite)
│   ├── src/pages/      # Dashboard & Home pages
│   └── src/services/   # API integration
├── data/               # SQLite database & backups
└── documentation/      # Design assets & screenshots
```

---

## 📝 Usage
1. **Citizen Portal**: Speak or type your complaint.
2. **Dashboard**: View trends, update status (Pending -> In Progress -> Completed), and see detailed extraction of issue areas and timestamps.

---

## 🤝 Contribution
Feel free to fork this project and submit PRs. For major changes, please open an issue first.

## 📄 License
MIT License
