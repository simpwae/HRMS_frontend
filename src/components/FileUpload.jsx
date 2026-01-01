import { useState, useRef } from 'react';
import { DocumentIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Button from './Button';

export default function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  label = 'Upload Files',
  required = false,
  helper = '',
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState([]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const validateFile = (file) => {
    const errors = [];
    const ext = getFileExtension(file.name);
    const sizeMB = file.size / (1024 * 1024);

    if (!allowedTypes.includes(ext)) {
      errors.push(`${file.name}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    if (sizeMB > maxSizeMB) {
      errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit`);
    }

    return errors;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newErrors = [];
    const newFiles = [];

    // Check total file count
    if (value.length + files.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
    } else {
      // Validate each file
      files.forEach((file) => {
        const fileErrors = validateFile(file);
        if (fileErrors.length > 0) {
          newErrors.push(...fileErrors);
        } else {
          newFiles.push({
            id: Math.random().toString(36),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            uploadedAt: new Date().toISOString(),
          });
        }
      });
    }

    setErrors(newErrors);

    if (newFiles.length > 0) {
      onChange([...value, ...newFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId) => {
    onChange(value.filter((f) => f.id !== fileId));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files || []);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-500 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.map((t) => `.${t}`).join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">Drop files here or click to select</p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, {maxSizeMB}MB each
        </p>
      </div>

      {/* Helper Text */}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((error, idx) => (
            <p key={idx} className="text-xs text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">
            {value.length} file{value.length !== 1 ? 's' : ''} selected
          </p>
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <DocumentIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2"
                type="button"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
