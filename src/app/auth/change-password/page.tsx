"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import logo from "@/assets/logo.png";
import Image from "next/image";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: ChangePasswordForm) => {
    console.log("Change password submitted:", data);
  };

  return (
    <div className="w-full max-w-md px-8">
      {/* logo */}
      <div className="flex items-center justify-center mb-5">
        <Image
          src={logo}
          width={300}
          height={300}
          className="w-60"
          alt="logo"
        />
      </div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-normal text-foreground mb-4">
          Change Password
        </h1>
        <p className="text-foreground/60 text-sm leading-relaxed">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password Field */}
        <div>
          <label className="block text-sm font-normal text-foreground mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="enter your current password"
              {...register("currentPassword", {
                required: "Current password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:text-foreground/60"
            >
              {showCurrentPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label className="block text-sm font-normal text-foreground mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="enter your new password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: (value) =>
                  value !== watch("currentPassword") ||
                  "New password must be different from current password",
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:text-foreground/60"
            >
              {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-normal text-foreground mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="confirm your new password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:text-foreground/60"
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Update Button */}
        <Button
          type="submit"
          className="w-full  text-white bg-light-black"
          size="lg"
        >
          Update Password
        </Button>
      </form>

      {/* Back Link */}
      <div className="text-center mt-6">
        <Link href="/auth/login" className="text-blue-500 group text-sm font-normal">
          <span className="text-light-black ">Back to</span>{" "}
          <span className="underline group-hover:no-underline">LOG IN</span>
        </Link>
      </div>
    </div>
  );
}
