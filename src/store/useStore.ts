import { create } from 'zustand';
import type {
  Note, Tag, Reminder, Language, ViewMode, ReminderEffectType,
  UpdateNotePayload, UpdateTagPayload,
} from '../types';
import * as api from '../lib/tauri';

interface AppState {
  // Data
  notes: Note[];
  tags: Tag[];
  noteTagMap: Record<string, Tag[]>;
  reminders: Reminder[];

  // UI State
  viewMode: ViewMode;
  selectedNoteIds: Set<string>;
  selectedTagIds: Set<string>;
  editingNote: Note | null;
  editingTag: Tag | null;
  showNoteEditor: boolean;
  showTagManager: boolean;
  showSettings: boolean;
  showReminderModal: boolean;
  reminderNoteId: string | null;
  searchQuery: string;
  filterTagId: string | null;

  // Settings
  language: Language;
  defaultColor: string;
  autoUpdate: boolean;
  reminderEffect: ReminderEffectType;
  reminderSound: string;

  // Actions - Notes
  loadNotes: () => Promise<void>;
  addNote: (note?: Partial<Note>) => Promise<Note>;
  saveNote: (payload: UpdateNotePayload) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  batchRemoveNotes: (ids: string[]) => Promise<void>;
  setEditingNote: (note: Note | null) => void;

  // Actions - Tags
  loadTags: () => Promise<void>;
  addTag: (name: string, color: string) => Promise<Tag>;
  saveTag: (payload: UpdateTagPayload) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  batchRemoveTags: (ids: string[]) => Promise<void>;
  setEditingTag: (tag: Tag | null) => void;

  // Actions - Note-Tag
  loadNoteTags: (noteId: string) => Promise<void>;
  linkTagToNote: (noteId: string, tagId: string) => Promise<void>;
  unlinkTagFromNote: (noteId: string, tagId: string) => Promise<void>;

  // Actions - Reminders
  loadNoteReminders: (noteId: string) => Promise<void>;
  addReminder: (noteId: string, remindAt: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  checkPendingReminders: () => Promise<Reminder[]>;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setDefaultColor: (color: string) => Promise<void>;
  setAutoUpdate: (enabled: boolean) => Promise<void>;
  setReminderEffect: (effect: ReminderEffectType) => void;
  setReminderSound: (sound: string) => void;

  // Actions - UI
  setViewMode: (mode: ViewMode) => void;
  toggleNoteSelection: (id: string) => void;
  toggleTagSelection: (id: string) => void;
  clearNoteSelection: () => void;
  clearTagSelection: () => void;
  selectAllNotes: () => void;
  selectAllTags: () => void;
  setShowNoteEditor: (show: boolean) => void;
  setShowTagManager: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowReminderModal: (show: boolean, noteId?: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterTagId: (tagId: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  notes: [],
  tags: [],
  noteTagMap: {},
  reminders: [],

  viewMode: 'notes',
  selectedNoteIds: new Set(),
  selectedTagIds: new Set(),
  editingNote: null,
  editingTag: null,
  showNoteEditor: false,
  showTagManager: false,
  showSettings: false,
  showReminderModal: false,
  reminderNoteId: null,
  searchQuery: '',
  filterTagId: null,

  language: ((typeof window !== 'undefined' ? localStorage.getItem('language') : null) as Language | null) || 'zh-CN',
  defaultColor: '#FF8C42',
  autoUpdate: true,
  reminderEffect: 'border-blink',
  reminderSound: 'default',

  // Notes
  loadNotes: async () => {
    try {
      const notes = await api.getAllNotes();
      set({ notes });
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
  },

  addNote: async (partial) => {
    const { defaultColor } = get();
    const payload = {
      title: partial?.title || '',
      content: partial?.content || '',
      color: partial?.color || defaultColor,
      x: partial?.x ?? 100 + Math.random() * 200,
      y: partial?.y ?? 100 + Math.random() * 200,
      width: partial?.width ?? 280,
      height: partial?.height ?? 320,
    };
    const note = await api.createNote(payload);
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  saveNote: async (payload) => {
    const note = await api.updateNote(payload);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? note : n)),
      editingNote: state.editingNote?.id === note.id ? note : state.editingNote,
    }));
  },

