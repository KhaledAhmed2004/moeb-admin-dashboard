"use client";

import React, { useState, useEffect } from "react";
import { CustomModal } from "@/components/shared/CustomModal";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTextarea } from "@/components/shared/CustomTextarea";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { toast } from "sonner";
import { Package, DollarSign, MapPin } from "lucide-react";
import api from "@/lib/axios";
import { ItemEntity, UpdateItemPayload } from "./types";

export interface EditItemModalProps {
  item: ItemEntity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditItemModal({
  item,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditItemModalProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"New" | "Used" | "Refurbished">("New");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setPrice(item.price !== undefined ? String(item.price) : "");
      setCondition((item.condition as "New" | "Used" | "Refurbished") || "New");
      setLocation(item.location || "");
      setImage(item.photos?.[0] || "");
      setDescription(item.description || "");
      setErrors({});
    }
  }, [item]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!validate()) return;

    setIsSubmitting(true);

    const payload: UpdateItemPayload = {
      title: title.trim(),
      price: Number(price),
      condition,
      location: location.trim(),
      description: description.trim() || undefined,
      photos: image ? [image] : [],
    };

    try {
      try {
        await api.patch(`/items/${item._id}`, payload);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          await api.patch(`/api/v1/items/${item._id}`, payload);
        } else {
          throw err;
        }
      }

      toast.success("Item updated successfully!");
      setIsSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosErr.response?.data?.message || "Failed to update item. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Marketplace Listing"
      description="Update product specifications, price, or location."
      size="xl"
      submitLabel="Save Changes"
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
