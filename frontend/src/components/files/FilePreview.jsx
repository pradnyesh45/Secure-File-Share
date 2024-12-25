import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { fileApi } from "../../services/fileApi";
import PropTypes from "prop-types";

const FilePreview = ({ file, isOpen, onClose }) => {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPreview = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.getFilePreview(file.id);
      setPreview(response.data);
    } catch {
      setError("Failed to load preview");
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    }
  }, [isOpen, file, loadPreview]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-medium">
              {file?.name}
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
            ) : preview ? (
              <div className="preview-container">
                {preview.type === "image" ? (
                  <img
                    src={preview.url}
                    alt={file.name}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : preview.type === "text" ? (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
                    {preview.content}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Preview not available for this file type
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

FilePreview.propTypes = {
  file: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FilePreview;
