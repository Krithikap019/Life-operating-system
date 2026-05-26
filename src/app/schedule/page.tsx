"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Plus, Sparkles, Send, Repeat, Check, X, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  color: "purple" | "teal" | "coral" | "amber" | "gray"
  repeat: boolean
  notes: string
  type: "focus" | "meeting" | "habit" | "free" | "other"
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

function getDefaultEvents(): ScheduleEvent[] {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
  return [
    { id: "1", title: "Morning routine",   date: today, startTime: "08:00", endTime: "09:00", color: "teal",   repeat: true,  notes: "", type: "habit"   },
    { id: "2", title: "Deep work",         date: today, startTime: "09:00", endTime: "10:00", color: "purple", repeat: false, notes: "Focus block — no meetings, no distractions.", type: "focus" },
    { id: "3", title: "Team standup",      date: today, startTime: "10:00", endTime: "10:30", color: "teal",   repeat: false, notes: "", type: "meeting" },
    { id: "4", title: "Lunch break",       date: today, startTime: "12:00", endTime: "13:00", color: "gray",   repeat: true,  notes: "", type: "free"    },
    { id: "5", title: "Interview prep",    date: today, startTime: "14:00", endTime: "15:30", color: "coral",  repeat: false, notes: "Prep for OpenAI role — review system design and ML questions.", type: "other" },
    { id: "6", title: "Review PR + reply", date: today, startTime: "16:00", endTime: "17:00", color: "amber",  repeat: false, notes: "Review PR #42 and reply to Priya about deadline.", type: "other" },
    { id: "7", title: "Reading habit",     date: today, startTime: "20:00", endTime: "20:30", color: "purple", repeat: false, notes: "AI suggested based on your reading goal.", type: "habit" },
  ]
}
const defaultEvents = getDefaultEvents()

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
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
  return { label, date, sub }
}

const STORAGE_KEY = "ai-life-os-schedule"
const DELETED_KEY = "ai-life-os-deleted-events"

// exceptions format: { eventId: [date1, date2, ...] }

function saveToLocalStorage(data: Record<string, ScheduleEvent[]>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function getLocalExceptions(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(DELETED_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch { return {} }
}

// eventId -> [dates]
function addLocalException(eventId: string, date: string) {
  try {
    const ex = getLocalExceptions()
    if (!ex[eventId]) ex[eventId] = []
    if (!ex[eventId].includes(date)) ex[eventId] = [...ex[eventId], date]
    localStorage.setItem(DELETED_KEY, JSON.stringify(ex))
  } catch {}
}

// Check if an event is excepted on a specific date
// exceptions = { eventId: [date1, date2] }
function isExcepted(exceptions: Record<string, string[]>, eventId: string, date: string): boolean {
  return exceptions[eventId]?.includes(date) ?? false
}

async function loadSchedule(): Promise<{ events: Record<string, ScheduleEvent>; exceptions: Record<string, string[]>; isAuthenticated: boolean }> {
  try {
    const res = await fetch("/api/schedule")
    if (res.status === 401) {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : {}
      const byId: Record<string, ScheduleEvent> = {}
      Object.values(parsed).forEach((dayEvents: any) => {
        if (Array.isArray(dayEvents)) {
          dayEvents.forEach((ev: any) => { if (ev?.id) byId[ev.id] = ev })
        }
      })
      return { events: byId, exceptions: getLocalExceptions(), isAuthenticated: false }
    }
    if (!res.ok) return { events: {}, exceptions: {}, isAuthenticated: true }

    const schedData = await res.json()
    const exRes = await fetch("/api/schedule-exceptions")
    const exData = exRes.ok ? await exRes.json() : { exceptions: {} }

    const byId: Record<string, ScheduleEvent> = {}
    for (const ev of schedData.events || []) byId[ev.id] = ev

    return { events: byId, exceptions: exData.exceptions || {}, isAuthenticated: true }
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    const byId: Record<string, ScheduleEvent> = {}
    Object.values(parsed).forEach((dayEvents: any) => {
      if (Array.isArray(dayEvents)) {
        dayEvents.forEach((ev: any) => { if (ev?.id) byId[ev.id] = ev })
      }
    })
    return { events: byId, exceptions: getLocalExceptions(), isAuthenticated: false }
  }
}

async function saveEventToDB(event: ScheduleEvent) {
  try {
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    })
  } catch {}
}

