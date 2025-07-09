import React from "react";

export interface BulkUploadStatusProps {
  status: "idle" | "uploading" | "processing" | "error" | "complete";
  errors?: string[];
  onRetry?: () => void;
  batchId?: string;
}

export const BulkUploadStatus: React.FC<BulkUploadStatusProps> = ({ status, errors, onRetry, batchId }) => {
  if (status === "idle") return null;
  if (status === "uploading") {
    return (
      <div className="my-6 flex flex-col items-center">
        <span className="text-2xl animate-spin">⏳</span>
        <span className="mt-2 text-primary">Uploading your file...</span>
      </div>
    );
  }
  if (status === "processing") {
    return (
      <div className="my-6 flex flex-col items-center">
        <span className="text-2xl animate-pulse">🔄</span>
        <span className="mt-2 text-primary">Processing your batch...</span>
        {batchId && <span className="text-xs text-muted-foreground mt-1">Batch ID: {batchId}</span>}
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="my-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
          <span>❌ Upload Failed</span>
        </div>
        {errors && errors.length > 0 && (
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
        {onRetry && (
          <button
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  if (status === "complete") {
    return (
      <div className="my-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
        <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
          <span>✅ Upload Complete!</span>
        </div>
        {batchId && <span className="text-xs text-muted-foreground">Batch ID: {batchId}</span>}
        <div className="mt-2 text-green-700">Your products are being processed. You can monitor progress in the batch details.</div>
      </div>
    );
  }
  return null;
}; 