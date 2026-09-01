import React from "react";
import { FileText, FileCheck, Calendar, Eye, ExternalLink } from "lucide-react";
import { ApplicationDocument, PreviewFileState } from "../../types";

interface ChauffeurDocumentsTabProps {
  documents: ApplicationDocument[];
  formatDocName: (type: string) => string;
  formatFileSize: (bytes?: number) => string;
  getStatusBadge: (st: string) => React.ReactNode;
  resolveFileUrl: (url?: string) => string;
  isPdfFile: (urlOrMime?: string, filename?: string) => boolean;
  setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFileState>>;
}

export function ChauffeurDocumentsTab({
  documents,
  formatDocName,
  formatFileSize,
  getStatusBadge,
  resolveFileUrl,
  isPdfFile,
  setPreviewFile,
}: ChauffeurDocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <FileText size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-medium text-gray-600">No documents submitted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, idx) => {
        const fileUrl = resolveFileUrl(doc.storageKey);
        const isPdf = Boolean(
          isPdfFile(doc.storageKey, doc.originalFilename) ||
          (doc.mimeType && doc.mimeType.includes("pdf"))
        );
        return (
          <div
            key={doc._id || idx}
            className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  isPdf ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {isPdf ? <FileText size={18} /> : <FileCheck size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-bold text-sm text-gray-900">
                    {formatDocName(doc.documentType)}
                  </h5>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isPdf
                        ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                        : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                    }`}
                  >
                    {isPdf ? "PDF" : "IMAGE"}
                  </span>
                  {getStatusBadge(doc.status)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  File:{" "}
                  <span className="font-mono text-gray-700">
                    {doc.originalFilename || "document"}
                  </span>{" "}
                  • {formatFileSize(doc.sizeBytes)} •{" "}
                  {doc.mimeType || (isPdf ? "application/pdf" : "image/jpeg")}
                </p>
                {doc.expiryDate && (
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    Valid until: {new Date(doc.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {fileUrl && (
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() =>
                    setPreviewFile({
                      isOpen: true,
                      title: formatDocName(doc.documentType),
                      url: fileUrl,
                      isPdf,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  Preview
                </button>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ExternalLink size={12} />
                  Open
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
