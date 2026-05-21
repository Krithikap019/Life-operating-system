"use client"

import { LayoutDashboard, Target, CheckSquare, Calendar, Mail, BarChart2, BookOpen, Smile, Settings, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const NAV_WORKSPACE = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/",        page: "dashboard" },
  { icon: CheckSquare,     label: "Tasks",      href: "/tasks",   page: "tasks" },
  { icon: Clock,           label: "Schedule",      href: "/Schedule",   page: "schedule" },
  { icon: Target,          label: "Goals",      href: "/goals",   page: "goals" },
  { icon: Calendar,        label: "Calendar",   href: "/calendar",page: "calendar" },
]

const NAV_AGENTS = [
  { icon: Mail,      label: "Email",     href: "/" },
  { icon: BarChart2, label: "Habits",    href: "/" },
  { icon: BookOpen,  label: "Knowledge", href: "/" },
  { icon: Smile,     label: "Reflection",href: "/" },
]

interface Props { activePage?: string }

export function Sidebar({ activePage = "dashboard" }: Props) {
  return (
    <aside className="w-56 flex flex-col py-4 flex-shrink-0" style={{ background: "#1A1535" }}>
      {/* Logo */}
      <div className="px-4 pb-5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}>
          AI
        </div>
        <span className="text-sm font-medium text-white">Life OS</span>
      </div>

      {/* Workspace */}
      <p className="px-4 mb-1.5 text-[10px] uppercase tracking-widest font-medium" style={{ color: "#5F5E8A" }}>
        Main
      </p>
      {NAV_WORKSPACE.map(({ icon: Icon, label, href, page }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            "flex items-center gap-2 py-2 text-sm w-full text-left transition-colors",
            activePage === page
              ? "text-white rounded-lg mx-2 px-3 font-medium"
              : "px-4 hover:text-purple-200"
          )}
          style={
            activePage === page
              ? { background: "linear-gradient(90deg,#534AB7,#7F77DD)", width: "calc(100% - 16px)" }
              : { color: "#9B99C4" }
          }
        >
          <Icon size={15} />
          {label}
        </Link>
      ))}

      <div className="my-2 mx-4" style={{ borderTop: "0.5px solid #2C2850" }} />

      {/* Agents */}
      <p className="px-4 mb-1.5 text-[10px] uppercase tracking-widest font-medium" style={{ color: "#5F5E8A" }}>
        AI Agents
      </p>
      {NAV_AGENTS.map(({ icon: Icon, label, href }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition-colors hover:text-purple-200"
          style={{ color: "#9B99C4" }}
        >
          <Icon size={15} />
          {label}
        </Link>
      ))}

      <div className="my-2 mx-4" style={{ borderTop: "0.5px solid #2C2850" }} />

      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:text-purple-200"
        style={{ color: "#9B99C4" }}
      >
        <Settings size={14} />
        Settings
      </Link>

      {/* Focus Mode Card */}
      <div className="mx-3 mt-auto mb-3 rounded-xl p-3" style={{ background: "#2C2850" }}>
        <p className="text-[10px] mb-1" style={{ color: "#9B99C4" }}>AI Focus Mode</p>
        <p className="text-sm font-medium text-white">Deep Work</p>
        <p className="text-[10px] mt-0.5" style={{ color: "#7F77DD" }}>Ends in 45:00</p>
      </div>

      {/* User */}
      <div className="px-4 pt-2 flex items-center gap-2" style={{ borderTop: "0.5px solid #2C2850" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}>
          KR
        </div>
        <div>
          <p className="text-sm font-medium text-white leading-tight">Krithika</p>
          <p className="text-[10px]" style={{ color: "#7A7A9A" }}>Pro plan</p>
        </div>
      </div>
    </aside>
  )
}