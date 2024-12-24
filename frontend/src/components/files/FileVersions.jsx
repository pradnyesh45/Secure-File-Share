import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { fileApi } from "../../services/fileApi";

const FileVersions = ({ file, isOpen, onClose, onVersionRestored }) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      loadVersions();
    }
  }, [isOpen, file]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.getFileVersions(file.id);
      setVersions(response.data);
    } catch (err) {
      setError("Failed to load versions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (versionNumber) => {
    if (window.confirm(`Restore to version ${versionNumber}?`)) {
      try {
        setIsRestoring(true);
        await fileApi.restoreVersion(file.id, versionNumber);
        onVersionRestored();
        onClose();
      } catch (err) {
        setError("Failed to restore version");
      } finally {
        setIsRestoring(false);
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

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-medium">
              Version History - {file?.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        Version {version.version_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created by {version.created_by_username} on{" "}
                        {new Date(version.created_at).toLocaleString()}
                      </div>
                      {version.comment && (
                        <div className="text-sm text-gray-600 mt-1">
                          {version.comment}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRestore(version.version_number)}
                      disabled={isRestoring}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Restore
                    </button>
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No versions available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FileVersions;
