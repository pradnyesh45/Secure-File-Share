import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fileApi } from "../../services/fileApi";
import { setError } from "../../store/authSlice";
import FileUpload from "./FileUpload";
import FileList from "./FileList";
import FileSearch from "./FileSearch";
import TagManager from "./TagManager";

const Files = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const dispatch = useDispatch();

  const loadFiles = useCallback(async () => {
    try {
      const response = await fileApi.getFiles();
      setFiles(response.data);
    } catch {
      dispatch(setError("Failed to load files"));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUploaded = () => {
    loadFiles();
  };

  const handleFileDeleted = () => {
    loadFiles();
  };

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    try {
      const response = await fileApi.searchFiles(searchParams);
      setFiles(response.data);
    } catch {
      dispatch(setError("Failed to search files"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsTagManagerOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Manage Tags
          </button>
        </div>
      </div>

      <FileSearch onSearch={handleSearch} />

      <FileUpload onFileUploaded={handleFileUploaded} />

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <FileList files={files} onFileDeleted={handleFileDeleted} />
      )}

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        onTagsUpdated={loadFiles}
      />
    </div>
  );
};

export default Files;
