import React, { useState, useCallback } from "react";
import { Copy } from "@/components/ui/copy";
import { useProductStore } from "@/features/products/store";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Info, XCircle, CheckCircle, Loader2, Check, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BulkUploadStatusProps {
  status?: "idle" | "uploading" | "processing" | "error" | "complete";
  errors?: string[];
  onRetry?: () => void;
  batchId?: string;
  result?: any; // The full upload result object
  responseStatusCode?: number; // Optionally pass the HTTP status code
}

function getFeedbackType(result: any, status?: string, responseStatusCode?: number) {
  if (typeof responseStatusCode === 'number' && responseStatusCode >= 400) return 'error';
  if (result?.status === 'error') return 'error';
  // If perfect upload (100% success, no errors/warnings), always treat as success
  if (
    result?.summary?.success_rate &&
    (result.summary.success_rate === 1 || result.summary.success_rate === 100 || result.summary.success_rate === "100") &&
    (!result.errors || result.errors.length === 0) &&
    (!result.warnings || result.warnings.length === 0)
  ) {
    return 'success';
  }
  if (result?.status === 'pending') return 'info';
  if (result?.status === 'complete' || result?.status === 'success') return 'success';
  if (status === 'error') return 'error';
  if (status === 'complete' || status === 'success') return 'success';
  return 'info';
}

