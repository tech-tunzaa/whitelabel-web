import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";

interface BulkUploadDropzoneProps {
  onUpload: (file: File) => void;
  uploading: boolean;
  disabled?: boolean;
  clearFileSignal?: number; // increment this to trigger file clear
}

export const BulkUploadDropzone = forwardRef<unknown, BulkUploadDropzoneProps>(
  ({ onUpload, uploading, disabled, clearFileSignal }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      // Clear file when clearFileSignal changes
      setSelectedFile(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    }, [clearFileSignal]);

    const handleFile = (file: File) => {
      if (!file.name.endsWith(".zip")) {
        setError("Only ZIP files are allowed.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB limit.");
        return;
      }
      setError(null);
      setSelectedFile(file);
      onUpload(file);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    };

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error
            ? "border-red-400 bg-red-50"
            : dragOver
            ? "border-primary bg-primary/10"
            : disabled
            ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed"
            : "border-muted bg-muted"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload ZIP file"
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={onChange}
          disabled={uploading || disabled}
        />
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">📦</span>
          <span className="font-semibold text-lg">
            {dragOver ? "Drop your ZIP file here!" : "Drag & drop your ZIP file here"}
          </span>
          <span className="text-sm text-muted-foreground">or click to select</span>
          <span className="text-xs text-muted-foreground mt-1">Max size: 100MB | .zip only</span>
          {selectedFile && (
            <div className="mt-2 text-sm text-primary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          {uploading && <div className="mt-2 text-sm text-primary animate-pulse">Uploading...</div>}
          {disabled && <div className="mt-2 text-sm text-muted-foreground">Select a vendor to enable upload</div>}
        </div>
      </div>
    );
  }
);
BulkUploadDropzone.displayName = "BulkUploadDropzone"; 