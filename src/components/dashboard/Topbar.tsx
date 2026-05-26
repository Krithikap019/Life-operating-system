"use client"

import { useSession } from "next-auth/react"
import { Bell, Search } from "lucide-react"

export function Topbar() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(" ")[0] ?? ""

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  return (
    <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
      <p className="text-base font-medium text-gray-800">{greeting}{firstName ? `, ${firstName}` : ""} 👋</p>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
          {today}
        </span>
        <button className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell size={14} />
        </button>
        <button className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Search size={14} />
        </button>
      </div>
    </header>
  )
}