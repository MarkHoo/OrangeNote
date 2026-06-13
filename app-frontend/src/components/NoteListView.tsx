import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import NoteCard from './NoteCard';

const NoteListView: React.FC = () => {
  const { t } = useTranslation();
  const {
    notes, searchQuery, filterTagId, tags,
    selectedNoteIds, clearNoteSelection, selectAllNotes,
    batchRemoveNotes, addNote,
    setSearchQuery, setFilterTagId,
    noteTagMap,
  } = useStore();

  const isSelectionMode = selectedNoteIds.size > 0;

  // Filter notes
  const filteredNotes = useMemo(() => {
    let result = notes;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    if (filterTagId) {
      result = result.filter((n) => {
        const noteTags = noteTagMap[n.id] || [];
        return noteTags.some((t) => t.id === filterTagId);
      });
    }

    return result;
  }, [notes, searchQuery, filterTagId, noteTagMap]);

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedNoteIds);
    if (ids.length > 0 && window.confirm(t('note.deleteConfirm'))) {
      await batchRemoveNotes(ids);
      clearNoteSelection();
    }
  };

  const handleNewNote = async () => {
    await addNote();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-gray-50"
              placeholder={t('common.search')}
            />
          </div>

          {/* Tag filter */}
          <select
            value={filterTagId || ''}
            onChange={(e) => setFilterTagId(e.target.value || null)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">{t('nav.tags')}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>

          {/* New note button */}
          {!isSelectionMode && (
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-1"
            >
              + {t('note.newNote')}
            </button>
          )}
        </div>

        {/* Selection bar */}
        {isSelectionMode && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {t('note.selected')} {selectedNoteIds.size} {t('note.items')}
            </span>
            <button onClick={selectAllNotes} className="text-sm text-orange-600 hover:text-orange-700">
              {t('common.selectAll')}
            </button>
            <button onClick={clearNoteSelection} className="text-sm text-gray-500 hover:text-gray-700">
              {t('common.deselectAll')}
            </button>
            <button onClick={handleBatchDelete} className="text-sm text-red-500 hover:text-red-600">
              {t('note.batchDelete')}
            </button>
          </div>
        )}
      </div>

      {/* Note grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-5xl mb-4">📝</span>
            <p className="text-lg">{t('note.noNotes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelectionMode={isSelectionMode}
                isSelected={selectedNoteIds.has(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteListView;
