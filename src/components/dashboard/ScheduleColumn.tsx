import { mockSchedule } from "@/lib/data"
import { Clock } from "lucide-react"

export function ScheduleColumn() {
  return (
    <aside className="w-44 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
        <Clock size={13} className="text-brand-600" />
        <span className="text-xs font-medium text-gray-800">Today&apos;s schedule</span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {mockSchedule.map((item, i) => (
          <div key={i} className="flex gap-0 items-stretch min-h-[52px]">
            {/* Time */}
            <div className="w-9 flex flex-col items-end pr-2 pt-0.5 flex-shrink-0">
              <span className="text-[9px] text-gray-400 leading-none whitespace-nowrap">{item.time}</span>
            </div>

            {/* Line + dot */}
            <div className="w-3.5 flex flex-col items-center flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5 border-2 border-white"
                style={{
                  background: item.type === "free"
                    ? "#B4B2A9"
                    : (item as { bg: string; color: string; accent: string; meta: string; current?: boolean }).accent || "#534AB7",
                }}
              />
              {i < mockSchedule.length - 1 && (
                <div className="w-px flex-1 bg-gray-100 mt-0.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pl-1.5 pb-2 pt-0.5 min-w-0">
              {item.type === "free" ? (
                <p className="text-[9px] text-gray-400 italic">{item.label}</p>
              ) : (
                <div
                  className="rounded-md px-2 py-1.5"
                  style={{ background: (item as { bg: string }).bg }}
                >
                  <p className="text-[10px] font-medium leading-tight flex items-center gap-1 flex-wrap" style={{ color: (item as { color: string }).color }}>
                    {item.label}
                    {(item as { current?: boolean }).current && (
                      <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full bg-brand-600 text-brand-100 ml-1">
                        <span className="w-1 h-1 rounded-full bg-brand-200" />
                        now
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] mt-0.5 opacity-80" style={{ color: (item as { accent: string }).accent }}>
                    {(item as { meta: string }).meta}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
