"use client";

import { useForm } from "react-hook-form";

interface ConductFormData {
  titleName: string;
  details: string;
}

export default function TermsAndConditionForm() {
  const { register, handleSubmit } = useForm<ConductFormData>({
    defaultValues: {
      titleName: "",
      details: "",
    },
  });

  const onSubmit = (data: ConductFormData) => {
    console.log("Form Data:", data);
    // Handle form submission here
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Driver Code of Conduct & Service Standards
        </h1>
        <p className="text-sm text-gray-600">
          We work to build a safe and simple platform where users can enjoy
          services with confidence. Your satisfaction is our top priority.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Title Name
          </label>
          <input
            type="text"
            placeholder="Type here.."
            {...register("titleName")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>

        {/* Details Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Details
          </label>
          <textarea
            placeholder="Type here.."
            {...register("details")}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-3 rounded-md hover:bg-gray-900 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}
