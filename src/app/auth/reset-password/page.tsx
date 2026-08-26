"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import logo from "@/assets/logo.png";
import Image from "next/image";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: ResetPasswordForm) => {
    console.log("Password reset:", data);
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
          New Password
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Set the new password for your account so you can login and access all
          featuress.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              placeholder="enter your password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: "var(--input)" }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-70"
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
              placeholder="enter your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: "var(--input)" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-70"
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

        {/* Confirm Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold bg-light-black text-white transition-opacity hover:opacity-90"
        >
          Update Password
        </button>
      </form>

      {/* Back to Login Link */}
      <div className="text-center mt-6">
        <Link href="/auth/login" className="text-blue-500 group text-sm font-normal">
          <span className="text-light-black ">Back to</span>{" "}
          <span className="underline group-hover:no-underline">LOG IN</span>
        </Link>
      </div>
    </div>
  );
}
