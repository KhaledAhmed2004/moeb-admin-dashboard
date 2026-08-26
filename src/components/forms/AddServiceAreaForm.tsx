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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add service area");
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
          Fill in the details to add a new service area. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="areaName">Area Name</Label>
          <Input
            id="areaName"
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
          <Label htmlFor="city">Cities (comma separated)</Label>
          <Input
            id="city"
            {...register("city", {
              required: "At least one city is required",
            })}
            placeholder="e.g. Dhaka, Chittagong"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>
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
