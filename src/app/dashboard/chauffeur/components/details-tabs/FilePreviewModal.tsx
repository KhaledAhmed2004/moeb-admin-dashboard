import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { PreviewFileState } from "../../types";

interface FilePreviewModalProps {
  previewFile: PreviewFileState;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewModal({ previewFile, onOpenChange }: FilePreviewModalProps) {
  return (
    <Dialog open={previewFile.isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between pr-10">
          <div className="flex items-center gap-2.5">
            {previewFile.isPdf ? (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <FileText size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <ImageIcon size={20} />
              </div>
            )}
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">{previewFile.title}</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {previewFile.isPdf ? "PDF Document Viewer" : "Image Preview"}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ExternalLink size={13} />
              Open Original
            </a>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-zinc-900/5 flex items-center justify-center min-h-[420px]">
          {previewFile.isPdf ? (
            <div className="w-full h-[620px] flex flex-col">
              <iframe
                src={previewFile.url}
                title={previewFile.title}
                className="w-full h-full rounded-xl border border-gray-200 bg-white"
              />
            </div>
          ) : (
            <div className="max-h-[620px] flex items-center justify-center">
              <img
                src={previewFile.url}
                alt={previewFile.title}
                className="max-h-[580px] w-auto object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
