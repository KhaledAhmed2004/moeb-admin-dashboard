"use client";

import React, { useState } from "react";
import { CustomModal } from "@/components/shared/CustomModal";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomTextarea } from "@/components/shared/CustomTextarea";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { toast } from "sonner";
import { FileText, DollarSign, Calendar, Building, Tag } from "lucide-react";

export interface NewDealPayload {
  id: string;
  title: string;
  partner: string;
  partnerInit: string;
  partnerBg: string;
  dealType: string;
  typeBg: string;
  status: string;
  value: string;
  start: string;
  end: string;
  iconBg: string;
  img?: string;
  description?: string;
}

export interface AddDealModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDeal: (newDeal: NewDealPayload) => void;
}

export function AddDealModal({
  isOpen,
  onOpenChange,
  onAddDeal,
}: AddDealModalProps) {
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState("");
  const [dealType, setDealType] = useState("Partnership");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Active");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Deal title is required";
    if (!partner.trim()) errs.partner = "Partner name is required";
    if (!value.trim()) errs.value = "Deal value is required";
    if (!start) errs.start = "Start date is required";
    if (!end) errs.end = "End date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    setTitle("");
    setPartner("");
    setDealType("Partnership");
    setValue("");
    setStatus("Active");
    setStart("");
    setEnd("");
    setCoverImage("");
    setDescription("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const partnerInitials = partner
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "DP";

      const formattedValue = value.startsWith("$") ? value : `$${value}`;

      const newDeal: NewDealPayload = {
        id: `DL-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        partner,
        partnerInit: partnerInitials,
        partnerBg: "bg-indigo-600 text-white",
        dealType,
        typeBg:
          dealType === "Partnership"
            ? "bg-purple-100 text-purple-700"
            : dealType === "Campaign"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700",
        status,
        value: formattedValue,
        start,
        end,
        iconBg: "bg-purple-100 text-purple-600",
        img: coverImage,
        description,
      };

      onAddDeal(newDeal);
      toast.success("New Deal created successfully!");
      setIsSubmitting(false);
      handleReset();
      onOpenChange(false);
    }, 400);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add New Deal"
      description="Create and publish a new partnership, campaign, or service deal."
      size="xl"
      submitLabel="Create Deal"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Image Upload */}
        <FormFieldWrapper label="Deal Cover Banner (Optional)">
          <ImageUploader value={coverImage} onChange={setCoverImage} />
        </FormFieldWrapper>

        {/* Title & Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormFieldWrapper label="Deal Title" required error={errors.title}>
            <CustomInput
              icon={FileText}
              placeholder="e.g. Corporate Partnership Program"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Partner Name" required error={errors.partner}>
            <CustomInput
              icon={Building}
              placeholder="e.g. Blue Logistics Ltd."
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              error={!!errors.partner}
            />
          </FormFieldWrapper>
        </div>

        {/* Type, Value, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormFieldWrapper label="Deal Type" required>
            <CustomSelect
              options={[
                { label: "Partnership", value: "Partnership" },
                { label: "Campaign", value: "Campaign" },
                { label: "Service", value: "Service" },
              ]}
              value={dealType}
              onChange={setDealType}
              className="w-full"
              triggerClassName="w-full"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Deal Value ($)" required error={errors.value}>
            <CustomInput
              icon={DollarSign}
              placeholder="e.g. 25,000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={!!errors.value}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Status" required>
            <CustomSelect
              options={[
                { label: "Active", value: "Active" },
                { label: "Pending", value: "Pending" },
                { label: "Completed", value: "Completed" },
                { label: "Cancelled", value: "Cancelled" },
              ]}
              value={status}
              onChange={setStatus}
              className="w-full"
              triggerClassName="w-full"
            />
          </FormFieldWrapper>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormFieldWrapper label="Start Date" required error={errors.start}>
            <CustomInput
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              error={!!errors.start}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="End Date" required error={errors.end}>
            <CustomInput
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              error={!!errors.end}
            />
          </FormFieldWrapper>
        </div>

        {/* Description / Notes */}
        <FormFieldWrapper label="Description / Terms (Optional)">
          <CustomTextarea
            placeholder="Add additional terms, agreement details, or internal notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
          />
        </FormFieldWrapper>
      </form>
    </CustomModal>
  );
}
