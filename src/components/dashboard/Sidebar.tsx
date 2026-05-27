"use client"
import { LayoutDashboard, Target, CheckSquare, Calendar, Mail, BarChart2, BookOpen, Smile, Settings, Clock, Utensils, Dumbbell, DollarSign, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"


const NAV_WORKSPACE = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/",        page: "dashboard" },
  { icon: CheckSquare,     label: "Tasks",      href: "/tasks",   page: "tasks" },
  { icon: Clock,           label: "Schedule",   href: "/schedule",page: "schedule" },
  { icon: Utensils,        label: "Meal",       href: "/meal",    page: "meal" },
  { icon: Dumbbell,        label: "Workout",    href: "/workout", page: "workout" },
  { icon: StickyNote,      label: "Notes",      href: "/notes",   page: "notes" },
]

const NAV_AGENTS = [
  { icon: Mail,      label: "Email",     href: "/Email" },
  { icon: BarChart2, label: "Habits",    href: "/habits" },
  { icon: BookOpen,  label: "Knowledge", href: "/knowledge" },
  { icon: Smile,     label: "Reflection",href: "/Reflection" },
  { icon: Target,  label: "Goals", href: "/Goals" },

]

interface Props { activePage?: string }

export function Sidebar({ activePage = "dashboard" }: Props) {
  const { data: session } = useSession()
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


      {/* User */}
      {/* User / Auth */}
<div className="px-4 pt-2 flex mt-auto mb-3 items-center gap-2" style={{ borderTop: "0.5px solid #2C2850" }}>
  {session ? (
    <>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}>
        {session.user?.name?.charAt(0) || "K"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white leading-tight truncate">{session.user?.name}</p>
        <button onClick={() => signOut()} className="text-[10px]" style={{ color: "#7A7A9A" }}>
          Sign out
        </button>
      </div>
    </>
  ) : (
    <>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0"
        style={{ background: "#2C2850" }}>
        ?
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight" style={{ color: "#9B99C4" }}>Not signed in</p>
        <button onClick={() => signIn("google")} className="text-[10px]" style={{ color: "#7F77DD" }}>
          Sign in
        </button>
      </div>
    </>
  )}
</div>
    </aside>
  )
}