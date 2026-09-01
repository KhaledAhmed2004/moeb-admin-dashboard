"use client";

import React, { useState } from "react";
import { CustomModal } from "@/components/shared/CustomModal";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTextarea } from "@/components/shared/CustomTextarea";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { toast } from "sonner";
import { Package, DollarSign, MapPin, Tag } from "lucide-react";
import api from "@/lib/axios";
import { CreateItemPayload } from "./types";

export interface AddItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddItemModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"New" | "Used" | "Refurbished">("New");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Item title is required";
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      errs.price = "Valid price (>= 0) is required";
    }
    if (!location.trim()) errs.location = "Pickup depot or location is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    setTitle("");
    setPrice("");
    setCondition("New");
    setLocation("");
    setImage("");
    setDescription("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload: CreateItemPayload = {
      title: title.trim(),
      price: Number(price),
      condition,
      location: location.trim(),
      description: description.trim() || undefined,
      photos: image ? [image] : [],
    };

    try {
      try {
        await api.post("/items", payload);
      } catch (err: unknown) {
        // Fallback to /api/v1/items if endpoint is prefixed
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          await api.post("/api/v1/items", payload);
        } else {
          throw err;
        }
      }

      toast.success("New item listed successfully!");
      setIsSubmitting(false);
      handleReset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosErr.response?.data?.message || "Failed to create item. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onOpenChange(open);
      }}
      title="Add New Marketplace Listing"
      description="Fill in item details, price, condition, and location to create a new marketplace item."
      size="xl"
      submitLabel="Create Listing"
      cancelLabel="Cancel"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper label="Item Title" required error={errors.title}>
            <CustomInput
              icon={Package}
              placeholder="e.g. Executive Leather Seat Covers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-rose-500" : ""}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Price ($)" required error={errors.price}>
            <CustomInput
              icon={DollarSign}
              type="number"
              placeholder="e.g. 150"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={errors.price ? "border-rose-500" : ""}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Condition Grade">
            <CustomSelect
              options={[
                { label: "New", value: "New" },
                { label: "Used", value: "Used" },
                { label: "Refurbished", value: "Refurbished" },
              ]}
              value={condition}
              onChange={(val) => setCondition(val as "New" | "Used" | "Refurbished")}
              placeholder="Select Condition"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Depot / Location" required error={errors.location}>
            <CustomInput
              icon={MapPin}
              placeholder="e.g. Downtown Hub, Depot A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={errors.location ? "border-rose-500" : ""}
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper label="Product Photo">
          <ImageUploader
            value={image}
            onChange={setImage}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label="Item Description & Notes">
          <CustomTextarea
            placeholder="Enter product specifications, compatibility notes, or item condition details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </FormFieldWrapper>
      </form>
    </CustomModal>
  );
}
