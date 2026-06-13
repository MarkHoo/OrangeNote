import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ColorPicker from './ColorPicker';

const TagListView: React.FC = () => {
  const { t } = useTranslation();
  const {
    tags, addTag, saveTag, removeTag, batchRemoveTags,
    selectedTagIds, toggleTagSelection, clearTagSelection, selectAllTags,
    setFilterTagId, setViewMode,
  } = useStore();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#FF8C42');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const isSelectionMode = selectedTagIds.size > 0;

  const handleAdd = async () => {
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setNewTagColor('#FF8C42');
    setShowNewForm(false);
  };

  const startEdit = (tag: { id: string; name: string; color: string }) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await saveTag({ id: editingId, name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('tag.deleteConfirm'))) {
      await removeTag(id);
    }
  };

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedTagIds);
    if (ids.length > 0 && window.confirm(t('tag.deleteConfirm'))) {
      await batchRemoveTags(ids);
      clearTagSelection();
    }
  };

  const handleFilterByTag = (tagId: string) => {
    setFilterTagId(tagId);
    setViewMode('notes');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">{t('nav.tags')}</h2>
          <div className="flex-1" />

          {isSelectionMode ? (
            <>
              <span className="text-sm text-gray-600">
                {t('tag.selected')} {selectedTagIds.size} {t('tag.items')}
              </span>
              <button onClick={selectAllTags} className="text-sm text-orange-600 hover:text-orange-700">
                {t('common.selectAll')}
              </button>
              <button onClick={clearTagSelection} className="text-sm text-gray-500 hover:text-gray-700">
                {t('common.deselectAll')}
              </button>
              <button onClick={handleBatchDelete} className="text-sm text-red-500 hover:text-red-600">
                {t('tag.batchDelete')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                + {t('tag.newTag')}
              </button>
              {tags.length > 0 && (
                <button
                  onClick={() => { clearTagSelection(); selectAllTags(); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('tag.batchDelete')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* New tag form */}
        {showNewForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
              placeholder={t('tag.name')}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <ColorPicker value={newTagColor} onChange={setNewTagColor} showLabels />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                {t('common.add')}
              </button>
              <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-5xl mb-4">🏷️</span>
            <p className="text-lg">{t('tag.noTags')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.map((tag) => (
              <div key={tag.id}>
                {editingId === tag.id ? (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} showLabels />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        {t('common.save')}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                      selectedTagIds.has(tag.id) ? 'ring-2 ring-orange-400' : ''
                    }`}
                    onClick={() => isSelectionMode ? toggleTagSelection(tag.id) : handleFilterByTag(tag.id)}
                  >
                    {isSelectionMode && (
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedTagIds.has(tag.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}
                      >
                        {selectedTagIds.has(tag.id) && <span className="text-white text-xs">✓</span>}
                      </div>
                    )}
                    <div
                      className="w-6 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm font-medium text-gray-800">{tag.name}</span>
                    {!isSelectionMode && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(tag); }}
                          className="text-gray-400 hover:text-orange-500"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(tag.id); }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagListView;