async function deleteEventFromDB(id: string) {
  try {
    await fetch("/api/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  } catch {}
}

async function addExceptionToDB(eventId: string, date: string) {
  try {
    await fetch("/api/schedule-exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, date }),
    })
  } catch {}
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(0)
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEvent[]>>({})
  const [exceptions, setExceptions] = useState<Record<string, string[]>>({})
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [editingNotes, setEditingNotes] = useState("")
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTitleText, setEditingTitleText] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
  title: "", startTime: "09:00", endTime: "10:00", color: "purple",
  repeat: false, type: "other", notes: ""
})
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([])
  const [isAuth, setIsAuth] = useState(false)

  const days = [0, 1, 2].map(getDayLabel)

  useEffect(() => {
    loadSchedule().then(({ events: storedById, exceptions: loadedExceptions, isAuthenticated }) => {
      const seeded: Record<string, ScheduleEvent[]> = {}
      const hasLocalData = Object.keys(storedById).length > 0

      days.forEach(({ date }, i) => {
        if (!isAuthenticated) {
          if (hasLocalData) {
            seeded[date] = []
          } else {
            seeded[date] = i === 0
              ? defaultEvents.map(e => ({ ...e }))
              : defaultEvents.filter(e => e.repeat).map(e => ({ ...e }))
          }
        } else {
          seeded[date] = []
        }
      })

      // Overlay stored events — filter out exceptions using { eventId: [dates] } format
      Object.values(storedById).forEach((ev: any) => {
        if (!ev?.startTime) return
        if (ev.repeat) {
          days.forEach(({ date }) => {
            if (isExcepted(loadedExceptions, ev.id, date)) return // skip this day
            const idx = seeded[date].findIndex(e => e.id === ev.id)
            if (idx >= 0) seeded[date][idx] = ev
            else seeded[date] = [...seeded[date], ev].sort((a, b) => (a?.startTime || "").localeCompare(b?.startTime || ""))
          })
        } else {
          const date = ev.date
            if (!date) return

          // only allow visible 3 days
          if (!seeded[date]) return

          if (isExcepted(loadedExceptions, ev.id, date)) return

          const idx = seeded[date].findIndex(e => e.id === ev.id)
          if (idx >= 0) seeded[date][idx] = ev
          else seeded[date] = [...seeded[date], ev].sort((a, b) => (a?.startTime || "").localeCompare(b?.startTime || ""))
        }
      })

      // Filter seeded defaults by exceptions (not-signed-in)
      if (!isAuthenticated) {
        days.forEach(({ date }) => {
          seeded[date] = seeded[date].filter(e => !isExcepted(loadedExceptions, e.id, date))
        })
      }

      setScheduleData(seeded)
      setExceptions(loadedExceptions)
      setIsAuth(isAuthenticated)
      if (!isAuthenticated) saveToLocalStorage(seeded)

      const now = new Date()
      const nowStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`
      const todayEvents = (seeded[days[0].date] || []).filter(e => e?.startTime).sort((a, b) => a.startTime.localeCompare(b.startTime))
      const current = todayEvents.find(e => nowStr >= e.startTime && nowStr <= e.endTime)
      const next = todayEvents.find(e => e.startTime > nowStr)
      const autoSelect = current || next
      if (autoSelect) {
        setSelectedEvent(autoSelect)
        setEditingNotes(autoSelect.notes)
        setEditingTitleText(autoSelect.title)
      }
    })
  }, [])

  const currentDate = days[activeDay].date
  const events = (scheduleData[currentDate] || []).filter(e => e?.startTime).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const now = new Date()
  const nowStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`
  const nowEvent = activeDay === 0 ? events.find(e => nowStr >= e.startTime && nowStr <= e.endTime) : null

  function isNow(ev: ScheduleEvent) {
    return activeDay === 0 && nowStr >= ev.startTime && nowStr <= ev.endTime
  }

  function selectEvent(ev: ScheduleEvent) {
    setSelectedEvent(ev)
    setEditingNotes(ev.notes)
    setEditingTitleText(ev.title)
    setEditingTitle(false)
    setChatHistory([])
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
      if (!isAuth) saveToLocalStorage(next)
      return next
    })
    saveEventToDB(updated)
  }

  function saveNotes() {
    if (!selectedEvent) return
    updateEvent({ ...selectedEvent, notes: editingNotes })
  }

  function saveTitle() {
    if (!selectedEvent || !editingTitleText.trim()) return
    updateEvent({ ...selectedEvent, title: editingTitleText.trim() }, selectedEvent.repeat)
    setEditingTitle(false)
  }

  function toggleRepeat() {
    if (!selectedEvent) return
    updateEvent({ ...selectedEvent, repeat: !selectedEvent.repeat })
  }

  function handleDeleteEvent() {
    if (!selectedEvent) return
    const id = selectedEvent.id
    const isRepeat = selectedEvent.repeat

    if (isRepeat) {
      // Add exception for this day only — event stays on other days
      setScheduleData(prev => {
        const next = { ...prev }
        next[currentDate] = next[currentDate].filter(e => e.id !== id)
        if (!isAuth) saveToLocalStorage(next)
        return next
      })
      setExceptions(prev => {
        const next = { ...prev }
        if (!next[id]) next[id] = []
        if (!next[id].includes(currentDate)) next[id] = [...next[id], currentDate]
        return next
      })
      if (isAuth) {
        addExceptionToDB(id, currentDate)
      } else {
        addLocalException(id, currentDate)
      }
    } else {
      // Non-repeat: delete entirely
      setScheduleData(prev => {
        const next = { ...prev }
        next[currentDate] = next[currentDate].filter(e => e.id !== id)
        if (!isAuth) saveToLocalStorage(next)
        return next
      })
      deleteEventFromDB(id)
    }

    setSelectedEvent(null)
  }

function addEvent() {
  if (!newEvent.title?.trim()) return
  const targetDate = (newEvent as any).date || currentDate
  const targetDayIndex = days.findIndex(d => d.date === targetDate)

  const ev: ScheduleEvent = {
    id: Date.now().toString(),
    title: newEvent.title!,
    date: targetDate,
    startTime: newEvent.startTime || "09:00",
    endTime: newEvent.endTime || "10:00",
    color: newEvent.color as ScheduleEvent["color"] || "purple",
    repeat: newEvent.repeat || false,
    notes: newEvent.notes || "",
    type: newEvent.type as ScheduleEvent["type"] || "other",
  }
  setScheduleData(prev => {
    const next = { ...prev }
    const targetDates = ev.repeat ? days.map(d => d.date) : [targetDate]
    targetDates.forEach(date => {
      next[date] = [...(next[date] || []), { ...ev }].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })
    if (!isAuth) saveToLocalStorage(next)
    return next
  })
  saveEventToDB(ev)
  // Auto-switch to the day the event was added to
  if (targetDayIndex >= 0) setActiveDay(targetDayIndex)
  setShowAddModal(false)
  setNewEvent({ title: "", startTime: "09:00", endTime: "10:00", color: "purple", repeat: false, type: "other", notes: "" })
}

async function handleAiEdit() {
  if (!aiInput.trim()) return
  const userText = aiInput
  setAiLoading(true)
  setChatHistory(prev => [...prev, { role: "user", text: userText }])
  setAiInput("")
  try {
    const res = await fetch("/api/schedule-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        event: selectedEvent,
        currentDate,
        availableDates: days.map(d => d.date),
      }),
    })
    const data = await res.json()

    if (data.action === "unavailable") {
      // just show the response message, don't add anything
    } else if (data.action === "add") {
      const targetDate = data.date || currentDate
      const targetDayIndex = days.findIndex(d => d.date === targetDate)
      const ev: ScheduleEvent = {
        id: Date.now().toString(),
        title: data.title || "New event",
        date: targetDate,
        startTime: data.startTime || "09:00",
        endTime: data.endTime || "10:00",
        color: data.color || "purple",
        repeat: data.repeat || false,
        notes: data.notes || "",
        type: data.type || "other",
      }
      setScheduleData(prev => {
        const next = { ...prev }
        next[targetDate] = [...(next[targetDate] || []), ev].sort((a, b) => a.startTime.localeCompare(b.startTime))
        if (!isAuth) saveToLocalStorage(next)
        return next
      })
      saveEventToDB(ev)
      selectEvent(ev)
      // Auto-switch to the day the event was added to
      if (targetDayIndex >= 0) setActiveDay(targetDayIndex)
    } else if (data.action === "update" && selectedEvent) {
      const updated: ScheduleEvent = {
        ...selectedEvent,
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.title && { title: data.title }),
        ...(data.notes && { notes: data.notes }),
      }
      updateEvent(updated, selectedEvent.repeat)
      if (data.notes) setEditingNotes(data.notes)
    }

    setChatHistory(prev => [...prev, { role: "ai", text: data.response || "Done!" }])
  } catch {
    setChatHistory(prev => [...prev, { role: "ai", text: "Something went wrong. Try again." }])
  } finally {
    setAiLoading(false)
  }
}

  const nextEvent = selectedEvent ? events.find(e => e.startTime > selectedEvent.endTime) : null

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="schedule" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="bg-white border-b border-gray-100 px-5 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between py-3">
            <p className="text-base font-medium text-gray-800">Schedule</p>
          <button onClick={() => { setShowAddModal(true); setNewEvent(p => ({ ...p, date: currentDate })) }}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2 rounded-full hover:bg-brand-800 transition-colors">
            <Plus size={12} /> Add event
          </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center flex-shrink-0">
          <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
            {days.map((day, i) => (
              <button key={day.date} onClick={() => { setActiveDay(i); setSelectedEvent(null) }}
                className={cn("px-3 py-1 rounded-full text-sm transition-colors",
                  activeDay === i ? "bg-white text-brand-600 font-medium shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                {day.label}
                <span className="ml-1 text-[10px] text-gray-400">{day.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          <div className="w-96 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">{days[activeDay].label} — {days[activeDay].sub}</p>
            </div>

            {nowEvent && (
              <div onClick={() => selectEvent(nowEvent)}
                className="mx-3 mt-3 mb-1 flex items-center gap-3 bg-brand-600 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-brand-800 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{nowEvent.title}</div>
                  <div className="text-xs text-brand-200">{formatTime(nowEvent.startTime)} – {formatTime(nowEvent.endTime)}</div>
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <p className="text-xs">No events</p>
                <button onClick={() => setShowAddModal(true)} className="text-[10px] text-brand-600">+ Add one</button>
              </div>
            )}

            {events.map((ev, i) => {
              const c = COLOR_MAP[ev.color]
              const current = isNow(ev)
              const showTime = i === 0 || events[i - 1].startTime !== ev.startTime
              return (
                <div key={ev.id} className="flex items-stretch min-h-[56px]">
                  <div className="w-16 flex flex-col items-end pr-2 pt-1.5 flex-shrink-0">
                    {showTime && <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatTime(ev.startTime)}</span>}
                  </div>
                  <div className="w-4 flex flex-col items-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 border-2 border-white" style={{ background: c.dot }} />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-0.5" />}
                  </div>
                  <div className="flex-1 px-2 py-1.5 min-w-0">
                    <div onClick={() => selectEvent(ev)}
                      className={cn("rounded-lg px-3 py-2 cursor-pointer transition-all", c.bg,
                        selectedEvent?.id === ev.id ? "ring-2 ring-brand-400" : "", "hover:opacity-90")}>
                      <div className={cn("text-sm font-medium leading-tight flex items-center flex-wrap gap-1", c.text)}>
                        {ev.title}
                        {current && <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full bg-brand-600 text-brand-100">now</span>}
                        {ev.repeat && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full bg-white/60 text-gray-500">
                            <Repeat size={7} />daily
                          </span>
                        )}
                      </div>
                      <div className={cn("text-[11px] mt-0.5 opacity-75", c.text)}>
                        {formatTime(ev.startTime)} – {formatTime(ev.endTime)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-w-0">
            {!selectedEvent ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                {activeDay === 0 && events.length > 0 && events.every(e => e.endTime < nowStr) ? (
                  <>
                    <div className="text-4xl">🎉</div>
                    <div className="text-center">
                      <p className="text-base font-medium text-gray-700">You&apos;re done for today!</p>
                      <p className="text-sm text-gray-400 mt-1">All events completed. Great work today.</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">
                      <div className="bg-teal-50 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-teal-700 font-medium">🌙 Time to wind down</p>
                        <p className="text-[11px] text-teal-600 mt-0.5">Review tomorrow&apos;s schedule to stay ahead</p>
                      </div>
                      <button onClick={() => { setActiveDay(1); setSelectedEvent(null) }}
                        className="text-xs text-brand-600 bg-brand-50 rounded-xl px-4 py-2.5 hover:bg-brand-100 transition-colors">
                        See tomorrow&apos;s schedule →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Sparkles size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm">Click an event to view details</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLOR_MAP[selectedEvent.color].dot + "22" }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: COLOR_MAP[selectedEvent.color].dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingTitle ? (
                        <div className="flex items-center gap-2">
                          <input value={editingTitleText} onChange={e => setEditingTitleText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false) }}
                            className="flex-1 text-sm font-medium border border-brand-300 rounded-lg px-2 py-1 outline-none" autoFocus />
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
                    <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className={cn("text-[10px] px-2.5 py-1 rounded-full capitalize", TYPE_BADGE[selectedEvent.type])}>{selectedEvent.type}</span>
                    {isNow(selectedEvent) && <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">In progress</span>}
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Time</p>
                    <div className="flex items-center gap-3">
                      <input type="time" value={selectedEvent.startTime}
                        onChange={e => updateEvent({ ...selectedEvent, startTime: e.target.value }, selectedEvent.repeat)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-300 bg-gray-50" />
                      <span className="text-xs text-gray-400">to</span>
                      <input type="time" value={selectedEvent.endTime}
                        onChange={e => updateEvent({ ...selectedEvent, endTime: e.target.value }, selectedEvent.repeat)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-300 bg-gray-50" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                    <Repeat size={14} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">Repeat daily</p>
                      <p className="text-[10px] text-gray-400">{selectedEvent.repeat ? "Shows on all 3 days" : "Only on this day"}</p>
                    </div>
                    <button onClick={toggleRepeat}
                      className={cn("w-9 h-5 rounded-full transition-colors relative", selectedEvent.repeat ? "bg-brand-600" : "bg-gray-200")}>
                      <div className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all", selectedEvent.repeat ? "left-4" : "left-0.5")} />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                    <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)} onBlur={saveNotes}
                      placeholder="Add notes for this event…" rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed placeholder-gray-300" />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button onClick={handleDeleteEvent}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5">
                      <Trash2 size={12} />
                      {selectedEvent.repeat ? "Delete for today only" : "Delete event"}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-2xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} className="text-brand-100" />
                  </div>
                  <div className="flex-1">
                    {isNow(selectedEvent) ? (
                      <p className="text-xs text-brand-800 leading-relaxed">
                        You&apos;re currently in <strong>{selectedEvent.title}</strong>.
                        {nextEvent && <> Next up: <strong>{nextEvent.title}</strong> at {formatTime(nextEvent.startTime)}.</>} Stay focused.
                      </p>
                    ) : (
                      <p className="text-xs text-brand-800 leading-relaxed">
                        <strong>{selectedEvent.title}</strong> is scheduled for {formatTime(selectedEvent.startTime)} – {formatTime(selectedEvent.endTime)}.
                        {selectedEvent.repeat && " This event repeats daily."}
                        {selectedEvent.notes && " You have notes saved for this event."}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex-shrink-0 flex items-center gap-2" style={{background:"linear-gradient(135deg,#534AB7,#7F77DD)"}}>
              <Sparkles size={14} className="text-white" />
              <span className="text-sm font-medium text-white">{selectedEvent ? "Add or Update event with AI" : "Add event with AI"}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                {["Click any event on the left to edit it", "Or type below to add a new event"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-brand-600 font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{s}</p>
                  </div>
                ))}
              </div>

              {selectedEvent ? (
                <div className="bg-brand-50 rounded-xl p-3">
                  <p className="text-[9px] text-brand-400 uppercase tracking-wider mb-1">Editing</p>
                  <p className="text-xs font-medium text-brand-800">{selectedEvent.title}</p>
                  <p className="text-[10px] text-brand-600 mt-0.5">{formatTime(selectedEvent.startTime)} – {formatTime(selectedEvent.endTime)}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">No event selected — describe a new event to add it, or click an event to edit it.</p>
                </div>
              )}

              {chatHistory.length > 0 && (
                <div className="flex flex-col gap-2">
                  {chatHistory.map((msg, i) => (
                    msg.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <div className="bg-brand-600 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed">{msg.text}</div>
                      </div>
                    ) : (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles size={10} className="text-brand-600" />
                        </div>
                        <div className="bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed">{msg.text}</div>
                      </div>
                    )
                  ))}
                  {aiLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={10} className="text-brand-600" />
                      </div>
                      <div className="bg-gray-100 text-gray-400 text-xs px-3 py-2 rounded-2xl rounded-tl-sm leading-relaxed">...</div>
                    </div>
                  )}
                </div>
              )}

              {chatHistory.length === 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400">Try asking:</p>
                  {(selectedEvent
                    ? ["Move to 3pm", "Make it 2 hours", "Rename to Team sync", "Push back 30 mins"]
                    : ["Add gym at 7am", "Schedule lunch at 1pm", "Add meeting at 4pm", "Deep work block at 9am"]
                  ).map(s => (
                    <button key={s} onClick={() => setAiInput(s)}
                      className="text-left text-[10px] px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                      &quot;{s}&quot;
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiEdit()}
                placeholder={selectedEvent ? "e.g. move to 3pm…" : "e.g. add gym at 7am…"}
                className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 bg-gray-50 outline-none focus:border-brand-300 text-gray-800 placeholder-gray-400" />
              <button onClick={handleAiEdit} disabled={!aiInput.trim() || aiLoading}
                className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-800 disabled:opacity-40 transition-colors flex-shrink-0">
                {aiLoading ? <span className="text-[10px]">...</span> : <Send size={12} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">New event</p>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300" autoFocus />
                <div>
  <p className="text-[10px] text-gray-400 mb-1.5">Day</p>
  <div className="flex gap-2">
    {days.map((day, i) => (
      <button key={day.date} onClick={() => setNewEvent(p => ({ ...p, date: day.date }))}
        className={cn("flex-1 py-2 rounded-xl border text-center transition-colors",
          (newEvent.date === day.date || (!newEvent.date && i === activeDay))
            ? "bg-brand-600 text-white border-brand-600"
            : "border-gray-200 text-gray-500 hover:border-brand-200")}>
        <p className="text-[10px] font-medium">{day.label}</p>
        <p className="text-[9px] opacity-70">{day.sub}</p>
      </button>
    ))}
  </div>
</div>
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
                        newEvent.type === t ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
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
                      style={{ background: COLOR_MAP[c].dot }} />
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
