import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { addFile, setError } from "../../store/fileSlice";
import { fileApi } from "../../services/fileApi";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    if (files.length) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = [...e.target.files];
    if (files.length) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fileApi.uploadFile(formData);
        dispatch(addFile(response.data));
      }
    } catch (error) {
      dispatch(setError("Failed to upload file(s)"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-500"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
              <span>Upload files</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                multiple
                onChange={handleFileSelect}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            Any file type up to 10MB
          </p>
        </div>
      </div>
      {isUploading && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Uploading files...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
