import { invoke } from '@tauri-apps/api/core';
import type {
  Note, Tag, Reminder, Setting,
  CreateNotePayload, UpdateNotePayload,
  CreateTagPayload, UpdateTagPayload,
  CreateReminderPayload,
} from '../types';

// Notes
export const createNote = (payload: CreateNotePayload): Promise<Note> =>
  invoke('create_note', { payload });

export const getAllNotes = (): Promise<Note[]> =>
  invoke('get_all_notes');

export const updateNote = (payload: UpdateNotePayload): Promise<Note> =>
  invoke('update_note', { payload });

export const deleteNote = (id: string): Promise<void> =>
  invoke('delete_note', { id });

export const batchDeleteNotes = (ids: string[]): Promise<void> =>
  invoke('batch_delete_notes', { ids });

// Tags
export const createTag = (payload: CreateTagPayload): Promise<Tag> =>
  invoke('create_tag', { payload });

export const getAllTags = (): Promise<Tag[]> =>
  invoke('get_all_tags');

export const updateTag = (payload: UpdateTagPayload): Promise<Tag> =>
  invoke('update_tag', { payload });

export const deleteTag = (id: string): Promise<void> =>
  invoke('delete_tag', { id });

export const batchDeleteTags = (ids: string[]): Promise<void> =>
  invoke('batch_delete_tags', { ids });

// Note-Tag Relations
export const addTagToNote = (noteId: string, tagId: string): Promise<void> =>
  invoke('add_tag_to_note', { noteId, tagId });

export const removeTagFromNote = (noteId: string, tagId: string): Promise<void> =>
  invoke('remove_tag_from_note', { noteId, tagId });

export const getNoteTags = (noteId: string): Promise<Tag[]> =>
  invoke('get_note_tags', { noteId });

export const getNotesByTag = (tagId: string): Promise<Note[]> =>
  invoke('get_notes_by_tag', { tagId });

// Reminders
export const createReminder = (payload: CreateReminderPayload): Promise<Reminder> =>
  invoke('create_reminder', { payload });

export const getNoteReminders = (noteId: string): Promise<Reminder[]> =>
  invoke('get_note_reminders', { noteId });

export const deleteReminder = (id: string): Promise<void> =>
  invoke('delete_reminder', { id });

export const getPendingReminders = (): Promise<Reminder[]> =>
  invoke('get_pending_reminders');

export const markReminderTriggered = (id: string): Promise<void> =>
  invoke('mark_reminder_triggered', { id });

// Settings
export const getSetting = (key: string): Promise<string | null> =>
  invoke('get_setting', { key });

export const setSetting = (key: string, value: string): Promise<void> =>
  invoke('set_setting', { key, value });

export const getAllSettings = (): Promise<Setting[]> =>
  invoke('get_all_settings');
