import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

function getExtension(fileName = '') {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot < 0) return '';
  return fileName.slice(lastDot).toLowerCase();
}

function isFileAccepted(file, accept) {
  if (!accept || accept === '*/*') return true;

  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const fileType = (file?.type || '').toLowerCase();
  const extension = getExtension(file?.name || '');

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return extension === token;
    }
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1);
      return fileType.startsWith(prefix);
    }
    return fileType === token;
  });
}

export function FileUploader({
  onChange,
  onError,
  accept = 'image/*',
  maxSize = 5242880,
  multiple = false,
  disabled = false,
}) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      onError?.('Please select a file to upload.');
      return;
    }

    const validFiles = Array.from(selectedFiles).filter((file) => {
      if (!isFileAccepted(file, accept)) {
        onError?.(`File type not supported: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        onError?.(`File ${file.name} is too large (max ${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

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
        className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
        <p className="text-gray-400 text-sm">
          Supported: PDF, DOCX, PPTX, XLSX, Images, ZIP up to {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </button>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
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
                className="p-1 text-gray-400 hover:text-red-400 transition ml-2 disabled:opacity-50"
                aria-label="Remove file"
                disabled={disabled}
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
