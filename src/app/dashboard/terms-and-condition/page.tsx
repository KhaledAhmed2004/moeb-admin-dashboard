"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Clock,
  Loader2,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import {
  useGetLegals,
  useGetLegalById,
  useCreateLegal,
  useUpdateLegal,
  useDeleteLegal,
} from "@/hooks/useLegals";
import { ILegalPage } from "@/types/legal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function TermsAndConditionPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Page View Modes: "list" | "create" | "edit" | "view"
  const [pageMode, setPageMode] = useState<"list" | "create" | "edit" | "view">("list");
  
  // Selected Document & Form States
  const [selectedDoc, setSelectedDoc] = useState<ILegalPage | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // API Hooks
  const { data: legalsList = [], isLoading } = useGetLegals();

  // Active Legal ID for GET /api/v1/legals/:legalId
  const activeLegalId = selectedDoc?._id ?? null;
  const { data: legalDetail, isLoading: isLoadingDetail } = useGetLegalById(activeLegalId);

  const createLegalMutation = useCreateLegal();
  const updateLegalMutation = useUpdateLegal();
  const deleteLegalMutation = useDeleteLegal();

  const isSubmitting = createLegalMutation.isPending || updateLegalMutation.isPending;
  const isDeleting = deleteLegalMutation.isPending;

  // Sync title and content when single legal page detail is loaded from API
  useEffect(() => {
    if (legalDetail && (pageMode === "edit" || pageMode === "view")) {
      if (pageMode === "edit" && !content) {
        setTitle(legalDetail.title || "");
        setContent(legalDetail.content || "");
      }
    }
  }, [legalDetail, pageMode, content]);

  // Filtered List
  const filteredLegals = useMemo(() => {
    if (!searchTerm.trim()) return legalsList;
    return legalsList.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [legalsList, searchTerm]);

  // Open Full-Page Create View
  const handleOpenCreateView = () => {
    setSelectedDoc(null);
    setTitle("");
    setContent("");
    setEditorTab("edit");
    setPageMode("create");
  };

  // Open Full-Page Edit View
  const handleOpenEditView = (doc: ILegalPage) => {
    setSelectedDoc(doc);
    setTitle(doc.title || "");
    setContent(doc.content || "");
    setEditorTab("edit");
    setPageMode("edit");
  };

  // Open Full-Page View Detail Mode
  const handleOpenDetailView = (doc: ILegalPage) => {
    setSelectedDoc(doc);
    setPageMode("view");
  };

  // Discard & Return to List
  const handleBackToList = () => {
    setPageMode("list");
    setSelectedDoc(null);
    setTitle("");
    setContent("");
  };

  // Save / Publish Policy
  const handleSavePolicy = () => {
    if (!title.trim()) {
      toast.error("Please enter a policy title");
      return;
    }

    if (pageMode === "edit" && selectedDoc) {
      // PATCH /api/v1/legals/:legalId
      updateLegalMutation.mutate(
        {
          legalId: selectedDoc._id,
          payload: { title: title.trim(), content },
        },
        {
          onSuccess: () => {
            handleBackToList();
          },
        }
      );
    } else {
      // POST /api/v1/legals
      createLegalMutation.mutate(
        { title: title.trim(), content },
        {
          onSuccess: () => {
            handleBackToList();
          },
        }
      );
    }
  };

  // Confirm Delete Policy
  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteLegalMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        if (selectedDoc && selectedDoc._id === deleteId) {
          handleBackToList();
        }
      },
    });
  };

  // Columns definition (Icons only for actions, no text labels)
  const columns: ColumnDef<ILegalPage>[] = [
    {
      header: "Policy Title",
      accessorKey: "title",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <FileText size={18} />
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">{row.title}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Created At",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={13} className="text-gray-400" />
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </div>
      ),
    },
    {
      header: "Last Updated",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={13} className="text-gray-400" />
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDetailView(row)}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 h-8 w-8 rounded-lg"
            title="View Policy Details"
          >
            <Eye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditView(row)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 rounded-lg"
            title="Edit Policy"
          >
            <Edit size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row._id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8 rounded-lg"
            title="Delete Policy"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full w-full max-w-full overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. TABLE LIST VIEW
         ───────────────────────────────────────────────────────────── */}
      {pageMode === "list" && (
        <>
          {/* Header Section without Icon */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap w-full">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Legal Policy Management</h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Manage, edit, and publish platform terms of service and legal agreements
              </p>
            </div>

            <Button
              onClick={handleOpenCreateView}
              className="bg-primary hover:bg-purple-700 text-white font-semibold h-10 px-5 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Legal Policy
            </Button>
          </div>

          {/* Table Container */}
          <div className="w-full max-w-full">
            <DataTable
              columns={columns}
              data={filteredLegals}
              isLoading={isLoading}
              searchPlaceholder="Search legal policies by title..."
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              keyExtractor={(item) => item._id}
              emptyMessage="No legal policies found. Click 'Add Legal Policy' to create one."
            />
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FULL-PAGE CREATE / EDIT EDITOR VIEW
         ───────────────────────────────────────────────────────────── */}
      {(pageMode === "create" || pageMode === "edit") && (
        <div className="space-y-6 w-full max-w-full">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 flex-wrap w-full">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {pageMode === "create" ? "Create New Legal Policy" : "Edit Legal Policy"}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {pageMode === "create"
                  ? "Draft and publish a new policy document"
                  : `Updating "${selectedDoc?.title}"`}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={handleBackToList}
                disabled={isSubmitting}
                className="text-gray-600 hover:text-gray-900 font-semibold h-10 px-4 border-gray-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <Button
                onClick={handleSavePolicy}
                disabled={isSubmitting}
                className="bg-primary hover:bg-purple-700 text-white font-semibold h-10 px-5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Publish
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form & Editor Card */}
          <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 overflow-hidden flex flex-col w-full max-w-full">
            <div className="p-4 lg:p-6 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 space-y-1.5 max-w-lg w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Policy Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Terms of Service, Privacy Policy..."
                  className="font-bold text-gray-900 text-lg bg-white border-gray-200 focus-visible:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {/* Editor vs Preview Mode Switcher */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      editorTab === "edit"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Edit size={13} />
                    Editor Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      editorTab === "preview"
                        ? "bg-white text-purple-700 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Eye size={13} />
                    Live Preview
                  </button>
                </div>
              </div>
            </div>

            <CardContent className="p-4 lg:p-6 w-full max-w-full overflow-hidden">
              {editorTab === "edit" ? (
                <div className="w-full max-w-full overflow-x-auto">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Compose policy content here..."
                  />
                </div>
              ) : (
                <div className="p-6 lg:p-10 min-h-[500px] w-full max-w-full overflow-hidden">
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-purple-900">
                    <span>
                      <strong>Public View Preview:</strong> This shows how users will view &quot;{title || "Untitled Policy"}&quot; on web &amp; mobile apps.
                    </span>
                    <Badge variant="outline" className="bg-white border-purple-200 text-purple-700 font-semibold">
                      Live Preview
                    </Badge>
                  </div>

                  <div
                    className="prose prose-purple max-w-none text-gray-800 leading-relaxed font-sans w-full max-w-full break-words [word-break:break-word] overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: content || "<p>No content provided.</p>" }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FULL-PAGE DETAIL VIEW MODE
         ───────────────────────────────────────────────────────────── */}
      {pageMode === "view" && selectedDoc && (
        <div className="space-y-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 flex-wrap w-full">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedDoc.title}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="text-gray-600 border-gray-200 hover:bg-gray-50 font-semibold h-10 px-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={() => handleOpenEditView(selectedDoc)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 shadow-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Policy
              </Button>

              <Button
                variant="outline"
                onClick={() => setDeleteId(selectedDoc._id)}
                className="text-red-600 border-red-200 hover:bg-red-50 font-semibold h-10 px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 p-6 lg:p-10 w-full max-w-full overflow-hidden">
            <div className="flex flex-wrap items-center justify-end gap-3 p-4 bg-purple-50/60 border border-purple-100 rounded-xl mb-8 text-xs text-purple-900">
              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  Created: {selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleDateString() : "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-gray-400" />
                  Updated: {selectedDoc.updatedAt ? new Date(selectedDoc.updatedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>

            {isLoadingDetail ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm font-medium text-gray-500">Loading policy content from API...</p>
              </div>
            ) : (
              <div
                className="prose prose-purple max-w-none text-gray-800 leading-relaxed font-sans min-h-[400px] w-full max-w-full break-words [word-break:break-word] overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html:
                    legalDetail?.content ||
                    selectedDoc.content ||
                    content ||
                    "<p>No content available.</p>",
                }}
              />
            )}
          </Card>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Legal Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this legal policy document? This action cannot be undone and will remove it from public platforms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Policy"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
