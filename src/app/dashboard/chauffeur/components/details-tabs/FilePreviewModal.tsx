import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Image as ImageIcon, ExternalLink, Check, X } from "lucide-react";
import { PreviewFileState } from "../../types";

interface FilePreviewModalProps {
  previewFile: PreviewFileState;
  onOpenChange: (open: boolean) => void;
  onApprove?: (documentId: string) => void;
  onReject?: (documentId: string) => void;
}

export function FilePreviewModal({
  previewFile,
  onOpenChange,
  onApprove,
  onReject,
}: FilePreviewModalProps) {
  return (
    <Dialog open={previewFile.isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="w-[94vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[94vh] p-0 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200"
      >
        <DialogHeader className="p-4 sm:px-6 border-b flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {previewFile.isPdf ? (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <FileText size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <ImageIcon size={20} />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-gray-900 truncate">{previewFile.title}</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {previewFile.isPdf ? "PDF Document Viewer" : "Image Preview"}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              Open Original
            </a>

            {previewFile.documentId && onReject && (
              <button
                type="button"
                onClick={() => {
                  const id = previewFile.documentId!;
                  onOpenChange(false);
                  onReject(id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <X size={13} strokeWidth={2.5} />
                Reject
              </button>
            )}

            {previewFile.documentId && onApprove && (
              <button
                type="button"
                onClick={() => {
                  const id = previewFile.documentId!;
                  onOpenChange(false);
                  onApprove(id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Check size={13} strokeWidth={2.5} />
                Approve
              </button>
            )}

            <div className="h-5 w-px bg-gray-200 mx-0.5" />

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-zinc-900/5 flex items-center justify-center min-h-[460px]">
          {previewFile.isPdf ? (
            <div className="w-full h-[72vh] flex flex-col">
              <iframe
                src={previewFile.url}
                title={previewFile.title}
                className="w-full h-full rounded-xl border border-gray-200 bg-white"
              />
            </div>
          ) : (
            <div className="w-full h-full max-h-[72vh] flex items-center justify-center">
              <img
                src={previewFile.url}
                alt={previewFile.title}
                className="max-h-[72vh] max-w-full w-auto object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
