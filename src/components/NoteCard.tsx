import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isSelectionMode: boolean;
  isSelected: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isSelectionMode, isSelected }) => {
  const { t } = useTranslation();
  const {
    setEditingNote, removeNote, toggleNoteSelection,
    loadNoteTags, noteTagMap, setShowReminderModal, saveNote,
  } = useStore();
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadNoteTags(note.id);
  }, [note.id, loadNoteTags]);

  const tags = noteTagMap[note.id] || [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('note.deleteConfirm'))) {
      await removeNote(note.id);
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await saveNote({ id: note.id, is_pinned: !note.is_pinned });
  };

  const handleClick = () => {
    if (isSelectionMode) {
      toggleNoteSelection(note.id);
    } else {
      setEditingNote(note);
    }
  };

  // Get contrasting text color for the note background
  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#333333' : '#ffffff';
  };

  const textColor = getTextColor(note.color);

  return (
    <div
      className={`note-card relative rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group ${
        isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''
      } ${note.is_pinned ? 'ring-2 ring-yellow-400' : ''}`}
      style={{
        backgroundColor: note.color,
        color: textColor,
        minHeight: '180px',
      }}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-orange-500 border-orange-500' : 'border-current bg-white/30'
            }`}
          >
            {isSelected && <span className="text-white text-xs">✓</span>}
          </div>
        </div>
      )}

      {/* Pin indicator */}
      {note.is_pinned && (
        <div className="absolute top-2 right-2 text-yellow-600">📌</div>
      )}

      {/* Actions */}
      {!isSelectionMode && showActions && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handlePin}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-xs"
            title={note.is_pinned ? t('note.unpin') : t('note.pin')}
          >
            📌
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowReminderModal(true, note.id); }}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-xs"
            title={t('note.addReminder')}
          >
            ⏰
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-red-500/50 flex items-center justify-center text-xs"
            title={t('common.delete')}
          >
            🗑️
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 pt-8">
        {note.title && (
          <h3 className="font-bold text-base mb-2 line-clamp-2">{note.title}</h3>
        )}
        <p className="text-sm opacity-80 line-clamp-5 whitespace-pre-wrap">{note.content}</p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full bg-black/15 truncate max-w-20"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
