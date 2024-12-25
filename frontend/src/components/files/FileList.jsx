import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fileApi } from "../../services/fileApi";
import { setFiles, setLoading, setError } from "../../store/fileSlice";
import { DocumentIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const FileList = () => {
  const dispatch = useDispatch();
  const { files, loading, error } = useSelector((state) => state.files);
  const fileInputRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await fileApi.getFiles();
      console.log("Raw API Response:", response.data); // Debug log

      // Ensure we're getting an array of files
      const fileArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.files)
        ? response.data.files
        : [];

      console.log("Processed files array:", fileArray); // Debug log
      dispatch(setFiles(fileArray));
    } catch (error) {
      console.error("Error fetching files:", error.response || error);
      dispatch(setError("Failed to load files"));
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("FileList mounted");
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(setLoading(true));
    try {
      await fileApi.uploadFile(file);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      dispatch(setError("Failed to upload file"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow">
        <div className="text-lg font-semibold text-gray-700">
          Loading files...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-700">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-2 bg-blue-50 text-sm">
        Files count: {files?.length || 0}
        <br />
        Loading: {loading ? "true" : "false"}
        <br />
        Error: {error || "none"}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Files</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : !files || files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No files uploaded yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {Array.isArray(files) &&
            files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-4 bg-white rounded shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-6 w-6 text-blue-600" />
                  <span>{file.name}</span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
