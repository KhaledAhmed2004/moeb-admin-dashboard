"use client";

import { useForm } from "react-hook-form";
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
import { MapPin, Globe } from "lucide-react";
import { AxiosError } from "axios";

interface AddServiceAreaFormInputs {
  areaName: string;
  city: string;
}

export function AddServiceAreaForm({
  setOpen,
}: {
  setOpen: (val: boolean) => void;
}) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddServiceAreaFormInputs>({
    mode: "onBlur",
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { areaName: string; cities: string[] }) => {
      const response = await api.post("/service-areas", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service area added successfully!");
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
      reset();
      setOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add service area");
    },
  });

  const onSubmit = (data: { areaName: string; city: string }) => {
    const citiesArray = data.city
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    mutate({
      areaName: data.areaName,
      cities: citiesArray,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Add Service Area</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new service area. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <FormFieldWrapper label="Area Name" htmlFor="areaName" required error={errors.areaName?.message}>
          <CustomInput
            id="areaName"
            icon={MapPin}
            {...register("areaName", {
              required: "Area name is required",
            })}
            placeholder="Add Area name"
            error={!!errors.areaName}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label="Cities (comma separated)" htmlFor="city" required error={errors.city?.message}>
          <CustomInput
            id="city"
            icon={Globe}
            {...register("city", {
              required: "At least one city is required",
            })}
            placeholder="e.g. Dhaka, Chittagong"
            error={!!errors.city}
          />
        </FormFieldWrapper>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending || isSubmitting ? "Adding..." : "Add Service Area"}
        </Button>
      </DialogFooter>
    </form>
  );
}
