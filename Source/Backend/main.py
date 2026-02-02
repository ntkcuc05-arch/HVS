from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import shutil
from pathlib import Path
from database import get_db_connection, init_db

# Initialize DB on startup
init_db()

app = FastAPI(title="HVS Systems API", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

class SystemPosition(BaseModel):
    x: float
    y: float

class SystemUpdate(BaseModel):
    name: str
    app_link: Optional[str] = None
    youtube_link: Optional[str] = None
    avatar_url: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "HVS Systems API is running", "version": "2.0.0"}

@app.get("/api/systems")
async def get_systems():
    """Get list of all systems from DB"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM systems")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": row["id"],
            "name": row["name"],
            "appLink": row["app_link"],
            "youtubeLink": row["youtube_link"],
            "avatarUrl": row["avatar_url"],
            "position": {"x": row["pos_x"], "y": row["pos_y"]},
            "group": row["group"]
        } for row in rows
    ]

@app.post("/api/systems")
async def create_system(
    id: str = Form(...),
    name: str = Form(...),
    app_link: Optional[str] = Form(None),
    youtube_link: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None)
):
    """Create a new system with optional avatar upload"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM systems WHERE id = ?", (id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="System ID already exists")
    
    avatar_url = None
    if avatar:
        file_ext = os.path.splitext(avatar.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        avatar_url = f"/static/uploads/{file_name}"

    cursor.execute('''
    INSERT INTO systems (id, name, app_link, youtube_link, avatar_url, pos_x, pos_y, "group")
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (id, name, app_link, youtube_link, avatar_url, 0, 0, 'dynamic'))
    
    conn.commit()
    conn.close()
    
    return {"status": "success", "id": id}

@app.put("/api/systems/{system_id}")
async def update_system(
    system_id: str,
    name: str = Form(...),
    app_link: Optional[str] = Form(None),
    youtube_link: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None)
):
    """Update an existing system"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT avatar_url FROM systems WHERE id = ?", (system_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="System not found")
    
    avatar_url = row["avatar_url"]
    if avatar:
        # Delete old avatar if exists
        if avatar_url and avatar_url.startswith("/static/uploads/"):
            old_path = BASE_DIR / avatar_url.lstrip("/")
            if old_path.exists():
                os.remove(old_path)
        
        file_ext = os.path.splitext(avatar.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        avatar_url = f"/static/uploads/{file_name}"

    cursor.execute('''
    UPDATE systems 
    SET name = ?, app_link = ?, youtube_link = ?, avatar_url = ?
    WHERE id = ?
    ''', (name, app_link, youtube_link, avatar_url, system_id))
    
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.put("/api/systems/{system_id}/position")
async def update_system_position(system_id: str, position: SystemPosition):
    """Update system coordinates"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    UPDATE systems SET pos_x = ?, pos_y = ? WHERE id = ?
    ''', (position.x, position.y, system_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="System not found")
    
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/systems/{system_id}")
async def delete_system(system_id: str):
    """Delete a system and its avatar"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT avatar_url FROM systems WHERE id = ?", (system_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="System not found")
    
    avatar_url = row["avatar_url"]
    if avatar_url and avatar_url.startswith("/static/uploads/"):
        old_path = BASE_DIR / avatar_url.lstrip("/")
        if old_path.exists():
            try:
                os.remove(old_path)
            except:
                pass

    cursor.execute("DELETE FROM systems WHERE id = ?", (system_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
