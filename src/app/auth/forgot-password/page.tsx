"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    console.log("Forgot password submitted:", data);
    if (data) {
      router.push("/verify");
    }
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
          Forgot Password
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enter your email for the verification proccess,we will send 4 digits
          code to your email.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-normal text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type="email"
              placeholder="john@gmail.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          className="w-full bg-light-black py-6 rounded-lg text-lg font-semibold text-white  transition-colors"
        >
          Send
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="text-center mt-6">
        <p className="text-muted-foreground text-sm">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 uppercase font-normal hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
