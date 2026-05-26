"use client"

import { Sparkles, Wrench, Clock3 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default function ComingSoonPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      
      <Sidebar activePage="Goals" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
            <Sparkles size={24} className="text-brand-600" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-brand-600 tracking-wide uppercase">
              Work in progress
            </p>

            <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
              This space is still being crafted.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed">
              We’re currently designing and building this experience.
              New features, workflows, and AI tools are on the way.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100">
                <Wrench size={16} className="text-gray-600" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Actively under development
                </p>

                <p className="text-xs text-gray-500">
                  UI, automations, and integrations are being added.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100">
                <Clock3 size={16} className="text-gray-600" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Available soon
                </p>

                <p className="text-xs text-gray-500">
                  Check back shortly for updates and new functionality.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  )
}