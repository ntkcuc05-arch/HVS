import sqlite3
from pathlib import Path

DB_PATH = Path(r"d:\HVSTREE\HSV\Source\Backend\data\systems.db")

def check_db():
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, app_link, youtube_link, avatar_url FROM systems")
    rows = cursor.fetchall()
    
    print("Database Content:")
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, AppLink: {row[2]}, YouTubeLink: {row[3]}, Avatar: {row[4]}")
    
    conn.close()

if __name__ == "__main__":
    check_db()
