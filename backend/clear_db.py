import sqlite3

def clear_db():
    db_path = '../data/complaints.db'
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Count before deletion
        cursor.execute("SELECT COUNT(*) FROM complaints")
        count = cursor.fetchone()[0]
        print(f"Current complaints count: {count}")
        
        # Delete all
        cursor.execute("DELETE FROM complaints")
        
        # Reset auto-increment ID
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='complaints'")
        
        conn.commit()
        conn.close()
        print("Database cleared successfully and IDs reset.")
    except Exception as e:
        print(f"Error clearing database: {e}")

if __name__ == "__main__":
    clear_db()
