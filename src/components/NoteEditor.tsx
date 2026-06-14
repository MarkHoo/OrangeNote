import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ColorPicker from './ColorPicker';
// Note type used via editingNote from store

const NoteEditor: React.FC = () => {
  const { t } = useTranslation();
  const {
    editingNote, showNoteEditor, setShowNoteEditor, saveNote, addNote,
    tags, noteTagMap, linkTagToNote, unlinkTagFromNote, loadNoteTags,
    setShowReminderModal,
  } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FF8C42');
  const [showTagPicker, setShowTagPicker] = useState(false);

  const isNew = !editingNote?.id;
  const currentTags = editingNote ? (noteTagMap[editingNote.id] || []) : [];
  const currentTagIds = new Set(currentTags.map((t) => t.id));

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setColor(editingNote.color);
      loadNoteTags(editingNote.id);
    } else {
      setTitle('');
      setContent('');
      setColor(useStore.getState().defaultColor);
    }
  }, [editingNote, loadNoteTags]);

  const handleSave = async () => {
    if (isNew) {
      const note = await addNote({ title, content, color });
      setShowNoteEditor(false);
      // Open the editor for the new note to allow adding tags etc
      useStore.getState().setEditingNote(note);
    } else if (editingNote) {
      await saveNote({ id: editingNote.id, title, content, color });
      setShowNoteEditor(false);
    }
  };

  const handleClose = () => {
    setShowNoteEditor(false);
  };

  if (!showNoteEditor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isNew ? t('note.newNote') : t('note.editNote')}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('note.title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
              placeholder={t('note.title')}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('note.content')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
              rows={6}
              placeholder={t('note.content')}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('note.color')}</label>
            <ColorPicker value={color} onChange={setColor} showLabels />
          </div>

          {/* Tags (only for existing notes) */}
          {!isNew && editingNote && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tag.addToNote')}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: tag.color + '30', color: tag.color }}
                  >
                    {tag.name}
                    <button
                      onClick={() => unlinkTagFromNote(editingNote.id, tag.id)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                + {t('tag.addToNote')}
              </button>
              {showTagPicker && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                  {tags.filter((tag) => !currentTagIds.has(tag.id)).length === 0 ? (
                    <p className="text-xs text-gray-500">{t('tag.noTags')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {tags
                        .filter((tag) => !currentTagIds.has(tag.id))
                        .map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              linkTagToNote(editingNote.id, tag.id);
                              setShowTagPicker(false);
                            }}
                            className="text-xs px-2 py-1 rounded-full hover:opacity-80"
                            style={{ backgroundColor: tag.color + '30', color: tag.color }}
                          >
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reminder button */}
              <button
                onClick={() => setShowReminderModal(true, editingNote.id)}
                className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
              >
                ⏰ {t('note.addReminder')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
