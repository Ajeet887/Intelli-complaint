from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from speech_to_text import transcribe_audio
from ai_processor import process_complaint
from database import save_complaint, update_complaint_status, ensure_schema
from backup_writer import backup_to_json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
def init_db():
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input_type TEXT,
        original_text TEXT,
        processed_text TEXT,
        language TEXT,
        issue TEXT,
        area TEXT,
        time TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Pending',
        priority TEXT DEFAULT 'Medium'
    )''')
    conn.commit()
    conn.close()
    ensure_schema() # Run migrations if needed

init_db()

class Complaint(BaseModel):
    input_type: str
    original_text: str
    processed_text: str
    language: str
    issue: str = ""
    area: str = ""
    time: str = ""

class StatusUpdate(BaseModel):
    status: str

def get_all_complaints():
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM complaints')
    complaints = cursor.fetchall()
    # Map to dictionary for easier frontend handling if needed, but array is fine
    # DB order: id, input_type, original_text, processed_text, language, issue, area, time, timestamp, status, priority
    conn.close()
    return complaints

@app.post('/submit-text')
def submit_text(complaint: Complaint):
    result = process_complaint(complaint.original_text)
    
    if result.get('error'):
        raise HTTPException(status_code=400, detail=result['processed_text'])
        
    save_complaint(complaint.input_type, complaint.original_text, result['processed_text'], complaint.language, result['issue'], result['area'], result['time'])
    complaints = get_all_complaints()
    backup_to_json(complaints)
    return {'status': 'success', 'summary': result['processed_text']}

@app.post('/submit-voice')
def submit_voice(file: UploadFile = File(...)):
    import tempfile
    
    # Use a system temp directory so Uvicorn doesn't reload when we write files
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        tmp.write(file.file.read())
        file_path = tmp.name
    
    try:
        # Use Vosk Hindi model for transcription
        raw_text = transcribe_audio(file_path)
        print(f"DEBUG: Raw Transcription -> {raw_text}")
        
        # Process with AI (now handles validation internally)
        result = process_complaint(raw_text)
        
        if result.get('error'):
            # Clean up temp file before aborting
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=result['processed_text'])
        
        save_complaint('voice', raw_text, result['processed_text'], 'Hindi', result['issue'], result['area'], result['time'])
        complaints = get_all_complaints()
        backup_to_json(complaints)
        
        return {'status': 'success', 'summary': result['processed_text'], 'original': raw_text}
    finally:
        # ALWAYS clean up temp file even if transcription fails
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get('/complaints')
def get_complaints():
    return get_all_complaints()

@app.put('/complaints/{complaint_id}/status')
def update_status_endpoint(complaint_id: int, status_update: StatusUpdate):
    update_complaint_status(complaint_id, status_update.status)
    return {"status": "success", "message": "Status updated"}

@app.get('/admin')
def admin_page():
    # In the new React setup, the admin dashboard is a route in the React app (e.g., /dashboard)
    # We point to the build folder (dist) for production deployment
    dist_path = os.path.join(os.path.dirname(__file__), "../frontend/dist/index.html")
    if os.path.exists(dist_path):
        return FileResponse(dist_path)
    return {"message": "Admin dashboard is part of the React app. Please run the frontend and navigate to /dashboard"}

@app.get('/')
def root():
    dist_path = os.path.join(os.path.dirname(__file__), "../frontend/dist/index.html")
    if os.path.exists(dist_path):
        return FileResponse(dist_path)
    return {"message": "AI Complaint System API", "endpoints": ["/submit-text", "/submit-voice", "/complaints", "/admin"]}

# Serve static files from the React build
dist_folder = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(dist_folder):
    # Mount assets folder
    assets_folder = os.path.join(dist_folder, "assets")
    if os.path.exists(assets_folder):
        app.mount("/assets", StaticFiles(directory=assets_folder), name="assets")

    # Catch-all Route for React SPA (must be LAST)
    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        index_path = os.path.join(dist_folder, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Not Found"}
