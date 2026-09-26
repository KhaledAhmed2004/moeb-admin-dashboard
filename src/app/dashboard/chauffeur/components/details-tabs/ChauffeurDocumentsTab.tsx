import React, { useMemo } from "react";
import {
  FileText,
  FileCheck,
  Calendar,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationDocument, PreviewFileState } from "../../types";

interface ChauffeurDocumentsTabProps {
  documents: ApplicationDocument[];
  formatDocName: (type: string) => string;
  formatFileSize?: (bytes?: number) => string;
  getStatusBadge: (st: string) => React.ReactNode;
  resolveFileUrl: (url?: string) => string;
  isPdfFile: (urlOrMime?: string, filename?: string) => boolean;
  setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFileState>>;
  selectedDocumentIds: string[];
  handleSelectAllDocuments: () => void;
  handleToggleDocumentSelect: (id: string) => void;
  handleApproveDocuments: (ids?: string[]) => void;
  handleOpenRejectDocumentsModal: (ids?: string[]) => void;
  isDocApproving: boolean;
  isDocRejecting: boolean;
}

export function ChauffeurDocumentsTab({
  documents,
  formatDocName,
  resolveFileUrl,
  isPdfFile,
  setPreviewFile,
  selectedDocumentIds,
  handleSelectAllDocuments,
  handleToggleDocumentSelect,
  handleApproveDocuments,
  handleOpenRejectDocumentsModal,
  isDocApproving,
  isDocRejecting,
}: ChauffeurDocumentsTabProps) {
  const getDocKey = (doc: ApplicationDocument, idx: number) =>
    doc._id || (doc as { id?: string }).id || `${doc.documentType || "doc"}-${idx}`;

  const getDocStatusCategory = (st?: string): "APPROVED" | "REJECTED" | "PENDING" => {
    const s = (st || "").toUpperCase();
    if (s.includes("APPROV") || s.includes("ACTIVE") || s === "VERIFIED" || s === "CLEAN") {
      return "APPROVED";
    }
    if (s.includes("SUSPEND") || s.includes("REJECT") || s.includes("INFECTED")) {
      return "REJECTED";
    }
    return "PENDING";
  };

  const pendingCount = useMemo(() => {
    return documents.filter((d) => getDocStatusCategory(d.status) === "PENDING").length;
  }, [documents]);

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <FileText size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-medium text-gray-600">No documents submitted yet</p>
      </div>
    );
  }

  const allSelected =
    documents.length > 0 && selectedDocumentIds.length === documents.length;

  return (
    <div className="space-y-3">
      {/* ─── Single Unified Toolbar (Minimal Cognitive Load) ─────────────── */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={handleSelectAllDocuments}
          >
            <Checkbox
              id="select-all-documents"
              checked={allSelected}
              onCheckedChange={handleSelectAllDocuments}
              onClick={(e) => e.stopPropagation()}
            />
            <label
              htmlFor="select-all-documents"
              className="text-xs font-bold text-gray-700 cursor-pointer select-none"
            >
              Select All Documents ({documents.length})
            </label>
          </div>

          {selectedDocumentIds.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
              {selectedDocumentIds.length} Selected
            </span>
          ) : pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {pendingCount} Pending Review
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All Approved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenRejectDocumentsModal()}
            disabled={isDocApproving || isDocRejecting || selectedDocumentIds.length === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            {isDocRejecting
              ? "Rejecting..."
              : selectedDocumentIds.length > 1
              ? `Reject Selected (${selectedDocumentIds.length})`
              : "Reject Selected"}
          </button>

          <button
            type="button"
            onClick={() => handleApproveDocuments()}
            disabled={isDocApproving || isDocRejecting || selectedDocumentIds.length === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDocApproving
              ? "Approving..."
              : selectedDocumentIds.length > 1
              ? `Approve Selected (${selectedDocumentIds.length})`
              : "Approve Selected"}
          </button>
        </div>
      </div>

      {/* ─── Document Cards List ────────────────────────────────────────── */}
      {documents.map((doc, idx) => {
        const docKey = getDocKey(doc, idx);
        const isChecked =
          selectedDocumentIds.includes(docKey) ||
          (doc._id ? selectedDocumentIds.includes(doc._id) : false) ||
          ((doc as { id?: string }).id
            ? selectedDocumentIds.includes((doc as { id?: string }).id!)
            : false);

        const statusCat = getDocStatusCategory(doc.status);
        const fileUrl = resolveFileUrl(doc.storageKey);
        const isPdf = Boolean(
          isPdfFile(doc.storageKey, doc.originalFilename) ||
          (doc.mimeType && doc.mimeType.includes("pdf"))
        );

        // Expiry logic
        const expiryDateObj = doc.expiryDate ? new Date(doc.expiryDate) : null;
        const isExpired = expiryDateObj ? expiryDateObj.getTime() < Date.now() : false;
        const daysToExpiry = expiryDateObj
          ? Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
        const isExpiringSoon = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30;

        const openPreview = () => {
          if (!fileUrl) return;
          setPreviewFile({
            isOpen: true,
            title: formatDocName(doc.documentType),
            url: fileUrl,
            isPdf,
            documentId: docKey,
            status: doc.status,
          });
        };

        return (
          <div
            key={docKey}
            className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
              isChecked
                ? "ring-2 ring-primary border-primary/50 bg-primary/[0.015]"
                : "border-gray-200/80 hover:border-gray-300"
            }`}
          >
            {/* Left: Checkbox + Icon + Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggleDocumentSelect(docKey)}
                className="cursor-pointer shrink-0"
              />

              <div
                className={`p-2.5 rounded-xl flex-shrink-0 ${
                  isPdf
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-blue-50 text-blue-700 border border-blue-100"
                }`}
              >
                {isPdf ? <FileText size={18} /> : <FileCheck size={18} />}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                {/* Title & Status Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-bold text-sm text-gray-900 truncate">
                    {formatDocName(doc.documentType)}
                  </h5>

                  {/* Refined, low-noise status badge */}
                  {statusCat === "APPROVED" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Approved
                    </span>
                  )}

                  {statusCat === "REJECTED" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Rejected
                    </span>
                  )}

                  {statusCat === "PENDING" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending Review
                    </span>
                  )}

                  {isExpired && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                      <AlertTriangle size={11} />
                      Expired
                    </span>
                  )}
                </div>

                {/* Metadata: Expiry & Update Timestamps */}
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  {expiryDateObj && (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isExpired
                          ? "text-rose-600 font-semibold"
                          : isExpiringSoon
                          ? "text-amber-600 font-medium"
                          : "text-emerald-700"
                      }`}
                    >
                      <Calendar size={12} />
                      {isExpired
                        ? `Expired on: ${expiryDateObj.toLocaleDateString()}`
                        : isExpiringSoon
                        ? `Expires in ${daysToExpiry} days (${expiryDateObj.toLocaleDateString()})`
                        : `Valid until: ${expiryDateObj.toLocaleDateString()}`}
                    </span>
                  )}

                  {(doc.updatedAt || doc.createdAt) && (
                    <span className="text-[11px] text-gray-400">
                      Last updated:{" "}
                      {new Date(doc.updatedAt || doc.createdAt!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Rejection Note if rejected */}
                {doc.rejectionReason && (
                  <div className="mt-1.5 p-2 rounded-lg bg-rose-50/70 border border-rose-100 text-xs text-rose-700">
                    <span className="font-semibold">Rejection Note:</span>{" "}
                    {doc.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Clean Preview button + Discreet 3-dots menu */}
            <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center ml-9 sm:ml-0">
              {fileUrl ? (
                <button
                  type="button"
                  onClick={openPreview}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  Preview
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 italic px-2">No file</span>
              )}

              {/* Discreet 3-dots dropdown for single-document action */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="More Options"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 text-xs">
                  {statusCat !== "APPROVED" && (
                    <DropdownMenuItem
                      onClick={() => handleApproveDocuments([docKey])}
                      disabled={isDocApproving}
                      className="cursor-pointer text-emerald-600 font-medium flex items-center gap-2"
                    >
                      <Check size={13} />
                      Approve Document
                    </DropdownMenuItem>
                  )}
                  {statusCat !== "REJECTED" && (
                    <DropdownMenuItem
                      onClick={() => handleOpenRejectDocumentsModal([docKey])}
                      disabled={isDocRejecting}
                      className="cursor-pointer text-rose-600 font-medium flex items-center gap-2"
                    >
                      <X size={13} />
                      Reject Document
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
