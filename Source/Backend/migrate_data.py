import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "systems.json"
DB_PATH = BASE_DIR / "data" / "systems.db"

def migrate():
    if not DATA_FILE.exists():
        print("systems.json not found, nothing to migrate.")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        systems = data.get("systems", [])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for s in systems:
        # Check if already exists
        cursor.execute("SELECT id FROM systems WHERE id = ?", (s['id'],))
        if cursor.fetchone():
            continue
            
        pos = s.get("position", {"x": 0, "y": 0})
        cursor.execute('''
        INSERT INTO systems (id, name, app_link, youtube_link, avatar_url, pos_x, pos_y, "group")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            s['id'],
            s['name'],
            s.get('appLink'),
            # In old format youtube link might not be stored directly if it was hardcoded or in segments
            # For migration, we'll keep it empty and the user can update it later or we can try to extract if possible
            None, 
            None, # avatar_url wasn't in old format
            pos.get('x', 0),
            pos.get('y', 0),
            s.get('group', 'dynamic')
        ))

    conn.commit()
    conn.close()
    print(f"Migrated {len(systems)} systems to SQLite.")

if __name__ == "__main__":
    migrate()
