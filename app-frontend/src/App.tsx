import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import NoteListView from './components/NoteListView';
import TagListView from './components/TagListView';
import NoteEditor from './components/NoteEditor';
import TagManager from './components/TagManager';
import Settings from './components/Settings';
import ReminderModal from './components/ReminderModal';
import type { ReminderEffectType } from './types';
import { autoCheckUpdate } from './lib/updater';

function App() {
  const { i18n } = useTranslation();
  const {
    loadNotes, loadTags, loadSettings,
    viewMode, language, autoUpdate,
    checkPendingReminders,
    reminderEffect,
  } = useStore();

  const reminderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRemindersRef = useRef<Set<string>>(new Set());

  // Initialize app
  useEffect(() => {
    loadNotes();
    loadTags();
    loadSettings();
  }, [loadNotes, loadTags, loadSettings]);

  // Auto-check for updates on startup
  useEffect(() => {
    const checkUpdate = async () => {
      await autoCheckUpdate(autoUpdate);
    };
    // Delay update check to let app fully load first
    const timer = setTimeout(checkUpdate, 5000);
    return () => clearTimeout(timer);
  }, [autoUpdate]);

  // Sync language
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language, i18n]);

  // Reminder effect animations
  const applyReminderEffect = useCallback((noteId: string, effect: ReminderEffectType) => {
    const noteElements = document.querySelectorAll(`[data-note-id="${noteId}"]`);
    noteElements.forEach((el) => {
      const element = el as HTMLElement;
      switch (effect) {
        case 'color-blink':
          element.style.animation = 'colorBlink 0.5s ease-in-out 6';
          break;
        case 'border-blink':
          element.style.animation = 'borderBlink 0.5s ease-in-out 6';
          break;
        case 'shake':
          element.style.animation = 'shake 0.3s ease-in-out 6';
          break;
        case 'bounce':
          element.style.animation = 'bounce 0.5s ease-in-out 4';
          break;
        case 'glow':
          element.style.animation = 'glow 1s ease-in-out 3';
          break;
      }
      setTimeout(() => {
        element.style.animation = '';
      }, 3000);
    });
  }, []);

  // Check reminders periodically
  useEffect(() => {
    const check = async () => {
      try {
        const pending = await checkPendingReminders();
        for (const reminder of pending) {
          if (!activeRemindersRef.current.has(reminder.id)) {
            activeRemindersRef.current.add(reminder.id);
            applyReminderEffect(reminder.note_id, reminderEffect);

            // Play sound
            const soundSetting = useStore.getState().reminderSound;
            if (soundSetting !== 'default') {
              try {
                const audio = new Audio(`/sounds/${soundSetting}.mp3`);
                audio.volume = 0.5;
                await audio.play().catch(() => {});
              } catch {}
            }

            // Mark as triggered after effect
            const { markReminderTriggered } = await import('./lib/tauri');
            setTimeout(async () => {
              try {
                await markReminderTriggered(reminder.id);
                activeRemindersRef.current.delete(reminder.id);
              } catch {}
            }, 3500);
          }
        }
      } catch {}
    };

    // Check immediately
    check();
    // Then check every 30 seconds
    reminderIntervalRef.current = setInterval(check, 30000);

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [checkPendingReminders, reminderEffect, applyReminderEffect]);

  return (
    <div className="app-container flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'notes' && <NoteListView />}
        {viewMode === 'tags' && <TagListView />}
      </main>

      {/* Modals */}
      <NoteEditor />
      <TagManager />
      <Settings />
      <ReminderModal />

      {/* Reminder animation styles */}
      <style>{`
        @keyframes colorBlink {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5) hue-rotate(90deg); }
        }
        @keyframes borderBlink {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 0 4px #ff6b6b, 0 0 0 8px #ffd93d, 0 0 0 12px #6bcb77; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 140, 66, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 140, 66, 0.8), 0 0 40px rgba(255, 107, 107, 0.4); }
        }
      `}</style>
    </div>
  );
}

export default App;