export const BulkUploadStatus: React.FC<BulkUploadStatusProps> = ({ status, errors, onRetry, batchId, result, responseStatusCode }) => {
  const effectiveStatus = result?.status || status;
  if (effectiveStatus === "idle") return null;
  if (effectiveStatus === "uploading") {
    return (
      <div className="my-8 flex flex-col items-center animate-fade-in">
        <span className="text-3xl animate-spin">⏳</span>
        <span className="mt-3 text-primary font-medium text-lg">Uploading your file...</span>
      </div>
    );
  }
  if (effectiveStatus === "processing") {
    return (
      <div className="my-8 flex flex-col items-center animate-fade-in">
        <span className="text-3xl animate-pulse">🔄</span>
        <span className="mt-3 text-primary font-medium text-lg">Processing your batch...</span>
        {(result?.batch_id || batchId) && <span className="text-xs text-muted-foreground mt-2">Batch ID: {result?.batch_id || batchId}</span>}
      </div>
    );
  }

  // Determine feedback type
  const feedbackType = getFeedbackType(result, status, responseStatusCode);
  let cardBg = "bg-blue-50 border-blue-300";
  let icon = <Info className="text-blue-500 w-7 h-7" />;
  let title = "Upload Feedback";
  let titleClass = "text-blue-700";
  if (feedbackType === 'error') {
    cardBg = "bg-red-50 border-red-300";
    icon = <XCircle className="text-red-500 w-7 h-7" />;
    title = "Upload Failed";
    titleClass = "text-red-700";
  } else if (feedbackType === 'success') {
    cardBg = "bg-green-50 border-green-300";
    icon = <CheckCircle className="text-green-500 w-7 h-7" />;
    title = "Upload Complete!";
    titleClass = "text-green-700";
  }

  // Extract backend error message if present
  const backendErrorMsg =
    typeof result?.detail === 'string' ? result.detail :
    typeof result?.error === 'string' ? result.error :
    typeof result?.message === 'string' ? result.message : null;

  // Only show summary if there are meaningful fields and not just a status code or error message
  const hasSummaryFields = result && (
    (
      result.batch_id ||
      typeof result.total_products !== 'undefined' ||
      typeof result.valid_products !== 'undefined' ||
      typeof result.invalid_products !== 'undefined' ||
      typeof result.warning_products !== 'undefined' ||
      typeof result.total_images !== 'undefined' ||
      typeof result.processed_images !== 'undefined' ||
      typeof result.failed_images !== 'undefined' ||
      (result.summary && typeof result.summary.success_rate !== 'undefined')
    )
    && !(
      Object.keys(result).every(
        k => [
          'detail', 'error', 'message', 'status', 'errors', 'warnings', 'summary'
        ].includes(k)
      )
    )
  );

  const { approveBulkUploadBatch } = useProductStore();
  const { data: session } = useSession();
  const [approving, setApproving] = useState(false);
  const router = useRouter();

  const handleApprove = useCallback(async () => {
    if (!result?.batch_id || !session?.user?.name) return;
    setApproving(true);
    try {
      await approveBulkUploadBatch(result.batch_id, session.user.name, { 'X-Tenant-ID': session.user?.tenant_id });
      toast.success("Batch approved successfully!");
      router.push("/dashboard/products");
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve batch");
    } finally {
      setApproving(false);
    }
  }, [approveBulkUploadBatch, result?.batch_id, session?.user?.name, router]);

  return (
    <div className={`my-8 border-l-4 rounded-xl shadow-sm p-0 transition-colors duration-300 animate-fade-in ${cardBg}`}> 
      <div className="flex items-center gap-3 px-6 pt-5 pb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-white/60 shadow-sm">{icon}</div>
        <div className={`font-semibold text-xl ${titleClass}`}>{title}</div>
      </div>
      {/* Prominent backend error message if present, otherwise fallback to status code */}
      {feedbackType === 'error' && (
        backendErrorMsg ? (
          <div className="px-6 pt-2 pb-1 mt-2">
            <div className="text-red-700 font-medium text-base mb-2">{backendErrorMsg}</div>
          </div>
        ) : responseStatusCode ? (
          <div className="px-6 pt-2 pb-1 mt-2">
            <div className="text-red-700 font-medium text-base mb-2">Request failed with status code {responseStatusCode}</div>
          </div>
        ) : null
      )}
      {/* Summary (only show if there are meaningful fields and not just a status code or error message) */}
      {hasSummaryFields && (
        <div className="px-6 pt-2 pb-2 mt-2">
          <h3 className="font-semibold text-base mb-2 text-gray-700">Upload Summary</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-2">
            {result.batch_id && (
              <div className="flex items-center col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Batch ID:</dt>
                <dd className="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all flex items-center gap-1">
                  {result.batch_id}
                  <Copy text={result.batch_id} size={14} className="ml-1" />
                </dd>
              </div>
            )}
            {result.status && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Status:</dt>
                <dd className="capitalize text-gray-800">{result.status}</dd>
              </div>
            )}
            {typeof result.total_products !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Total Products:</dt>
                <dd className="text-gray-800">{result.total_products}</dd>
              </div>
            )}
            {typeof result.valid_products !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Valid Products:</dt>
                <dd className="text-gray-800">{result.valid_products}</dd>
              </div>
            )}
            {typeof result.invalid_products !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Invalid Products:</dt>
                <dd className="text-gray-800">{result.invalid_products}</dd>
              </div>
            )}
            {typeof result.warning_products !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Warnings:</dt>
                <dd className="text-gray-800">{result.warning_products}</dd>
              </div>
            )}
            {typeof result.total_images !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Total Images:</dt>
                <dd className="text-gray-800">{result.total_images}</dd>
              </div>
            )}
            {typeof result.processed_images !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Processed Images:</dt>
                <dd className="text-gray-800">{result.processed_images}</dd>
              </div>
            )}
            {typeof result.failed_images !== 'undefined' && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Failed Images:</dt>
                <dd className="text-gray-800">{result.failed_images}</dd>
              </div>
            )}
            {result.summary?.success_rate !== undefined && (
              <div className="col-span-1">
                <dt className="font-medium text-gray-600 mr-2">Success Rate:</dt>
                <dd className="text-gray-800">
                  {result.summary.success_rate > 1
                    ? Math.round(result.summary.success_rate)
                    : (result.summary.success_rate * 100).toFixed(0)
                  }%
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {/* Section Divider */}
      {(result?.errors && result.errors.length > 0) && <div className="border-t border-red-100 mx-6 my-2" />}
      {/* Errors Table */}
      {result?.errors && result.errors.length > 0 && (
        <div className="px-6 pt-2 pb-2 mt-2">
          <h3 className="font-semibold text-destructive mb-2 text-base">Errors</h3>
          <div className="overflow-x-auto rounded border border-red-100">
            <table className="min-w-full text-xs border mb-2">
              <thead className="bg-red-100">
                <tr>
                  <th className="py-2 px-2 font-semibold text-left">Row</th>
                  <th className="py-2 px-2 font-semibold text-left">Field</th>
                  <th className="py-2 px-2 font-semibold text-left">Error Type</th>
                  <th className="py-2 px-2 font-semibold text-left">Message</th>
                  <th className="py-2 px-2 font-semibold text-left">Product Name</th>
                  <th className="py-2 px-2 font-semibold text-left">SKU</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((err: any, idx: number) => (
                  <tr key={idx} className="even:bg-red-50/40">
                    <td className="py-1 px-2 font-mono">{err.row_number}</td>
                    <td className="py-1 px-2">{err.field}</td>
                    <td className="py-1 px-2">{err.error_type}</td>
                    <td className="py-1 px-2">{err.message}</td>
                    <td className="py-1 px-2">{err.product_name}</td>
                    <td className="py-1 px-2">{err.sku}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Please fix these errors in your CSV and re-upload. See the <a href="#validation-requirements" className="underline">Validation Requirements</a> in the documentation.
          </p>
        </div>
      )}
      {/* Section Divider */}
      {(result?.warnings && result.warnings.length > 0) && <div className="border-t border-yellow-100 mx-6 my-2" />}
      {/* Warnings Table */}
      {result?.warnings && result.warnings.length > 0 && (
        <div className="px-6 pt-2 pb-2 mt-2">
          <h3 className="font-semibold text-yellow-700 mb-2 text-base">Warnings</h3>
          <div className="overflow-x-auto rounded border border-yellow-100">
            <table className="min-w-full text-xs border mb-2">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="py-2 px-2 font-semibold text-left">Row</th>
                  <th className="py-2 px-2 font-semibold text-left">Field</th>
                  <th className="py-2 px-2 font-semibold text-left">Message</th>
                  <th className="py-2 px-2 font-semibold text-left">Product Name</th>
                </tr>
              </thead>
              <tbody>
                {result.warnings.map((warn: any, idx: number) => (
                  <tr key={idx} className="even:bg-yellow-50/40">
                    <td className="py-1 px-2 font-mono">{warn.row_number}</td>
                    <td className="py-1 px-2">{warn.field}</td>
                    <td className="py-1 px-2">{warn.message}</td>
                    <td className="py-1 px-2">{warn.product_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Warnings indicate non-critical issues. Review them for best results. See <a href="#common-issues" className="underline">Common Issues</a> in the documentation.
          </p>
        </div>
      )}
      {/* Fallback for string errors */}
      {feedbackType !== 'success' &&
        (!result || (result && (!result.errors || result.errors.length === 0))) &&
        errors && errors.length > 0 && (
          <div className="px-6 pt-2 pb-2 mt-2">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      {feedbackType === 'success' && result?.batch_id && (
        <div className="px-6 pb-5 pt-2 flex justify-end gap-2">
          <button
            className="px-4 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 font-medium disabled:opacity-60"
            onClick={handleApprove}
            disabled={approving}
          >
            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
          </button>
          {onRetry && (
            <button
              className="px-4 py-1 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition flex items-center gap-2 font-medium"
              onClick={onRetry}
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
          )}
        </div>
      )}
      {feedbackType !== 'success' && onRetry && (
        <div className="px-6 pb-5 pt-2 flex justify-end">
          <button
            className="px-4 py-1 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition flex items-center gap-2 font-medium"
            onClick={onRetry}
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}
    </div>
  );
}; 