  removeNote: async (id) => {
    await api.deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteIds: new Set([...state.selectedNoteIds].filter((sid) => sid !== id)),
    }));
  },

  batchRemoveNotes: async (ids) => {
    await api.batchDeleteNotes(ids);
    set((state) => ({
      notes: state.notes.filter((n) => !ids.includes(n.id)),
      selectedNoteIds: new Set(),
    }));
  },

  setEditingNote: (note) => set({ editingNote: note, showNoteEditor: !!note }),

  // Tags
  loadTags: async () => {
    try {
      const tags = await api.getAllTags();
      set({ tags });
    } catch (e) {
      console.error('Failed to load tags:', e);
    }
  },

  addTag: async (name, color) => {
    const tag = await api.createTag({ name, color });
    set((state) => ({ tags: [tag, ...state.tags] }));
    return tag;
  },

  saveTag: async (payload) => {
    const tag = await api.updateTag(payload);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === tag.id ? tag : t)),
      editingTag: state.editingTag?.id === tag.id ? tag : state.editingTag,
    }));
  },

  removeTag: async (id) => {
    await api.deleteTag(id);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      selectedTagIds: new Set([...state.selectedTagIds].filter((sid) => sid !== id)),
    }));
  },

  batchRemoveTags: async (ids) => {
    await api.batchDeleteTags(ids);
    set((state) => ({
      tags: state.tags.filter((t) => !ids.includes(t.id)),
      selectedTagIds: new Set(),
    }));
  },

  setEditingTag: (tag) => set({ editingTag: tag, showTagManager: !!tag }),

  // Note-Tag
  loadNoteTags: async (noteId) => {
    try {
      const tags = await api.getNoteTags(noteId);
      set((state) => ({ noteTagMap: { ...state.noteTagMap, [noteId]: tags } }));
    } catch (e) {
      console.error('Failed to load note tags:', e);
    }
  },

  linkTagToNote: async (noteId, tagId) => {
    await api.addTagToNote(noteId, tagId);
    await get().loadNoteTags(noteId);
  },

  unlinkTagFromNote: async (noteId, tagId) => {
    await api.removeTagFromNote(noteId, tagId);
    await get().loadNoteTags(noteId);
  },

  // Reminders
  loadNoteReminders: async (noteId) => {
    try {
      const reminders = await api.getNoteReminders(noteId);
      set({ reminders });
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
  },

  addReminder: async (noteId, remindAt) => {
    await api.createReminder({ note_id: noteId, remind_at: remindAt });
    await get().loadNoteReminders(noteId);
  },

  removeReminder: async (id) => {
    await api.deleteReminder(id);
  },

  checkPendingReminders: async () => {
    try {
      return await api.getPendingReminders();
    } catch {
      return [];
    }
  },

  // Settings
  loadSettings: async () => {
    try {
      const settings = await api.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => { settingsMap[s.key] = s.value; });

      set({
        defaultColor: settingsMap.defaultColor || '#FF8C42',
        autoUpdate: settingsMap.autoUpdate !== 'false',
        language: (settingsMap.language as Language) || get().language,
        reminderEffect: (settingsMap.reminderEffect as ReminderEffectType) || 'border-blink',
        reminderSound: settingsMap.reminderSound || 'default',
      });
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  },

  updateSetting: async (key, value) => {
    await api.setSetting(key, value);
  },

  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem('language', lang);
    api.setSetting('language', lang).catch(console.error);
  },

  setDefaultColor: async (color) => {
    set({ defaultColor: color });
    await api.setSetting('defaultColor', color);
  },

  setAutoUpdate: async (enabled) => {
    set({ autoUpdate: enabled });
    await api.setSetting('autoUpdate', String(enabled));
  },

  setReminderEffect: (effect) => {
    set({ reminderEffect: effect });
    api.setSetting('reminderEffect', effect).catch(console.error);
  },

  setReminderSound: (sound) => {
    set({ reminderSound: sound });
    api.setSetting('reminderSound', sound).catch(console.error);
  },

  // UI
  setViewMode: (mode) => set({ viewMode: mode, selectedNoteIds: new Set(), selectedTagIds: new Set() }),

  toggleNoteSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedNoteIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return { selectedNoteIds: newSet };
  }),

  toggleTagSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedTagIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return { selectedTagIds: newSet };
  }),

  clearNoteSelection: () => set({ selectedNoteIds: new Set() }),
  clearTagSelection: () => set({ selectedTagIds: new Set() }),
  selectAllNotes: () => set((state) => ({ selectedNoteIds: new Set(state.notes.map((n) => n.id)) })),
  selectAllTags: () => set((state) => ({ selectedTagIds: new Set(state.tags.map((t) => t.id)) })),

  setShowNoteEditor: (show) => set({ showNoteEditor: show, editingNote: show ? get().editingNote : null }),
  setShowTagManager: (show) => set({ showTagManager: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowReminderModal: (show, noteId = null) => set({ showReminderModal: show, reminderNoteId: noteId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterTagId: (tagId) => set({ filterTagId: tagId }),
}));
