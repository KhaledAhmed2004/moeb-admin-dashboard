"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DriverNavbar } from "@/components/driver-navbar";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <DriverNavbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-24 md:pt-32">
        <div className="max-w-md w-full">
          <div className="border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white p-8 md:p-12 text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-black p-4 inline-block">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
                Payment <br /> Successful
              </h1>
              <p className="text-lg font-medium text-gray-600">
                Your subscription has been activated. Thank you for choosing Ekkali Premium.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/chauffeur" passHref>
                <Button className="w-full h-16 bg-black text-white hover:bg-gray-900 rounded-none text-xl font-black uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex justify-center gap-4 pt-4">
              <div className="w-12 h-1 bg-black" />
              <p className="text-xs uppercase tracking-widest font-bold">
                Ekkali Premium
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
