"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Plus, Sparkles, Repeat, Check, X, Edit2 } from "lucide-react"
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

interface DaySchedule {
  date: string
  events: ScheduleEvent[]
}

const COLOR_MAP = {
  purple: { bg: "bg-brand-50",  text: "text-brand-900",  dot: "#534AB7",  accent: "#AFA9EC" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-800",   dot: "#1D9E75",  accent: "#9FE1CB" },
  coral:  { bg: "bg-coral-50",  text: "text-coral-900",  dot: "#D85A30",  accent: "#F0997B" },
  amber:  { bg: "bg-amber2-50", text: "text-amber2-900", dot: "#BA7517",  accent: "#FAC775" },
  gray:   { bg: "bg-gray-100",  text: "text-gray-600",   dot: "#888780",  accent: "#D3D1C7" },
}

const TYPE_BADGE: Record<string, string> = {
  focus:   "bg-brand-50 text-brand-800",
  meeting: "bg-teal-50 text-teal-800",
  habit:   "bg-brand-50 text-brand-800",
  other:   "bg-gray-100 text-gray-500",
  free:    "bg-gray-100 text-gray-400",
}

const DEFAULT_EVENTS: ScheduleEvent[] = [
  { id: "1", title: "Morning routine",    startTime: "08:00", endTime: "09:00", color: "teal",   repeat: true,  notes: "",                                                                        type: "habit"   },
  { id: "2", title: "Deep work",          startTime: "09:00", endTime: "10:00", color: "purple", repeat: true,  notes: "Focus block — no meetings, no distractions.",                            type: "focus"   },
  { id: "3", title: "Team standup",       startTime: "10:00", endTime: "10:30", color: "teal",   repeat: true,  notes: "",                                                                        type: "meeting" },
  { id: "4", title: "Lunch break",        startTime: "12:00", endTime: "13:00", color: "gray",   repeat: true,  notes: "",                                                                        type: "free"    },
  { id: "5", title: "Interview prep",     startTime: "14:00", endTime: "15:30", color: "coral",  repeat: false, notes: "Prep for OpenAI role — review system design and ML questions.",           type: "other"   },
  { id: "6", title: "Review PR + reply",  startTime: "16:00", endTime: "17:00", color: "amber",  repeat: false, notes: "Review PR #42 and reply to Priya about deadline.",                        type: "other"   },
  { id: "7", title: "Reading habit",      startTime: "20:00", endTime: "20:30", color: "purple", repeat: true,  notes: "AI suggested based on your reading goal.",                               type: "habit"   },
]

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
}

function getDayLabel(offset: number): { label: string; date: string; sub: string } {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" })
  const sub = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const date = d.toISOString().split("T")[0]
  return { label, date, sub }
}

const STORAGE_KEY = "ai-life-os-schedule"

function loadSchedule(): Record<string, ScheduleEvent[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch { return {} }
}

