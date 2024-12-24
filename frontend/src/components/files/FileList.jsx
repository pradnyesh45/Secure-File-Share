import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, removeFile } from "../../store/fileSlice";
import { fileApi } from "../../services/fileApi";
import {
  DocumentIcon,
  TrashIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ShareModal from "./ShareModal";
import FilePreview from "./FilePreview";
import FileVersions from "./FileVersions";

const FileList = () => {
  const dispatch = useDispatch();
  const { files, isLoading } = useSelector((state) => state.files);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [versionFile, setVersionFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fileApi.getFiles();
      dispatch(setFiles(response.data));
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await fileApi.deleteFile(fileId);
        dispatch(removeFile(fileId));
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fileApi.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <li key={file.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare(file)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPreviewFile(file)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setVersionFile(file)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <ClockIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {file.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mr-1"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              ))}
            </div>
          </li>
        ))}
        {files.length === 0 && (
          <li className="p-4 text-center text-gray-500">
            No files uploaded yet
          </li>
        )}
      </ul>

      {shareModalOpen && selectedFile && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
        />
      )}

      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {versionFile && (
        <FileVersions
          file={versionFile}
          isOpen={!!versionFile}
          onClose={() => setVersionFile(null)}
          onVersionRestored={loadFiles}
        />
      )}
    </div>
  );
};

export default FileList;
