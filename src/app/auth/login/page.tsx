"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader, Lock, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import logo from "@/assets/logo.png";
import { useLogin } from "@/hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "admin@example.com",
      password: "strong_password_here",
    },
  });

  const { mutate: login, isPending: isLoading } = useLogin();

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black">
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-xl w-full flex flex-col items-center text-center mx-auto">
          <Image 
            src="/new-logo.png" 
            alt="logo" 
            width={300} 
            height={300} 
            className="w-72 h-auto object-contain drop-shadow-md mb-2" 
          />
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight w-full">
            Centralized Admin <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Control Center.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
            Welcome to the Moeb admin dashboard. Oversee operations, manage users, and monitor platform activity seamlessly.
          </p>
        </div>

        <div className="absolute bottom-12 w-full text-center z-10">
          <p className="text-zinc-500 text-sm font-medium">© {new Date().getFullYear()} Moeb Dashboard. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <Image src="/new-logo.png" alt="logo" width={120} height={120} className="w-28 h-auto object-contain" />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded border-input text-primary focus:ring-primary h-4 w-4 accent-primary" />
                <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">Remember me</label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-primary text-sm font-medium hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full py-6 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all text-base group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>
          

        </div>
      </div>
    </div>
  );
}