function saveSchedule(data: Record<string, ScheduleEvent[]>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(0)
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEvent[]>>({})
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [editingNotes, setEditingNotes] = useState("")
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTitleText, setEditingTitleText] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    title: "", startTime: "09:00", endTime: "10:00", color: "purple", repeat: false, type: "other", notes: ""
  })

  const days = [0, 1, 2].map(getDayLabel)

  // Load from localStorage
  useEffect(() => {
    const stored = loadSchedule()
    // Seed default events for each day if not set
    const seeded = { ...stored }
    days.forEach(({ date }) => {
      if (!seeded[date]) {
        seeded[date] = DEFAULT_EVENTS.map(e => ({ ...e }))
      } else {
        // Add any repeat events that aren't already in this day
        DEFAULT_EVENTS.filter(e => e.repeat).forEach(re => {
          if (!seeded[date].find(e => e.id === re.id)) {
            seeded[date] = [...seeded[date], { ...re }].sort((a, b) => a.startTime.localeCompare(b.startTime))
          }
        })
      }
    })
    setScheduleData(seeded)
    saveSchedule(seeded)
  }, [])

  const currentDate = days[activeDay].date
  const events = (scheduleData[currentDate] || []).sort((a, b) => a.startTime.localeCompare(b.startTime))

  function selectEvent(ev: ScheduleEvent) {
    setSelectedEvent(ev)
    setEditingNotes(ev.notes)
    setEditingTitleText(ev.title)
    setEditingTitle(false)
  }

  function updateEvent(updated: ScheduleEvent, allDays = false) {
    setSelectedEvent(updated)
    setScheduleData(prev => {
      const next = { ...prev }
      if (allDays) {
        Object.keys(next).forEach(date => {
          next[date] = next[date].map(e => e.id === updated.id ? updated : e)
        })
      } else {
        next[currentDate] = next[currentDate].map(e => e.id === updated.id ? updated : e)
      }
      saveSchedule(next)
      return next
    })
  }

  function saveNotes() {
    if (!selectedEvent) return
    const updated = { ...selectedEvent, notes: editingNotes }
    updateEvent(updated)
  }

  function saveTitle() {
    if (!selectedEvent || !editingTitleText.trim()) return
    const updated = { ...selectedEvent, title: editingTitleText.trim() }
    updateEvent(updated, selectedEvent.repeat)
    setEditingTitle(false)
  }

  function toggleRepeat() {
    if (!selectedEvent) return
    updateEvent({ ...selectedEvent, repeat: !selectedEvent.repeat })
  }

  function deleteEvent() {
    if (!selectedEvent) return
    setScheduleData(prev => {
      const next = { ...prev }
      next[currentDate] = next[currentDate].filter(e => e.id !== selectedEvent.id)
      saveSchedule(next)
      return next
    })
    setSelectedEvent(null)
  }

  function addEvent() {
    if (!newEvent.title?.trim()) return
    const ev: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      startTime: newEvent.startTime || "09:00",
      endTime: newEvent.endTime || "10:00",
      color: newEvent.color as ScheduleEvent["color"] || "purple",
      repeat: newEvent.repeat || false,
      notes: newEvent.notes || "",
      type: newEvent.type as ScheduleEvent["type"] || "other",
    }
    setScheduleData(prev => {
      const next = { ...prev }
      const targetDates = ev.repeat ? days.map(d => d.date) : [currentDate]
      targetDates.forEach(date => {
        next[date] = [...(next[date] || []), { ...ev }].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })
      saveSchedule(next)
      return next
    })
    setShowAddModal(false)
    setNewEvent({ title: "", startTime: "09:00", endTime: "10:00", color: "purple", repeat: false, type: "other", notes: "" })
  }

  const now = new Date()
  const nowStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`

  function isNow(ev: ScheduleEvent) {
    return activeDay === 0 && nowStr >= ev.startTime && nowStr <= ev.endTime
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="schedule" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-800">Schedule</p>
            <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
              {days.map((day, i) => (
                <button
                  key={day.date}
                  onClick={() => { setActiveDay(i); setSelectedEvent(null) }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-colors",
                    activeDay === i
                      ? "bg-white text-brand-600 font-medium shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {day.label}
                  <span className="ml-1 text-[10px] text-gray-400">{day.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs px-4 py-2 rounded-full hover:bg-brand-800 transition-colors"
          >
            <Plus size={12} /> Add event
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Timeline */}
          <div className="w-56 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
            <div className="px-3 py-2 bg-brand-50 border-b border-brand-100">
              <p className="text-xs font-medium text-brand-700">{days[activeDay].label} — {days[activeDay].sub}</p>
            </div>

            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <p className="text-xs">No events</p>
                <button onClick={() => setShowAddModal(true)} className="text-[10px] text-brand-600">+ Add one</button>
              </div>
            )}

            {events.map((ev, i) => {
              const c = COLOR_MAP[ev.color]
              const current = isNow(ev)
              return (
                <div key={ev.id} className="flex items-stretch min-h-[52px]">
                  <div className="w-10 flex flex-col items-end pr-2 pt-1.5 flex-shrink-0">
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">{formatTime(ev.startTime)}</span>
                  </div>
                  <div className="w-4 flex flex-col items-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 border-2 border-white" style={{ background: c.dot }} />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-0.5" />}
                  </div>
                  <div className="flex-1 px-2 py-1.5 min-w-0">
                    <div
                      onClick={() => selectEvent(ev)}
                      className={cn(
                        "rounded-lg px-2.5 py-2 cursor-pointer transition-all",
                        c.bg,
                        selectedEvent?.id === ev.id && "ring-1.5 ring-brand-400",
                        "hover:opacity-90"
                      )}
                    >
                      <div className={cn("text-[10px] font-medium leading-tight flex items-center flex-wrap gap-1", c.text)}>
                        {ev.title}
                        {current && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full bg-brand-600 text-brand-100">now</span>
                        )}
                        {ev.repeat && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500">
                            <Repeat size={7} />daily
                          </span>
                        )}
                      </div>
                      <div className={cn("text-[9px] mt-0.5 opacity-75", c.text)}>
                        {formatTime(ev.startTime)} – {formatTime(ev.endTime)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-w-0">
            {!selectedEvent ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Sparkles size={20} className="text-gray-300" />
                </div>
                <p className="text-sm">Click an event to view details</p>
              </div>
            ) : (
              <>
                {/* Event detail card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLOR_MAP[selectedEvent.color].dot + "22" }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: COLOR_MAP[selectedEvent.color].dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingTitle ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editingTitleText}
                            onChange={e => setEditingTitleText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false) }}
                            className="flex-1 text-sm font-medium border border-brand-300 rounded-lg px-2 py-1 outline-none"
                            autoFocus
                          />
                          <button onClick={saveTitle} className="text-brand-600 hover:text-brand-800"><Check size={14} /></button>
                          <button onClick={() => setEditingTitle(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-medium text-gray-800">{selectedEvent.title}</h2>
                          <button onClick={() => setEditingTitle(true)} className="text-gray-300 hover:text-brand-600 transition-colors"><Edit2 size={12} /></button>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{days[activeDay].sub} · {formatTime(selectedEvent.startTime)} – {formatTime(selectedEvent.endTime)}</p>
                    </div>
                    <button onClick={deleteEvent} className="text-gray-300 hover:text-red-400 transition-colors"><X size={16} /></button>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className={cn("text-[10px] px-2.5 py-1 rounded-full capitalize", TYPE_BADGE[selectedEvent.type])}>
                      {selectedEvent.type}
                    </span>
                    {isNow(selectedEvent) && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">In progress</span>
                    )}
                  </div>

                  {/* Time editor */}
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Time</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={selectedEvent.startTime}
                        onChange={e => updateEvent({ ...selectedEvent, startTime: e.target.value }, selectedEvent.repeat)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-300 bg-gray-50"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="time"
                        value={selectedEvent.endTime}
                        onChange={e => updateEvent({ ...selectedEvent, endTime: e.target.value }, selectedEvent.repeat)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-300 bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Repeat toggle */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                    <Repeat size={14} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">Repeat daily</p>
                      <p className="text-[10px] text-gray-400">{selectedEvent.repeat ? "Shows on all 3 days" : "Only on this day"}</p>
                    </div>
                    <button
                      onClick={toggleRepeat}
                      className={cn(
                        "w-9 h-5 rounded-full transition-colors relative",
                        selectedEvent.repeat ? "bg-brand-600" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                        selectedEvent.repeat ? "left-4" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                    <textarea
                      value={editingNotes}
                      onChange={e => setEditingNotes(e.target.value)}
                      onBlur={saveNotes}
                      placeholder="Add notes for this event…"
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed placeholder-gray-300"
                    />
                  </div>
                </div>

                {/* AI insight */}
                {isNow(selectedEvent) && (
                  <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-2xl p-4">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={13} className="text-brand-100" />
                    </div>
                    <p className="text-xs text-brand-800 leading-relaxed">
                      You&apos;re currently in a <strong>focus block</strong>. Your next event is {events.find(e => e.startTime > selectedEvent.startTime)?.title || "nothing"} — stay focused and make the most of this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Habits sidebar */}
          <div className="w-44 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto p-3 flex flex-col gap-3">
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-[9px] text-brand-600 mb-1">Focus score</p>
              <p className="text-xl font-medium text-brand-900">82%</p>
              <p className="text-[9px] text-brand-400">This week</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                <span className="text-brand-600">↗</span> Habits
              </p>
              {[
                { name: "Reading",   pct: 43, days: [1,1,0,1,0,0,0], color: "#534AB7" },
                { name: "Exercise",  pct: 71, days: [1,1,1,1,0,1,0], color: "#1D9E75" },
                { name: "Deep work", pct: 86, days: [1,1,1,1,1,0,1], color: "#7F77DD" },
              ].map(h => (
                <div key={h.name} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] text-gray-500">{h.name}</span>
                    <span className="text-[9px] text-gray-400">{h.days.filter(Boolean).length}/7</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${h.pct}%`, background: h.color }} />
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded flex items-center justify-center text-[7px]"
                        style={{
                          background: h.days[i] ? h.color : "var(--color-background-secondary)",
                          color: h.days[i] ? "#fff" : "var(--color-text-tertiary)"
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-[9px] font-medium text-gray-500 mb-2">Upcoming</p>
              {events.filter(e => e.startTime > nowStr).slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-1.5 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLOR_MAP[e.color].dot }} />
                  <span className="text-[9px] text-gray-500 flex-1 truncate">{e.title}</span>
                  <span className="text-[8px] text-gray-400">{formatTime(e.startTime)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">New event</p>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                placeholder="Event title"
                value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300"
                autoFocus
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Start</p>
                  <input type="time" value={newEvent.startTime} onChange={e => setNewEvent(p => ({ ...p, startTime: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">End</p>
                  <input type="time" value={newEvent.endTime} onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50" />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {["focus","meeting","habit","other"].map(t => (
                    <button key={t} onClick={() => setNewEvent(p => ({ ...p, type: t as ScheduleEvent["type"] }))}
                      className={cn("text-[10px] px-2.5 py-1 rounded-full border capitalize transition-colors",
                        newEvent.type === t ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Color</p>
                <div className="flex gap-2">
                  {(["purple","teal","coral","amber","gray"] as const).map(c => (
                    <button key={c} onClick={() => setNewEvent(p => ({ ...p, color: c }))}
                      className={cn("w-6 h-6 rounded-full border-2 transition-all", newEvent.color === c ? "border-gray-800 scale-110" : "border-transparent")}
                      style={{ background: COLOR_MAP[c].dot }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Repeat size={13} className="text-gray-400" />
                <span className="text-xs text-gray-600 flex-1">Repeat daily</span>
                <button onClick={() => setNewEvent(p => ({ ...p, repeat: !p.repeat }))}
                  className={cn("w-9 h-5 rounded-full transition-colors relative", newEvent.repeat ? "bg-brand-600" : "bg-gray-200")}>
                  <div className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all", newEvent.repeat ? "left-4" : "left-0.5")} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-xs border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={addEvent} disabled={!newEvent.title?.trim()} className="flex-1 py-2 text-xs bg-brand-600 text-white rounded-xl hover:bg-brand-800 disabled:opacity-40 transition-colors">Add event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}