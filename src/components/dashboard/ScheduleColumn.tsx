"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  color: "purple" | "teal" | "coral" | "amber" | "gray"
  repeat: boolean
  notes: string
  type: "focus" | "meeting" | "habit" | "free" | "other"
}

const COLOR_MAP = {
  purple: { bg: "#EEF0FB", color: "#3730A3", accent: "#6C63D4" },
  teal: { bg: "#E8F7F2", color: "#0F7A5A", accent: "#0F7A5A" },
  coral:  { bg: "#FDEEE9", color: "#B84020", accent: "#D97040" },
  amber:  { bg: "#FEF6E7", color: "#92580E", accent: "#D4900A" },
  gray:   { bg: "#F3F3F1", color: "#555450", accent: "#888780" },
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
}

export function ScheduleColumn() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])

  useEffect(() => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`

    async function load() {
      try {
        const res = await fetch("/api/schedule")
        if (res.ok) {
          const data = await res.json()
          const exRes = await fetch("/api/schedule-exceptions")
          const exData = exRes.ok ? await exRes.json() : { exceptions: {} }
          const exceptions: Record<string, string[]> = exData.exceptions || {}

          const todayEvents = (data.events || []).filter((ev: ScheduleEvent) => {
            if (exceptions[ev.id]?.includes(today)) return false
            return ev.repeat || true
          })
          setEvents(todayEvents.sort((a: ScheduleEvent, b: ScheduleEvent) => a.startTime.localeCompare(b.startTime)))
        } else {
          const stored = localStorage.getItem("ai-life-os-schedule")
          const parsed = stored ? JSON.parse(stored) : {}
          const todayEvents: ScheduleEvent[] = parsed[today] || []
          setEvents(todayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)))
        }
      } catch {
        const stored = localStorage.getItem("ai-life-os-schedule")
        const parsed = stored ? JSON.parse(stored) : {}
        const todayEvents: ScheduleEvent[] = parsed[today] || []
        setEvents(todayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)))
      }
    }

    load()
  }, [])

  const now = new Date()
  const nowStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
        <Clock size={13} className="text-brand-600" />
        <span className="text-xs font-medium text-gray-800">Today&apos;s schedule</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {events.length === 0 && (
          <p className="text-[10px] text-gray-400 text-center mt-4">No events today</p>
        )}
        {events.map((ev, i) => {
          const c = COLOR_MAP[ev.color]
          const isCurrent = nowStr >= ev.startTime && nowStr <= ev.endTime
          return (
            <div key={ev.id} className="flex gap-0 items-stretch min-h-[52px]">
              <div className="w-11 flex flex-col items-end pr-2 pt-0.5 flex-shrink-0">
                <span className="text-[9px] text-gray-400 leading-none whitespace-nowrap">
                  {formatTime(ev.startTime)}
                </span>
              </div>
              <div className="w-3.5 flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-0.5 border-2 border-white",
                    isCurrent && "animate-pulse"
                  )}
                  style={{ background: isCurrent ? "#534AB7" : c.accent }}
                />
                {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-0.5" />}
              </div>
              <div className="flex-1 pl-1.5 pb-2 pt-0.5 min-w-0">
                <div
                  className={cn(
                    "rounded-md px-2 py-1.5",
                    isCurrent && "ring-2 ring-brand-600 ring-offset-1"
                  )}
                  style={{ background: c.bg }}
                >
                  <p className="text-[10px] font-medium leading-tight flex items-center gap-1 flex-wrap"
                    style={{ color: c.color }}>
                    {ev.title}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full bg-brand-600 text-brand-100">
                        <span className="w-1 h-1 rounded-full bg-brand-200" />now
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] mt-0.5 opacity-80" style={{ color: c.accent }}>
                    {formatTime(ev.startTime)} – {formatTime(ev.endTime)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}