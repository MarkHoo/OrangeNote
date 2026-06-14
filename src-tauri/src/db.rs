use rusqlite::{Connection, Result as SqlResult, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

pub struct Database {
    pub conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub color: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub is_pinned: bool,
    pub pinned_position: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(dead_code)]
pub struct NoteTag {
    pub note_id: String,
    pub tag_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reminder {
    pub id: String,
    pub note_id: String,
    pub remind_at: String,
    pub is_triggered: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNotePayload {
    pub title: String,
    pub content: String,
    pub color: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNotePayload {
    pub id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub color: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub is_pinned: Option<bool>,
    pub pinned_position: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTagPayload {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTagPayload {
    pub id: String,
    pub name: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReminderPayload {
    pub note_id: String,
    pub remind_at: String,
}

impl Database {
    pub fn new(conn: Connection) -> Self {
        Database {
            conn: Mutex::new(conn),
        }
    }

    pub fn init_tables(&self) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                content TEXT NOT NULL DEFAULT '',
                color TEXT NOT NULL DEFAULT '#FF8C42',
                x REAL NOT NULL DEFAULT 100.0,
                y REAL NOT NULL DEFAULT 100.0,
                width REAL NOT NULL DEFAULT 280.0,
                height REAL NOT NULL DEFAULT 320.0,
                is_pinned INTEGER NOT NULL DEFAULT 0,
                pinned_position INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#FF8C42',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS reminders (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                remind_at TEXT NOT NULL,
                is_triggered INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );"
        )?;
        Ok(())
    }
}

// ========== Notes ==========

#[tauri::command]
pub fn create_note(db: State<'_, Database>, payload: CreateNotePayload) -> Result<Note, String> {
    let conn = db.conn.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let note = Note {
        id: id.clone(),
        title: payload.title,
        content: payload.content,
        color: payload.color,
        x: payload.x,
        y: payload.y,
        width: payload.width,
        height: payload.height,
        is_pinned: false,
        pinned_position: 0,
        created_at: now.clone(),
        updated_at: now,
    };
    conn.execute(
        "INSERT INTO notes (id, title, content, color, x, y, width, height, is_pinned, pinned_position, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![note.id, note.title, note.content, note.color, note.x, note.y, note.width, note.height, note.is_pinned as i32, note.pinned_position, note.created_at, note.updated_at],
    ).map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn get_all_notes(db: State<'_, Database>) -> Result<Vec<Note>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, title, content, color, x, y, width, height, is_pinned, pinned_position, created_at, updated_at FROM notes ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let notes = stmt
        .query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                color: row.get(3)?,
                x: row.get(4)?,
                y: row.get(5)?,
                width: row.get(6)?,
                height: row.get(7)?,
                is_pinned: row.get::<_, i32>(8)? != 0,
                pinned_position: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(notes)
}

#[tauri::command]
pub fn update_note(db: State<'_, Database>, payload: UpdateNotePayload) -> Result<Note, String> {
    let conn = db.conn.lock().unwrap();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Get current note
    let mut stmt = conn
        .prepare("SELECT id, title, content, color, x, y, width, height, is_pinned, pinned_position, created_at, updated_at FROM notes WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let mut note: Note = stmt
        .query_row(params![payload.id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                color: row.get(3)?,
                x: row.get(4)?,
                y: row.get(5)?,
                width: row.get(6)?,
                height: row.get(7)?,
                is_pinned: row.get::<_, i32>(8)? != 0,
                pinned_position: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    if let Some(v) = payload.title { note.title = v; }
    if let Some(v) = payload.content { note.content = v; }
    if let Some(v) = payload.color { note.color = v; }
    if let Some(v) = payload.x { note.x = v; }
    if let Some(v) = payload.y { note.y = v; }
    if let Some(v) = payload.width { note.width = v; }
    if let Some(v) = payload.height { note.height = v; }
    if let Some(v) = payload.is_pinned { note.is_pinned = v; }
    if let Some(v) = payload.pinned_position { note.pinned_position = v; }
    note.updated_at = now;

    conn.execute(
        "UPDATE notes SET title=?1, content=?2, color=?3, x=?4, y=?5, width=?6, height=?7, is_pinned=?8, pinned_position=?9, updated_at=?10 WHERE id=?11",
        params![note.title, note.content, note.color, note.x, note.y, note.width, note.height, note.is_pinned as i32, note.pinned_position, note.updated_at, note.id],
    ).map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn delete_note(db: State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute("DELETE FROM notes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn batch_delete_notes(db: State<'_, Database>, ids: Vec<String>) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    for id in ids {
        conn.execute("DELETE FROM notes WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ========== Tags ==========

#[tauri::command]
pub fn create_tag(db: State<'_, Database>, payload: CreateTagPayload) -> Result<Tag, String> {
    let conn = db.conn.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let tag = Tag {
        id: id.clone(),
        name: payload.name,
        color: payload.color,
        created_at: now,
    };
    conn.execute(
        "INSERT INTO tags (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![tag.id, tag.name, tag.color, tag.created_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(tag)
}

#[tauri::command]
pub fn get_all_tags(db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}

#[tauri::command]
pub fn update_tag(db: State<'_, Database>, payload: UpdateTagPayload) -> Result<Tag, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let mut tag: Tag = stmt
        .query_row(params![payload.id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    if let Some(v) = payload.name { tag.name = v; }
    if let Some(v) = payload.color { tag.color = v; }

    conn.execute(
        "UPDATE tags SET name=?1, color=?2 WHERE id=?3",
        params![tag.name, tag.color, tag.id],
    )
    .map_err(|e| e.to_string())?;
    Ok(tag)
}

#[tauri::command]
pub fn delete_tag(db: State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute("DELETE FROM note_tags WHERE tag_id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn batch_delete_tags(db: State<'_, Database>, ids: Vec<String>) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    for id in ids {
        conn.execute("DELETE FROM note_tags WHERE tag_id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM tags WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ========== Note-Tag Relations ==========

#[tauri::command]
pub fn add_tag_to_note(db: State<'_, Database>, note_id: String, tag_id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
        params![note_id, tag_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn remove_tag_from_note(db: State<'_, Database>, note_id: String, tag_id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ?1 AND tag_id = ?2",
        params![note_id, tag_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_note_tags(db: State<'_, Database>, note_id: String) -> Result<Vec<Tag>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT t.id, t.name, t.color, t.created_at FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?1")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map(params![note_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}

#[tauri::command]
pub fn get_notes_by_tag(db: State<'_, Database>, tag_id: String) -> Result<Vec<Note>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT n.id, n.title, n.content, n.color, n.x, n.y, n.width, n.height, n.is_pinned, n.pinned_position, n.created_at, n.updated_at FROM notes n INNER JOIN note_tags nt ON n.id = nt.note_id WHERE nt.tag_id = ?1 ORDER BY n.created_at DESC")
        .map_err(|e| e.to_string())?;
    let notes = stmt
        .query_map(params![tag_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                color: row.get(3)?,
                x: row.get(4)?,
                y: row.get(5)?,
                width: row.get(6)?,
                height: row.get(7)?,
                is_pinned: row.get::<_, i32>(8)? != 0,
                pinned_position: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(notes)
}

// ========== Reminders ==========

#[tauri::command]
pub fn create_reminder(db: State<'_, Database>, payload: CreateReminderPayload) -> Result<Reminder, String> {
    let conn = db.conn.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let reminder = Reminder {
        id: id.clone(),
        note_id: payload.note_id,
        remind_at: payload.remind_at,
        is_triggered: false,
        created_at: now,
    };
    conn.execute(
        "INSERT INTO reminders (id, note_id, remind_at, is_triggered, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![reminder.id, reminder.note_id, reminder.remind_at, reminder.is_triggered as i32, reminder.created_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(reminder)
}

#[tauri::command]
pub fn get_note_reminders(db: State<'_, Database>, note_id: String) -> Result<Vec<Reminder>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, note_id, remind_at, is_triggered, created_at FROM reminders WHERE note_id = ?1 ORDER BY remind_at ASC")
        .map_err(|e| e.to_string())?;
    let reminders = stmt
        .query_map(params![note_id], |row| {
            Ok(Reminder {
                id: row.get(0)?,
                note_id: row.get(1)?,
                remind_at: row.get(2)?,
                is_triggered: row.get::<_, i32>(3)? != 0,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(reminders)
}

#[tauri::command]
pub fn delete_reminder(db: State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute("DELETE FROM reminders WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_pending_reminders(db: State<'_, Database>) -> Result<Vec<Reminder>, String> {
    let conn = db.conn.lock().unwrap();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let mut stmt = conn
        .prepare("SELECT id, note_id, remind_at, is_triggered, created_at FROM reminders WHERE is_triggered = 0 AND remind_at <= ?1 ORDER BY remind_at ASC")
        .map_err(|e| e.to_string())?;
    let reminders = stmt
        .query_map(params![now], |row| {
            Ok(Reminder {
                id: row.get(0)?,
                note_id: row.get(1)?,
                remind_at: row.get(2)?,
                is_triggered: row.get::<_, i32>(3)? != 0,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(reminders)
}

#[tauri::command]
pub fn mark_reminder_triggered(db: State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute("UPDATE reminders SET is_triggered = 1 WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ========== Settings ==========

#[tauri::command]
pub fn get_setting(db: State<'_, Database>, key: String) -> Result<Option<String>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = ?1")
        .map_err(|e| e.to_string())?;
    let result = stmt.query_row(params![key], |row| Ok(row.get::<_, String>(0)?));
    match result {
        Ok(v) => Ok(Some(v)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn set_setting(db: State<'_, Database>, key: String, value: String) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_all_settings(db: State<'_, Database>) -> Result<Vec<Setting>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| e.to_string())?;
    let settings = stmt
        .query_map([], |row| {
            Ok(Setting {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(settings)
}
