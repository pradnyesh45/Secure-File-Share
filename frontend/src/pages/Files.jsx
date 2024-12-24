import React, { useState, useEffect } from "react";
import FileUpload from "../components/files/FileUpload";
import FileList from "../components/files/FileList";
import FileSearch from "../components/files/FileSearch";
import { fileApi } from "../services/fileApi";

const Files = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = async (searchParams) => {
    try {
      setIsLoading(true);
      const response = await fileApi.getFiles(searchParams);
      setFiles(response.data);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSearch = (searchParams) => {
    loadFiles(searchParams);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload and manage your secure files
          </p>
        </div>
      </div>

      <FileSearch onSearch={handleSearch} />
      <FileUpload onUploadComplete={() => loadFiles()} />
      <FileList
        files={files}
        isLoading={isLoading}
        onFileDeleted={() => loadFiles()}
      />
    </div>
  );
};

export default Files;
