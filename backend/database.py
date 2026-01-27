import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", '../data/complaints.db')

# Ensure we have the status column
def ensure_schema():
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Check if status column exists
    cursor.execute("PRAGMA table_info(complaints)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if 'status' not in columns:
        print("Migrating database: Adding 'status' column...")
        cursor.execute("ALTER TABLE complaints ADD COLUMN status TEXT DEFAULT 'Pending'")
    
    if 'priority' not in columns:
        print("Migrating database: Adding 'priority' column...")
        cursor.execute("ALTER TABLE complaints ADD COLUMN priority TEXT DEFAULT 'Medium'")

    conn.commit()
    conn.close()

ensure_schema()

def save_complaint(input_type, original_text, processed_text, language, issue, area, time_info):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Default status is Pending, Priority is Medium (can be inferred later by AI)
    cursor.execute('''
        INSERT INTO complaints (input_type, original_text, processed_text, language, issue, area, time, status, priority) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (input_type, original_text, processed_text, language, issue, area, time_info, 'Pending', 'Medium'))
    conn.commit()
    conn.close()

def update_complaint_status(complaint_id, status):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE complaints SET status = ? WHERE id = ?', (status, complaint_id))
    conn.commit()
    conn.close()
