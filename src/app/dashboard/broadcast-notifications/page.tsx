"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Radio,
  Bell,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Image as ImageIcon,
  Video,
  UploadCloud,
  Trash2,
  Play,
  Eye,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomTextarea } from "@/components/shared/CustomTextarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BroadcastService } from "@/services/broadcastService";
import { IBroadcastPayload } from "@/types/broadcast";
import { getMediaUrl } from "@/lib/utils";

export default function BroadcastNotificationsPage() {
  const queryClient = useQueryClient();

  // Form states - Target is always ALL users
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [serviceAreaId, setServiceAreaId] = useState<string>("");
  const [notificationType, setNotificationType] = useState<string>("ADMIN");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Media attachments state: Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Media attachments state: Video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoMode, setVideoMode] = useState<"file" | "url">("file");
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Table media preview dialog state
  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video";
    url: string;
    title: string;
  } | null>(null);

  // Table filtering & pagination
  const [searchFilter, setSearchFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Broadcast Deletion state
  const [broadcastToDelete, setBroadcastToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (broadcastId: string) =>
      BroadcastService.deleteBroadcast(broadcastId),
    onSuccess: (data) => {
      toast.success("Broadcast message deleted successfully", {
        description: `Removed from history and ${data?.data?.deletedNotificationsCount ?? 0} user inboxes.`,
      });
      setBroadcastToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["broadcast-history"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete broadcast message";
      toast.error("Failed to delete broadcast", { description: msg });
      setBroadcastToDelete(null);
    },
  });

  // 1. Fetch Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["broadcast-stats"],
    queryFn: () => BroadcastService.getBroadcastStats(),
    staleTime: 10000,
  });

  // 2. Fetch Service Areas
  const { data: serviceAreas = [] } = useQuery({
    queryKey: ["broadcast-service-areas"],
    queryFn: () => BroadcastService.getServiceAreas(),
    staleTime: 60000,
  });

  // 3. Fetch Broadcast History
  const {
    data: historyData,
    isLoading: isHistoryLoading,
  } = useQuery({
    queryKey: ["broadcast-history", page],
    queryFn: () =>
      BroadcastService.getBroadcastHistory({
        page,
        limit,
      }),
    staleTime: 5000,
  });

  const broadcasts = historyData?.data || [];
  const pagination = historyData?.pagination || { page: 1, limit, total: 0, totalPage: 1 };

  // Handlers for Image File
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must not exceed 10MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Handlers for Video File
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must not exceed 50MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // 4. Send Mutation
  const sendMutation = useMutation({
    mutationFn: (payload: IBroadcastPayload | FormData) =>
      BroadcastService.sendBroadcast(payload),
    onSuccess: (data) => {
      toast.success("Broadcast sent successfully!", {
        description: `Delivered to ${data?.recipientCount || 0} user inboxes and ${data?.deviceTokenCount || 0} mobile devices.`,
      });
      // Reset form
      setTitle("");
      setBody("");
      setLinkUrl("");
      setLinkLabel("");
      handleRemoveImage();
      handleRemoveVideo();
      setIsConfirmOpen(false);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["broadcast-history"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast-stats"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to send broadcast";
      toast.error("Failed to send broadcast", { description: msg });
      setIsConfirmOpen(false);
    },
  });

  const handleSendClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeSend = () => {
    const hasFiles = Boolean(imageFile || videoFile);

    if (hasFiles) {
      // Use FormData to support binary image/video uploads
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("body", body.trim());
      formData.append("audience", "ALL");
      if (serviceAreaId) formData.append("serviceAreaId", serviceAreaId);
      if (notificationType) formData.append("type", notificationType);
      if (linkUrl) {
        formData.append("link[url]", linkUrl.trim());
        formData.append("link[label]", linkLabel.trim() || "View Details");
      }
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("image", imageUrl.trim());
      }
      if (videoFile) {
        formData.append("video", videoFile);
      } else if (videoUrl.trim()) {
        formData.append("video", videoUrl.trim());
      }

      // JSON metadata string for body parsers
      formData.append(
        "data",
        JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          audience: "ALL",
          serviceAreaId: serviceAreaId || null,
          type: notificationType,
          link: linkUrl
            ? { url: linkUrl.trim(), label: linkLabel.trim() || "View Details" }
            : undefined,
          image: imageUrl.trim() || undefined,
          video: videoUrl.trim() || undefined,
        })
      );

      sendMutation.mutate(formData as unknown as IBroadcastPayload);
    } else {
      // Direct JSON payload
      sendMutation.mutate({
        title: title.trim(),
        body: body.trim(),
        audience: "ALL",
        serviceAreaId: serviceAreaId || null,
        type: notificationType,
        image: imageUrl.trim() || null,
        video: videoUrl.trim() || null,
        link: linkUrl
          ? { url: linkUrl.trim(), label: linkLabel.trim() || "View Details" }
          : undefined,
      });
    }
  };

  // Client search filter on current page items
  const filteredBroadcasts = broadcasts.filter((b) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.body.toLowerCase().includes(q) ||
      (b.serviceAreaName && b.serviceAreaName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-zinc-50/60 dark:bg-zinc-950 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Broadcast Notifications"
        description="Transmit instant alerts, media banners, and push notifications directly to driver and owner mobile devices"
      />

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Broadcasts Sent"
          value={stats?.totalBroadcasts || 0}
          isLoading={isStatsLoading}
          metric={{ count: stats?.totalBroadcasts || 0, growth: 0, growthType: "no_change" }}
        />
        <StatCard
          title="Recipients Reached"
          value={stats?.totalRecipientsReached || 0}
          isLoading={isStatsLoading}
          metric={{ count: stats?.totalRecipientsReached || 0, growth: 0, growthType: "positive" }}
        />
        <StatCard
          title="Push Deliveries"
          value={stats?.totalPushDelivered || 0}
          isLoading={isStatsLoading}
          metric={{ count: stats?.totalPushDelivered || 0, growth: 0, growthType: "positive" }}
        />
        <StatCard
          title="Covered Service Areas"
          value={serviceAreas.length || 0}
          isLoading={isStatsLoading}
          metric={{ count: serviceAreas.length || 0, growth: 0, growthType: "no_change" }}
        />
      </div>

      {/* Compose Form Card */}
      <Card className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Compose New Broadcast</CardTitle>
                <CardDescription className="text-xs">
                  Dispatch live push and in-app notifications with optional image and video attachments to all registered users.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40">
              Live Dispatch • All Users
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <form onSubmit={handleSendClick} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Notification Title <span className="text-rose-500">*</span>
                </label>
                <CustomInput
                  placeholder="e.g., Road Closure Alert or Scheduled Maintenance"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  icon={Bell}
                />
              </div>

              {/* Territory / Service Area filter (Optional) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Service Area Scope (Optional)
                </label>
                <select
                  value={serviceAreaId}
                  onChange={(e) => setServiceAreaId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">🌐 All Service Areas (Global Territory)</option>
                  {serviceAreas.map((sa) => (
                    <option key={sa._id} value={sa._id}>
                      📍 {sa.areaName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Message Content <span className="text-rose-500">*</span>
              </label>
              <CustomTextarea
                placeholder="Write clear and concise message to be displayed on user device lock screens and notification inboxes..."
                value={body}
                maxLength={500}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
            </div>

            {/* Media Attachments Section (Image & Video) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Media Attachments (Optional)
                  </span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                    Image & Video
                  </Badge>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Visible in app notifications and rich push alerts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Image Attachment Card */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <ImageIcon size={14} />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Banner Image
                      </span>
                    </div>

                    {/* Mode Toggle: File vs URL */}
                    <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode("file");
                          if (imageUrl) setImageUrl("");
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          imageMode === "file"
                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode("url");
                          if (imageFile) handleRemoveImage();
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          imageMode === "url"
                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {imageMode === "file" ? (
                    imagePreview ? (
                      <div className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black/5 dark:bg-white/5 h-32 flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-white/90 text-zinc-800 hover:bg-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 rounded-xl p-4 text-center bg-white dark:bg-zinc-900 hover:bg-indigo-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
                      >
                        <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                          <UploadCloud size={18} className="text-indigo-600" />
                        </div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 transition-colors">
                          Click to upload image
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          PNG, JPG, WEBP, GIF (Max 10MB)
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <CustomInput
                        placeholder="https://example.com/banner.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        icon={ImageIcon}
                      />
                      {imageUrl && (
                        <div className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black/5 h-24 flex items-center justify-center">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                            title="Clear image URL"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Video Attachment Card */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                        <Video size={14} />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Broadcast Video
                      </span>
                    </div>

                    {/* Mode Toggle: File vs URL */}
                    <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoMode("file");
                          if (videoUrl) setVideoUrl("");
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          videoMode === "file"
                            ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-2xs"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoMode("url");
                          if (videoFile) handleRemoveVideo();
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          videoMode === "url"
                            ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-2xs"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />

                  {videoMode === "file" ? (
                    videoPreview ? (
                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black h-32 flex items-center justify-center">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-all shadow-xs cursor-pointer z-10"
                          title="Remove video"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-purple-400 rounded-xl p-4 text-center bg-white dark:bg-zinc-900 hover:bg-purple-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
                      >
                        <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                          <Video size={18} className="text-purple-600" />
                        </div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-purple-600 transition-colors">
                          Click to upload video
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          MP4, WEBM, MOV (Max 50MB)
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <CustomInput
                        placeholder="https://example.com/video.mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        icon={Video}
                      />
                      {videoUrl && (
                        <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black h-24 flex items-center justify-center">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setVideoUrl("")}
                            className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs z-10"
                            title="Clear video URL"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Action Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Action Link URL (Optional)
                </label>
                <CustomInput
                  placeholder="https://ekkali.com/updates"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  icon={ExternalLink}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Link Label (Optional)
                </label>
                <CustomInput
                  placeholder="e.g., View Announcement"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={sendMutation.isPending || !title.trim() || !body.trim()}
                className="w-full sm:w-auto min-w-[240px] h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send size={15} />
                <span>
                  {sendMutation.isPending
                    ? "Transmitting Broadcast..."
                    : "Send Broadcast to All Users"}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Broadcast History Table */}
      <section className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl shadow-xs border border-zinc-200/80 dark:border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Broadcast Dispatch Log
            </h3>
            <p className="text-xs text-zinc-500">
              Historical ledger of past transmissions, attached media, recipient counts, and delivery metrics.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <CustomInput
              placeholder="Search previous broadcasts..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              icon={Search}
            />
          </div>
        </div>

        {/* Table View */}
        {isHistoryLoading ? (
          <div className="py-16 text-center text-xs font-semibold text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading broadcast records...
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Radio className="h-8 w-8 mx-auto text-zinc-400" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No Broadcast Notifications Found
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchFilter
                ? `No records match "${searchFilter}". Try another keyword.`
                : "No broadcasts have been transmitted yet. Send your first broadcast above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Title & Message</th>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Push Tokens</th>
                  <th className="py-3 px-4">Dispatched By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
                {filteredBroadcasts.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const itemCreatedAt = new Date(item.createdAt).getTime();
                  const ageHours = (Date.now() - itemCreatedAt) / (1000 * 60 * 60);
                  const canDelete = ageHours <= 72;
                  const hoursLeft = Math.max(1, Math.round(72 - ageHours));

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-zinc-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {item.body}
                        </p>
                      </td>

                      {/* Attached Media preview column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {item.image && (
                            <button
                              type="button"
                              title="View banner image"
                              onClick={() =>
                                setPreviewMedia({
                                  type: "image",
                                  url: item.image!,
                                  title: item.title,
                                })
                              }
                              className="relative group h-8 w-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer shrink-0 bg-zinc-100 dark:bg-zinc-800"
                            >
                              <img
                                src={getMediaUrl(item.image)}
                                alt="thumbnail"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye size={12} />
                              </div>
                            </button>
                          )}
                          {item.video && (
                            <button
                              type="button"
                              title="Watch attached video"
                              onClick={() =>
                                setPreviewMedia({
                                  type: "video",
                                  url: item.video!,
                                  title: item.title,
                                })
                              }
                              className="h-8 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                            >
                              <Play size={11} className="fill-current" />
                              <span>Video</span>
                            </button>
                          )}
                          {!item.image && !item.video && (
                            <span className="text-zinc-400 text-xs font-normal">—</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                          {item.audience || "ALL"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-medium">
                        {item.serviceAreaName || "All Areas"}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                          {item.recipientCount}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">users</span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.deviceTokenCount}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">devices</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                        {item.sentBy?.name || "Admin"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setBroadcastToDelete({
                              id: item._id,
                              title: item.title,
                            })
                          }
                          className="h-8 px-2.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold gap-1.5 cursor-pointer transition-colors border border-rose-200/50 dark:border-rose-900/40 shadow-2xs"
                          title="Delete this broadcast"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-zinc-500">
              Showing page <strong className="text-zinc-800">{page}</strong> of{" "}
              <strong className="text-zinc-800">{pagination.totalPage}</strong> (Total{" "}
              {pagination.total} records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3 rounded-lg text-xs cursor-pointer"
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPage, p + 1))}
                disabled={page >= pagination.totalPage}
                className="h-8 px-3 rounded-lg text-xs cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Radio className="h-5 w-5 text-indigo-600" />
              Confirm Broadcast Transmission
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs pt-1 text-muted-foreground">
                <p>
                  You are about to broadcast this alert to:{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    All Platform Users
                  </strong>
                  {serviceAreaId ? " within the selected service area." : " across all territories."}
                </p>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 space-y-2">
                  <p className="font-bold text-xs">{title}</p>
                  <p className="text-xs text-zinc-500 line-clamp-3">{body}</p>

                  {(imagePreview || imageUrl) && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 max-h-36 bg-black/5 flex items-center justify-center">
                      <img
                        src={imagePreview || imageUrl}
                        alt="Banner Preview"
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                  )}

                  {(videoPreview || videoUrl) && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                      <Video className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        Video attached: {videoFile?.name || videoUrl}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ This will immediately send in-app notifications and Firebase push notifications with attached media to all matching active user devices.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendMutation.isPending} className="rounded-xl text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSend}
              disabled={sendMutation.isPending}
              className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              {sendMutation.isPending ? "Transmitting..." : "Yes, Broadcast to All Users"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Broadcast Confirmation Dialog */}
      <AlertDialog
        open={Boolean(broadcastToDelete)}
        onOpenChange={(open) => {
          if (!open) setBroadcastToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              Delete Broadcast Message?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs pt-1 text-muted-foreground">
                <p>
                  Are you sure you want to delete{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    &ldquo;{broadcastToDelete?.title}&rdquo;
                  </strong>
                  ?
                </p>
                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 space-y-1">
                  <p className="font-semibold text-rose-900 dark:text-rose-200">
                    Important Notice:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>This broadcast will be permanently removed from broadcast history.</li>
                    <li>It will immediately be deleted from all user inboxes across mobile and web.</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (broadcastToDelete?.id) {
                  deleteMutation.mutate(broadcastToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Broadcast"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Full Preview Dialog */}
      <Dialog open={Boolean(previewMedia)} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-2xl p-4 sm:p-6 rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {previewMedia?.type === "image" ? (
                <ImageIcon className="h-4 w-4 text-indigo-600" />
              ) : (
                <Video className="h-4 w-4 text-purple-600" />
              )}
              <span className="truncate">{previewMedia?.title || "Attached Media Preview"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
            {previewMedia?.type === "image" ? (
              <img
                src={getMediaUrl(previewMedia.url)}
                alt={previewMedia.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            ) : previewMedia?.type === "video" ? (
              <video
                src={getMediaUrl(previewMedia.url)}
                controls
                autoPlay
                className="w-full max-h-[70vh] bg-black"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
