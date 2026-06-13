import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import type { ReminderEffectType } from '../types';

const REMINDER_EFFECTS: { key: ReminderEffectType; icon: string }[] = [
  { key: 'color-blink', icon: '🌈' },
  { key: 'border-blink', icon: '✨' },
  { key: 'shake', icon: '🫨' },
  { key: 'bounce', icon: '⬆️' },
  { key: 'glow', icon: '💡' },
];

const REMINDER_SOUNDS = [
  { id: 'default', icon: '🔔' },
  { id: 'bell', icon: '🛎️' },
  { id: 'chime', icon: '🎐' },
  { id: 'alert', icon: '⚠️' },
  { id: 'gentle', icon: '🎵' },
  { id: 'digital', icon: '📱' },
];

const ReminderModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    showReminderModal, reminderNoteId, setShowReminderModal,
    reminders, loadNoteReminders, addReminder, removeReminder,
    reminderEffect, setReminderEffect, reminderSound, setReminderSound,
  } = useStore();

  const [remindAt, setRemindAt] = useState('');

  useEffect(() => {
    if (showReminderModal && reminderNoteId) {
      loadNoteReminders(reminderNoteId);
    }
  }, [showReminderModal, reminderNoteId, loadNoteReminders]);

  const handleAdd = async () => {
    if (!reminderNoteId || !remindAt) return;
    await addReminder(reminderNoteId, remindAt);
    setRemindAt('');
  };

  const handleDelete = async (id: string) => {
    await removeReminder(id);
    if (reminderNoteId) {
      loadNoteReminders(reminderNoteId);
    }
  };

  if (!showReminderModal || !reminderNoteId) return null;

  // Get minimum datetime (now)
  const now = new Date();
  const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowReminderModal(false)}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">⏰ {t('reminder.title')}</h2>
          <button onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Add reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminder.addTime')}</label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                min={minDate}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAdd}
                disabled={!remindAt}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.add')}
              </button>
            </div>
          </div>

          {/* Reminder effect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminder.effect')}</label>
            <div className="flex gap-2">
              {REMINDER_EFFECTS.map((effect) => (
                <button
                  key={effect.key}
                  onClick={() => setReminderEffect(effect.key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    reminderEffect === effect.key
                      ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{effect.icon}</span>
                  <span>{t(`reminder.effects.${effect.key.replace('-', '')}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reminder sound */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminder.sound')}</label>
            <div className="flex gap-2">
              {REMINDER_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setReminderSound(sound.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    reminderSound === sound.id
                      ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span>{t(`reminder.sounds.${sound.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing reminders */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reminder.remindAt')}</label>
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-400">{t('reminder.noReminders')}</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔔</span>
                      <span className="text-sm text-gray-700">
                        {new Date(r.remind_at).toLocaleString()}
                      </span>
                      {r.is_triggered && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setShowReminderModal(false)}
            className="px-6 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
