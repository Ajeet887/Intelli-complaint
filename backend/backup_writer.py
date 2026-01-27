import json
import os
from dotenv import load_dotenv

load_dotenv()

def backup_to_json(complaints):
    backup_path = os.getenv("BACKUP_PATH", '../data/backup_complaints.json')
    # Ensure directory exists
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    with open(backup_path, 'w') as f:
        json.dump(complaints, f)
