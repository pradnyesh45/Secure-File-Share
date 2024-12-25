import { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { fileApi } from "../../services/fileApi";
import { setError } from "../../store/authSlice";

const FileUpload = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        await fileApi.uploadFile(file);
      }
      onFileUploaded();
    } catch {
      dispatch(setError("Failed to upload file(s)"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-indigo-600 hover:text-indigo-800"
        >
          {isUploading ? (
            <span>Uploading...</span>
          ) : (
            <span>Drop files here or click to upload</span>
          )}
        </label>
      </div>
    </div>
  );
};

FileUpload.propTypes = {
  onFileUploaded: PropTypes.func.isRequired,
};

export default FileUpload;
