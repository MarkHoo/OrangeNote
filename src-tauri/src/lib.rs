mod db;

use db::Database;
use rusqlite::Connection;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
            let db_path = app_dir.join("orange_note.db");
            let conn = Connection::open(db_path).expect("failed to open database");
            let database = Database::new(conn);
            database.init_tables().expect("failed to initialize tables");
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            db::create_note,
            db::get_all_notes,
            db::update_note,
            db::delete_note,
            db::batch_delete_notes,
            db::create_tag,
            db::get_all_tags,
            db::update_tag,
            db::delete_tag,
            db::batch_delete_tags,
            db::add_tag_to_note,
            db::remove_tag_from_note,
            db::get_note_tags,
            db::get_notes_by_tag,
            db::create_reminder,
            db::get_note_reminders,
            db::delete_reminder,
            db::get_pending_reminders,
            db::mark_reminder_triggered,
            db::get_setting,
            db::set_setting,
            db::get_all_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
