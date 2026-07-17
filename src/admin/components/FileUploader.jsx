import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

export function FileUploader({ onChange, accept = 'image/*', maxSize = 5242880, multiple = false }) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large (max ${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
        return false;
      }
      return true;
    });

    if (multiple) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onChange(newFiles);
    } else {
      setFiles(validFiles);
      onChange(validFiles[0]);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(multiple ? newFiles : null);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        aria-label="File upload"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition"
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
        <p className="text-gray-400 text-sm">PNG, JPG, PDF up to {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
      </button>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File size={18} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">({(file.size / 1024).toFixed(0)}KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 text-gray-400 hover:text-red-400 transition ml-2"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
