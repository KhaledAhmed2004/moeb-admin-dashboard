"use client";

import { 
  Mail, MessageSquare, Phone, ChevronRight, 
  Ticket, Briefcase, Clock, CheckSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SupportCenterPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">We&apos;re here to help! Reach out to our support team or monitor support tickets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contact Support Card */}
        <Card className="border-0 shadow-sm bg-white rounded-xl p-6 ring-1 ring-black/5 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-1">Contact Support</h3>
          <p className="text-[13px] text-gray-500 font-medium mb-6">Can&apos;t find what you&apos;re looking for? Send us a message.</p>

          <div className="flex flex-col gap-0 border border-gray-100 rounded-xl overflow-hidden">
            
            {/* Email Support */}
            <button className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <Mail size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 mb-0.5">Email Support</p>
                  <p className="text-xs text-gray-500 font-medium">support@ekkali.com</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            {/* Live Chat */}
            <button className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <MessageSquare size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 mb-0.5">Live Chat</p>
                  <p className="text-xs text-gray-500 font-medium">Chat with our team</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-100 text-green-700">Available</span>
            </button>

            {/* Call Us */}
            <button className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <Phone size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 mb-0.5">Call Us</p>
                  <p className="text-xs text-gray-500 font-medium">+1 234 567 8901</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-500">Mon - Fri, 9AM - 6PM</span>
            </button>

          </div>
        </Card>

        {/* Support Ticket Overview Card */}
        <Card className="border-0 shadow-sm bg-white rounded-xl p-6 ring-1 ring-black/5 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-6">Support Ticket Overview</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* Total Tickets */}
            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Ticket size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Tickets</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">248</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-1">All time</p>
              </div>
            </div>

            {/* Open Tickets */}
            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="p-2.5 bg-orange-50 text-orange-500 rounded-lg shrink-0">
                <Briefcase size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Open Tickets</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">32</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-1">Currently open</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-lg shrink-0">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">In Progress</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">18</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-1">In progress</p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <div className="p-2.5 bg-green-50 text-green-500 rounded-lg shrink-0">
                <CheckSquare size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Resolved</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">198</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-1">All resolved</p>
              </div>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
