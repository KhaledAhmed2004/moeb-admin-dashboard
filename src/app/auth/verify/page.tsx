"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(otp);
    // Mock verification success
    setIsVerified(true);
    setIsSubmitting(false);
  };

  const handleResend = () => {
    if (cooldownSeconds > 0) return;

    // Simulate sending OTP
    setResendCount((prev) => prev + 1);
    setCooldownSeconds(120); // 2 minutes cooldown
    setOtp("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isVerified) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <div className="text-3xl">✓</div>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Verified!</h2>
          <p className="mb-6 text-muted-foreground">
            Your email has been successfully verified.
          </p>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-card p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-medium text-foreground">
            Verify your email
          </h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a 6-digit code to your email address
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-5">
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPSlot
                className="border rounded-sm w-16 h-16 text-xl mr-4"
                index={0}
              />
              <InputOTPSlot
                className="border rounded-sm w-16 h-16 text-xl mr-4"
                index={1}
              />
              <InputOTPSlot
                className="border rounded-sm w-16 h-16 text-xl mr-4"
                index={2}
              />
              <InputOTPSlot
                className="border rounded-sm w-16 h-16 text-xl"
                index={3}
              />
            </InputOTP>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              disabled={otp.length !== 4 || isSubmitting}
              className="w-10/12 text-xl py-6"
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
          </div>
        </form>

        {/* Resend Section */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 text-center text-sm text-muted-foreground">
            {resendCount === 0
              ? "Didn't receive the code?"
              : `Resend attempt ${resendCount}`}
          </p>

          <Button
            onClick={handleResend}
            disabled={cooldownSeconds > 0}
            variant="outline"
            className="w-full"
          >
            {cooldownSeconds > 0 ? (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Resend in {formatTime(cooldownSeconds)}
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        {/* Info Text */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Code expires in 5 minutes
        </p>
      </div>
    </div>
  );
}
