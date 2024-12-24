import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { fileApi } from "../../services/fileApi";

const TagManager = ({ isOpen, onClose, onTagsUpdated }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: "", color: "#3B82F6" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.getTags();
      setTags(response.data);
    } catch (err) {
      setError("Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      const response = await fileApi.createTag(newTag);
      setTags([...tags, response.data]);
      setNewTag({ name: "", color: "#3B82F6" });
      onTagsUpdated();
    } catch (err) {
      setError("Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        await fileApi.deleteTag(tagId);
        setTags(tags.filter((tag) => tag.id !== tagId));
        onTagsUpdated();
      } catch (err) {
        setError("Failed to delete tag");
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-medium">
              Manage Tags
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) =>
                    setNewTag({ ...newTag, name: e.target.value })
                  }
                  placeholder="New tag name"
                  className="flex-1 rounded-lg border-gray-300"
                />
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) =>
                    setNewTag({ ...newTag, color: e.target.value })
                  }
                  className="w-12 h-10 rounded border-gray-300"
                />
                <button
                  onClick={handleCreateTag}
                  disabled={!newTag.name}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      <span className="text-sm text-gray-500">
                        ({tag.file_count} files)
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default TagManager;
