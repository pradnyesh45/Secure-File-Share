import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DocumentIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { fileApi } from "../../services/fileApi";
import { setSharedFiles } from "../../store/fileSlice";

const SharedFiles = () => {
  const dispatch = useDispatch();
  const { sharedFiles, isLoading } = useSelector((state) => state.files);
  const [error, setError] = useState(null);

  const loadSharedFiles = useCallback(async () => {
    try {
      const response = await fileApi.getSharedFiles();
      dispatch(setSharedFiles(response.data));
    } catch {
      setError("Failed to load shared files");
    }
  }, [dispatch]);

  useEffect(() => {
    loadSharedFiles();
  }, [loadSharedFiles]);

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
    } catch {
      setError("Failed to download file");
    }
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
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Shared with Me
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-400">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {sharedFiles.map((file) => (
          <li key={file.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Shared on {new Date(file.shared_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
        {sharedFiles.length === 0 && (
          <li className="p-4 text-center text-gray-500">
            No files have been shared with you
          </li>
        )}
      </ul>
    </div>
  );
};

export default SharedFiles;
