import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { fileApi } from "../../services/fileApi";

const SharedLink = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSharedFile = useCallback(async () => {
    try {
      const response = await fileApi.getSharedFileByToken(token);
      setFile(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "This link has expired or is invalid"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSharedFile();
  }, [loadSharedFile]);

  const handleDownload = async () => {
    try {
      const response = await fileApi.downloadSharedFile(token);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Link Not Available
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shared File</h2>
          <div className="mb-6">
            <p className="text-lg text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">
              Expires on {new Date(file.expires_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedLink;
