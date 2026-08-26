/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
// import { useGetSubscriptionPaymentUrlMutation } from "@/redux/service/subscription/subscriptionApi";
import { toast } from "sonner";
import { DriverNavbar } from "@/components/driver-navbar";

export default function SubscriptionPage() {
  // const [getPaymentUrl, { isLoading }] = useGetSubscriptionPaymentUrlMutation();
  const isLoading = false;

  const handlePurchase = async () => {
    toast.success("Purchase clicked (Mocked)");
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <DriverNavbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-24 md:pt-32">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Visual/Brand side */}
          <div className="space-y-6">
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
              Join the <br />
              Next Level.
            </h1>
            <p className="text-xl font-light text-gray-500 max-w-sm">
              Exclusive features, priority support, and premium benefits for
              professional drivers.
            </p>
            <div className="pt-8 flex gap-4">
              <div className="w-12 h-1 px-0 bg-black" />
              <p className="text-xs uppercase tracking-widest font-bold">
                Ekkali Premium
              </p>
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <CardHeader className="p-8 pb-4">
              <div className="bg-black text-white text-xs font-bold uppercase tracking-widest px-3 py-1 w-fit mb-4">
                Best Value
              </div>
              <CardTitle className="text-4xl font-black uppercase tracking-tight">
                Annual Plan
              </CardTitle>
              <CardDescription className="text-lg font-medium text-black">
                1 Year Subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black">$95.99</span>
                <span className="text-xl font-bold text-gray-400">/year</span>
              </div>

              {/* <ul className="space-y-4">
              {[
                "Priority Job Access",
                "Advanced Fleet Management",
                "Real-time Analytics",
                "24/7 Dedicated Support",
                "Premium Insurance Coverage"
              ].map((feature) => (
                <li key={feature} className="flex gap-3 items-center font-medium">
                  <div className="bg-black rounded-full p-1">
                     <Check className="w-3 h-3 text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul> */}
            </CardContent>
            <CardFooter className="p-8">
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full h-16 bg-black text-white hover:bg-gray-900 rounded-none text-xl font-black uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  "Purchase Now"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
