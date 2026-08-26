"use client";

import { 
  Bold, Italic, Underline, Link2, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Undo, Redo, Save, X 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermsAndConditionPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage and update platform terms of service</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-gray-600 hover:text-gray-900 font-semibold h-10 px-5 border-gray-200">
            <X className="w-4 h-4 mr-2" />
            Discard Changes
          </Button>
          <Button className="bg-primary hover:bg-purple-700 text-white font-semibold h-10 px-5 shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 overflow-hidden flex flex-col">
        {/* Editor Toolbar (Mock) */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-100 bg-gray-50/50 flex-wrap">
          <select className="h-8 rounded-md border border-gray-200 bg-white text-sm font-medium px-2 outline-none text-gray-700 w-[120px]">
            <option>Heading 1</option>
            <option>Heading 2</option>
            <option>Heading 3</option>
            <option selected>Paragraph</option>
          </select>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Bold size={16} /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Italic size={16} /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Underline size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Link2 size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors bg-gray-200"><AlignLeft size={16} /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><AlignCenter size={16} /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><AlignRight size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><List size={16} /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><ListOrdered size={16} /></button>
          <div className="flex-1" />
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Undo size={16} /></button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"><Redo size={16} /></button>
        </div>

        {/* Content Area */}
        <CardContent className="p-8 lg:p-12 min-h-[500px]">
          <div className="prose prose-gray max-w-none outline-none" contentEditable suppressContentEditableWarning>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
            
            <p className="text-sm text-gray-500 mb-8 font-medium">Last Updated: August 12, 2026</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              As a user of our platform, you agree to the following obligations:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must not use the platform for any illegal or unauthorized purpose.</li>
              <li>You agree to comply with all local, state, national, and international laws and regulations.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Privacy and Data Protection</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Your privacy is extremely important to us. Our Privacy Policy explains how we collect, use, protect, and when we share personal information and other data with third parties. By using the Service, you consent to our collection and use of personal data as outlined therein.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Modifications to Service</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We reserve the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
            </p>

            <p className="text-gray-600 leading-relaxed mt-12 pt-8 border-t border-gray-100">
              If you have any questions regarding these Terms and Conditions, please contact our support team at <a href="#" className="text-primary hover:underline">support@ekkali.com</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
