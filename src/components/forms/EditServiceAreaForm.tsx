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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          Make changes to the service area here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor={`name-${defaultValues?._id}`}>Area Name</Label>
          <Input
            id={`name-${defaultValues?._id}`}
            {...register("areaName", {
              required: "Area name is required",
            })}
            placeholder="Add Area name"
          />
          {errors.areaName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.areaName.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`city-${defaultValues?._id}`}>Cities (comma separated)</Label>
          <Input
            id={`city-${defaultValues?._id}`}
            {...register("city", {
              required: "At least one city is required",
            })}
            placeholder="e.g. Dhaka, Chittagong"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`status-${defaultValues?._id}`}>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id={`status-${defaultValues?._id}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending || isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
