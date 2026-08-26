"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
// import { useCreateDealsMutation } from "@/redux/service/deals/dealsApi";

type DealsFormData = {
  title: string;
  description: string;
  tags: string[];
  promoCode: string;
  expireDate: string;
};

export function AddDealsForm({
  onOpenChange,
}: {
  onOpenChange: (val: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<DealsFormData>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      promoCode: "",
      expireDate: "",
    },
  });

  const tags = watch("tags");
  const [inputValue, setInputValue] = useState("");

  // const [createDeals, { isLoading }] = useCreateDealsMutation();

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setValue("tags", [...tags, tag.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const onSubmit = (data: DealsFormData) => {
    toast.success("Deal created successfully! (Mocked)");
    reset();
    onOpenChange(false);
  };

  return (
    <>
      <div>
        <h3 className="text-3xl font-medium">Create Deals</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto mt-8">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Title <span className="text-black">*</span>
          </label>
          <input
            {...register("title", { required: "Title is required" })}
            type="text"
            placeholder="e.g. 20% Off Premium Car Wash"
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Short Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Short Description <span className="text-black">*</span>
          </label>
          <textarea
            {...register("description", {
              required: "Short Description is required",
            })}
            placeholder="Special rate for Elite Network members on commercial insurance"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Tags <span className="text-black">*</span>
          </label>

          {/* Tag Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Type a tag and press Enter or select from suggestions"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(inputValue);
                }
              }}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.tags && (
            <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* Promo Code */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Promo Code <span className="text-black">*</span>
          </label>
          <input
            {...register("promoCode", { required: "Promo Code is required" })}
            type="text"
            placeholder="ELITE20"
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          />
          {errors.promoCode && (
            <p className="text-red-500 text-xs mt-1">
              {errors.promoCode.message}
            </p>
          )}
        </div>

        {/* Expires Date */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-black mb-3">
            Expires Date <span className="text-black">*</span>
          </label>
          <input
            {...register("expireDate", {
              required: "Expires Date is required",
            })}
            type="date"
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          />
          {errors.expireDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.expireDate.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-black text-white font-semibold rounded-full hover:bg-gray-900 transition-all duration-200 text-center"
        >
          Create Deals
        </button>
      </form>
    </>
  );
}
