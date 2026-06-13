import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ColorPicker from './ColorPicker';
import type { Tag } from '../types';

const TagManager: React.FC = () => {
  const { t } = useTranslation();
  const {
    tags, showTagManager, setShowTagManager,
    addTag, saveTag, removeTag, batchRemoveTags,
    selectedTagIds, toggleTagSelection, clearTagSelection, selectAllTags,
  } = useStore();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#FF8C42');
  const [showNewForm, setShowNewForm] = useState(false);

  const isSelectionMode = selectedTagIds.size > 0;

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setNewTagColor('#FF8C42');
    setShowNewForm(false);
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    await saveTag({ id: editingTag.id, name: editingTag.name, color: editingTag.color });
    setEditingTag(null);
  };

  const handleDeleteTag = async (id: string) => {
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

  if (!showTagManager) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTagManager(false)}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">{t('tag.manage')}</h2>
          <button onClick={() => setShowTagManager(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Actions bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-gray-600">
                {t('tag.selected')} {selectedTagIds.size} {t('tag.items')}
              </span>
              <button onClick={selectAllTags} className="text-sm text-orange-600 hover:text-orange-700 ml-auto">
                {t('common.selectAll')}
              </button>
              <button onClick={clearTagSelection} className="text-sm text-gray-500 hover:text-gray-700">
                {t('common.deselectAll')}
              </button>
              <button
                onClick={handleBatchDelete}
                className="text-sm text-red-500 hover:text-red-600"
              >
                {t('tag.batchDelete')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                + {t('tag.newTag')}
              </button>
              {tags.length > 0 && (
                <button
                  onClick={() => { clearTagSelection(); selectAllTags(); }}
                  className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('tag.batchDelete')}
                </button>
              )}
            </>
          )}
        </div>

        {/* New tag form */}
        {showNewForm && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 space-y-3 shrink-0">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
              placeholder={t('tag.name')}
              autoFocus
            />
            <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            <div className="flex gap-2">
              <button onClick={handleAddTag} className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                {t('common.add')}
              </button>
              <button onClick={() => setShowNewForm(false)} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Tag list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tags.length === 0 ? (
            <p className="text-center text-gray-400 py-8">{t('tag.noTags')}</p>
          ) : (
            tags.map((tag) => (
              <div key={tag.id}>
                {editingTag?.id === tag.id ? (
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                      autoFocus
                    />
                    <ColorPicker value={editingTag.color} onChange={(c) => setEditingTag({ ...editingTag, color: c })} />
                    <div className="flex gap-2">
                      <button onClick={handleUpdateTag} className="px-3 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        {t('common.save')}
                      </button>
                      <button onClick={() => setEditingTag(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedTagIds.has(tag.id) ? 'bg-orange-50 ring-1 ring-orange-300' : ''
                    }`}
                    onClick={() => isSelectionMode ? toggleTagSelection(tag.id) : undefined}
                  >
                    {isSelectionMode && (
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedTagIds.has(tag.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}
                      >
                        {selectedTagIds.has(tag.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                    )}
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm text-gray-800">{tag.name}</span>
                    {!isSelectionMode && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="text-gray-400 hover:text-orange-500 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManager;
