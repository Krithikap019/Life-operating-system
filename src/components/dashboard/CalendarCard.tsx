import { mockCalendar } from "@/lib/data"
import { cn } from "@/lib/utils"

const BADGE: Record<string, string> = {
  purple: "bg-brand-50 text-brand-600",
  teal:   "bg-teal-50 text-teal-600",
  amber:  "bg-amber2-50 text-amber2-600",
  coral:  "bg-coral-50 text-coral-600",
  gray:   "bg-gray-100 text-gray-500",
}

export function CalendarCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
          <span className="text-brand-600">📅</span> Today&apos;s calendar
        </p>
        <button className="text-[10px] text-brand-600 hover:text-brand-800 transition-colors">Open calendar</button>
      </div>
      <div className="flex flex-col gap-2">
        {mockCalendar.map((ev) => (
          <div key={ev.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-[11px] text-gray-500 w-14 flex-shrink-0">{ev.time}</span>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.dotColor }} />
            <span className="text-[12px] font-medium text-gray-800 flex-1 min-w-0 truncate">{ev.label}</span>
            <span className={cn("text-[10px] px-2.5 py-1 rounded-full flex-shrink-0", BADGE[ev.badgeStyle] || BADGE.gray)}>
              {ev.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
