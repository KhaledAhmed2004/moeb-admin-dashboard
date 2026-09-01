/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/shared/CustomInput";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { MapPin, Globe } from "lucide-react";

interface AddServiceAreaFormInputs {
  areaName: string;
  city: string;
  status: string;
}

export function EditServiceAreaForm({ defaultValues, setOpen }: any) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddServiceAreaFormInputs>({
    mode: "onBlur",
    defaultValues: {
      areaName: defaultValues?.areaName || "",
      city: defaultValues?.city || "",
      status: defaultValues?.status || "ACTIVE",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { areaName: string; cities: string[]; status: string }) => {
      const response = await api.patch(`/service-areas/${defaultValues?._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service area updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update service area");
    },
  });

  const onSubmit = (data: AddServiceAreaFormInputs) => {
    const citiesArray = data.city
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    mutate({
      areaName: data.areaName,
      cities: citiesArray,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Edit Service Area</DialogTitle>
        <DialogDescription>
          Make changes to the service area here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <FormFieldWrapper
          label="Area Name"
          htmlFor={`name-${defaultValues?._id}`}
          required
          error={errors.areaName?.message}
        >
          <CustomInput
            id={`name-${defaultValues?._id}`}
            icon={MapPin}
            {...register("areaName", {
              required: "Area name is required",
            })}
            placeholder="Add Area name"
            error={!!errors.areaName}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Cities (comma separated)"
          htmlFor={`city-${defaultValues?._id}`}
          required
          error={errors.city?.message}
        >
          <CustomInput
            id={`city-${defaultValues?._id}`}
            icon={Globe}
            {...register("city", {
              required: "At least one city is required",
            })}
            placeholder="e.g. Dhaka, Chittagong"
            error={!!errors.city}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label="Status" htmlFor={`status-${defaultValues?._id}`} required>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <CustomSelect
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select status"
                className="w-full"
                triggerClassName="w-full"
              />
            )}
          />
        </FormFieldWrapper>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending || isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
