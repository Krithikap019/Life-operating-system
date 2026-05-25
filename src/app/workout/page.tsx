"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Plus, Sparkles, Send, X, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import AddWorkoutModal from "@/components/workout/AddWorkoutModal"


type WorkoutType = "strength" | "cardio" | "mobility" | "hiit" | "recovery" | "rest"
type WorkoutStatus = "done" | "planned" | "progress" | "rest"

interface Exercise { name: string; sets?: string; done?: boolean; weight?: string }

interface DayData {
  day: string; date: number; type: WorkoutType; label: string; sub: string
  duration: number; kcal: number; exercises: Exercise[]; extra: number
  status: WorkoutStatus; progress?: string; today?: boolean; notes?: string
}

const CARD_THEMES = [
  { bg: "bg-brand-50",  border: "border-brand-200",  title: "text-brand-800",  icon: "text-brand-600"  },
  { bg: "bg-teal-50",   border: "border-teal-200",   title: "text-teal-800",   icon: "text-teal-600"   },
  { bg: "bg-orange-50", border: "border-orange-200", title: "text-orange-800", icon: "text-orange-600" },
  { bg: "bg-blue-50",   border: "border-blue-200",   title: "text-blue-800",   icon: "text-blue-600"   },
  { bg: "bg-amber-50",  border: "border-amber-200",  title: "text-amber-800",  icon: "text-amber-600"  },
]

function getTheme(key: string) {
  const index = key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % CARD_THEMES.length
  return CARD_THEMES[index]
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDays(startDate: Date, weekLabel: string) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      label: dayLabels[d.getDay()],
      num: d.getDate(),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      week: weekLabel,
    }
  })
}

function dayKeyToInputDate(dayKey: string): string {
  const [y, m, d] = dayKey.split("-")
  return `${y}-${String(Number(m) + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

const today = new Date()
const thisMonday = getMonday(today)
const lastMonday = new Date(thisMonday); lastMonday.setDate(thisMonday.getDate() - 7)
const nextMonday = new Date(thisMonday); nextMonday.setDate(thisMonday.getDate() + 7)

const LAST_WEEK = getWeekDays(lastMonday, "last")
const THIS_WEEK_DAYS = getWeekDays(thisMonday, "this")
const NEXT_WEEK = getWeekDays(nextMonday, "next")
const TODAY_KEY = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

const WEEK_WORKOUTS: Record<string, DayData> = {
  [THIS_WEEK_DAYS[0].key]: { day: "Mon", date: THIS_WEEK_DAYS[0].num, type: "strength", label: "Push",           sub: "Chest + Shoulders + Triceps", duration: 60, kcal: 520, exercises: [{ name: "Bench Press", sets: "4 × 8" }, { name: "Incline DB Press", sets: "3 × 10" }, { name: "Shoulder Press", sets: "3 × 10" }, { name: "Tricep Pushdown", sets: "3 × 12" }], extra: 2, status: "done" },
  [THIS_WEEK_DAYS[1].key]: { day: "Tue", date: THIS_WEEK_DAYS[1].num, type: "strength", label: "Pull",           sub: "Back + Biceps",               duration: 55, kcal: 480, exercises: [{ name: "Pull Ups", sets: "4 × 8" }, { name: "Barbell Row", sets: "4 × 10" }, { name: "Lat Pulldown", sets: "3 × 12" }, { name: "Bicep Curl", sets: "3 × 12" }], extra: 2, status: "done" },
  [THIS_WEEK_DAYS[2].key]: { day: "Wed", date: THIS_WEEK_DAYS[2].num, type: "strength", label: "Legs",           sub: "Quads + Hamstrings + Calves", duration: 65, kcal: 620, exercises: [{ name: "Squat", sets: "4 × 8" }, { name: "Romanian Deadlift", sets: "3 × 10" }, { name: "Leg Press", sets: "3 × 12" }, { name: "Standing Calf Raise", sets: "4 × 15" }], extra: 2, status: "done" },
  [THIS_WEEK_DAYS[3].key]: { day: "Thu", date: THIS_WEEK_DAYS[3].num, type: "recovery", label: "Active Recovery", sub: "Mobility & flexibility",      duration: 30, kcal: 200, exercises: [{ name: "Yoga / Mobility" }, { name: "Foam Rolling" }, { name: "Stretching" }, { name: "Light Walk" }], extra: 0, status: "planned" },
  [THIS_WEEK_DAYS[4].key]: { day: "Fri", date: THIS_WEEK_DAYS[4].num, type: "strength", label: "Upper Body",     sub: "Strength",                    duration: 60, kcal: 530, exercises: [{ name: "Incline Bench", sets: "4 × 8" }, { name: "Bent Over Row", sets: "4 × 10" }, { name: "Dumbbell Fly", sets: "3 × 12" }, { name: "Hammer Curl", sets: "3 × 12" }], extra: 2, status: "planned" },
  [THIS_WEEK_DAYS[5].key]: { day: "Sat", date: THIS_WEEK_DAYS[5].num, type: "strength", label: "Lower Body",     sub: "Strength",                    duration: 60, kcal: 580, exercises: [{ name: "Deadlift", sets: "4 × 6" }, { name: "Leg Extension", sets: "3 × 12" }, { name: "Leg Curl", sets: "3 × 12" }, { name: "Seated Calf Raise", sets: "4 × 15" }], extra: 2, status: "planned" },
  [THIS_WEEK_DAYS[6].key]: { day: "Sun", date: THIS_WEEK_DAYS[6].num, type: "strength", label: "Pull Day A",     sub: "Back + Biceps",               duration: 50, kcal: 440, exercises: [{ name: "Pull-ups", sets: "3 × 10", done: true }, { name: "Barbell Row", sets: "4 × 8", done: true }, { name: "Lat Pulldown", sets: "3 × 12", done: true }, { name: "Cable Row", sets: "3 × 12" }], extra: 2, status: "progress", progress: "3 / 6", today: true },
}

const AI_CHIPS_DEFAULT = [
  "Log today's pull day workout",
  "Add a rest day on Wednesday",
  "Swap Friday to cardio",
  "Mark today complete",
]

async function saveWorkoutToDB(dayKey: string, workout: DayData) {
  try {
    await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayKey, workout }),
    })
  } catch {}
}

async function deleteWorkoutFromDB(dayKey: string) {
  try {
    await fetch("/api/workouts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayKey }),
    })
  } catch {}
}

export default function WorkoutPage() {
  const [activeWeek, setActiveWeek] = useState<"last" | "this" | "next">("this")
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([])
  const [workouts, setWorkouts] = useState<Record<string, DayData>>({})
  const [isAuth, setIsAuth] = useState(false)  // ← NEW
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWorkout, setNewWorkout] = useState({ dayKey: TODAY_KEY, type: "strength" as WorkoutType, label: "", duration: 60, kcal: 500 })

  const todayWorkout = workouts[TODAY_KEY] ?? null
 const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
const [editingWorkout, setEditingWorkout] = useState<DayData | null>(null)

  const DAYS = activeWeek === "last" ? LAST_WEEK : activeWeek === "this" ? THIS_WEEK_DAYS : NEXT_WEEK

  // ← UPDATED: only saves to localStorage when NOT signed in
  function saveWorkouts(updated: Record<string, DayData>) {
    setWorkouts(updated)
    if (!isAuth) {
      try {
        const toSave = Object.fromEntries(
          Object.entries(updated).filter(([_, v]) => v !== null)
        )
        localStorage.setItem("life-os-workouts", JSON.stringify(toSave))
      } catch {}
    }
  }

  function getWorkout(dayKey: string): DayData | null { return workouts[dayKey] ?? null }

  function deleteWorkout(dayKey: string) {
    const updated = { ...workouts, [dayKey]: null as any }
    saveWorkouts(updated)
    deleteWorkoutFromDB(dayKey)
  }

  // ← UPDATED: clean separation between auth states
useEffect(() => {
  async function load() {
    try {
      const res = await fetch("/api/workouts")
if (res.ok) {
  const data = await res.json()
  setIsAuth(true)
  const loaded = Object.keys(data.workouts).length > 0 ? data.workouts : {}
  setWorkouts(loaded)
  setSelectedDayKey(TODAY_KEY)
  setEditingWorkout(loaded[TODAY_KEY] ?? null)
  setLoading(false)
  return
}
if (res.status === 401) {
  setIsAuth(false)
  const stored = localStorage.getItem("life-os-workouts")
  const merged = { ...WEEK_WORKOUTS, ...JSON.parse(stored || "{}") }
  setWorkouts(merged)
  setSelectedDayKey(TODAY_KEY)
  setEditingWorkout(merged[TODAY_KEY] ?? null)
  setLoading(false)
  return
}
    } catch {}
    const stored = localStorage.getItem("life-os-workouts")
    const merged = { ...WEEK_WORKOUTS, ...JSON.parse(stored || "{}") }
    setWorkouts(merged)
    if (merged[TODAY_KEY]) {
      setSelectedDayKey(TODAY_KEY)
      setEditingWorkout(merged[TODAY_KEY])
      setLoading(false)
    }
  }
  load()
}, [])

  async function handleAiSubmit() {
    if (!aiInput.trim()) return
    const userText = aiInput
    setAiLoading(true)
    setChatHistory(prev => [...prev, { role: "user", text: userText }])
    setAiInput("")
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: "ai", text: "Got it! I'll update your workout plan." }])
      setAiLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="workout" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="bg-white border-b border-gray-100 px-5 flex items-center justify-between py-3 flex-shrink-0">
          <p className="text-base font-medium text-gray-800">Workout</p>
          <button
            onClick={() => { setNewWorkout(p => ({ ...p, dayKey: TODAY_KEY })); setShowAddModal(true) }}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2 rounded-full hover:bg-brand-800 transition-colors">
            <Plus size={12} /> Add workout
          </button>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center flex-shrink-0">
          <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
            {([
              { key: "last" as const, label: "Last week", days: LAST_WEEK },
              { key: "this" as const, label: "This week", days: THIS_WEEK_DAYS },
              { key: "next" as const, label: "Next week", days: NEXT_WEEK },
            ]).map(w => (
              <button key={w.key} onClick={() => {
                setActiveWeek(w.key)
                const firstDay = w.days[0]
                setSelectedDayKey(firstDay.key)
                const w2 = getWorkout(firstDay.key)
                setEditingWorkout(w2 ? { ...w2 } : null)
                setIsEditing(false)
              }}
                className={cn("px-3 py-1 rounded-full text-sm transition-colors",
                  activeWeek === w.key ? "bg-white text-brand-600 font-medium shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                {w.label}
                <span className="ml-1 text-[10px] text-gray-400">{w.days[0].date}–{w.days[6].date.split(" ")[1]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">

            <div className="grid grid-cols-7 min-w-[800px] bg-gray-100 px-6 gap-3">
              {DAYS.map(day => {
                const isToday = day.key === TODAY_KEY
                const isSelected = selectedDayKey === day.key
                return (
                  <div key={day.key}
                    onClick={() => {
                      setSelectedDayKey(day.key)
                      const w = getWorkout(day.key)
                      setEditingWorkout(w ? { ...w } : null)
                      setIsEditing(false)
                    }}
                    className={cn(
                      "text-center cursor-pointer py-2 transition-colors flex flex-col items-center rounded-t-lg",
                      isSelected ? "bg-brand-50" : "hover:bg-gray-200/50"
                    )}>
                    <p className={cn("text-[10px] uppercase tracking-wide", isSelected ? "text-brand-600/70" : "text-gray-400")}>{day.label}</p>
                    <div className="h-6 flex items-center justify-center mt-0.5">
                      {isToday ? (
                        <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">{day.num}</div>
                      ) : (
                        <p className={cn("text-sm font-semibold", isSelected ? "text-brand-800" : "text-gray-700")}>{day.num}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-7 gap-3 min-w-[800px] px-6 py-4">
              {DAYS.map(day => {
                const workout = getWorkout(day.key)
                const isToday = day.key === TODAY_KEY
                const isSelected = selectedDayKey === day.key
                const theme = workout ? getTheme(day.key) : null
                return (
                  <div key={day.key} className="flex flex-col">
                    {workout && theme ? (
                      <div
                        onClick={() => { setSelectedDayKey(day.key); setEditingWorkout({ ...workout }); setIsEditing(false) }}
                        className={cn(
                          "rounded-xl border flex flex-col flex-1 overflow-hidden cursor-pointer transition-all hover:shadow-sm min-h-[160px]",
                          theme.bg, theme.border,
                          isToday && !isSelected && "ring-2 ring-brand-400 ring-offset-1",
                          isSelected && "ring-2 ring-brand-500 ring-offset-1"
                        )}>
                        <div className="px-3 pt-2 pb-1">
                          <p className={cn("text-[12px] font-bold tracking-wide", theme.title)}>{workout.label}</p>
                          <span className={cn("text-[9px] uppercase tracking-wider inline-block opacity-60", theme.title)}>{workout.type}</span>
                          {workout.sub && <p className={cn("text-[10px] mt-0.5 leading-tight opacity-75", theme.title)}>{workout.sub}</p>}
                        </div>
                        <div className="flex-1" />
                        <div className="px-3 py-1 flex flex-col gap-0.5">
                          <p className={cn("text-[10px] flex items-center gap-1", theme.icon)}><span>⏱</span> {workout.duration} min</p>
                          <p className={cn("text-[10px] flex items-center gap-1", theme.icon)}><span>🔥</span> {workout.kcal} kcal</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => { setNewWorkout(p => ({ ...p, dayKey: day.key })); setShowAddModal(true) }}
                        className="rounded-xl border border-dashed border-gray-200 flex-1 flex items-center justify-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors min-h-[160px]">
                        <p className="text-[10px] text-gray-300">+ Add</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {loading ? (
  <div className="border-t border-gray-100 bg-[#F5F4F0] h-[435px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      <p className="text-xs text-gray-400">Loading your workout...</p>
    </div>
  </div>
) : selectedDayKey && (
  <div className="border-t border-gray-100 bg-[#F5F4F0] h-[435px]">

                <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {DAYS.find(d => d.key === selectedDayKey)?.label}, {DAYS.find(d => d.key === selectedDayKey)?.date}
                  </span>
                </div>
                <div className="px-5 py-4 h-[calc(100%-49px)]">
                  {!editingWorkout ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">No workout added for this day</p>
                      <button
                        onClick={() => { setNewWorkout(p => ({ ...p, dayKey: selectedDayKey })); setShowAddModal(true) }}
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors">
                        + Add workout
                      </button>
                    </div>
                  ) : !isEditing ? (
                    <div className="flex gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
                      <div className="w-64 flex-shrink-0 border-r border-gray-100 overflow-y-auto">
                        <div className="p-4 flex flex-col gap-3 h-full">
                          <div className="pb-1">
                            <p className="text-sm font-semibold text-gray-800">{editingWorkout.label}</p>
                            {editingWorkout.sub && <p className="text-xs text-gray-500 mt-1">{editingWorkout.sub}</p>}
                            <span className={cn("inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize", getTheme(selectedDayKey ?? "").bg, getTheme(selectedDayKey ?? "").title)}>
                              {editingWorkout.type}
                            </span>
                          </div>
                          <div className="h-px bg-gray-100" />
                          <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                              <p className="text-sm font-semibold text-gray-800">{editingWorkout.duration}</p>
                              <p className="text-[10px] text-gray-400">min</p>
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                              <p className="text-sm font-semibold text-gray-800">{editingWorkout.kcal}</p>
                              <p className="text-[10px] text-gray-400">kcal</p>
                            </div>
                          </div>
                          <div className="h-px bg-gray-100" />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Summary</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Exercises</span>
                                <span className="text-xs font-semibold text-gray-800">{editingWorkout.exercises.length}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Total sets</span>
                                <span className="text-xs font-semibold text-gray-800">
                                  {editingWorkout.exercises.reduce((acc, ex) => { const s = ex.sets ? parseInt(ex.sets) : 0; return acc + (isNaN(s) ? 0 : s) }, 0)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Status</span>
                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                                  editingWorkout.status === "done" ? "bg-green-100 text-green-700" :
                                  editingWorkout.status === "progress" ? "bg-brand-100 text-brand-700" :
                                  "bg-gray-100 text-gray-500")}>
                                  {editingWorkout.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 transition-colors">
                              <Edit2 size={11} /> Edit workout
                            </button>
                          <button onClick={() => { deleteWorkout(selectedDayKey); setEditingWorkout(null) }} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-500 transition-colors">
                            <Trash2 size={11} /> Delete
                          </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Exercises</p>
                          <div className="flex flex-col gap-2">
                            {editingWorkout.exercises.map((ex, i) => (
                              <div key={i} className="bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                <span className="text-sm text-gray-800">{ex.name}</span>
                                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 flex-shrink-0">
                                  {[ex.sets, (ex as any).weight ? `${(ex as any).weight}kg` : null].filter(Boolean).join(" · ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                          <textarea
                            value={editingWorkout.notes ?? ""}
                            onChange={e => {
                              const updatedWorkout = { ...editingWorkout, notes: e.target.value }
                              setEditingWorkout(updatedWorkout)
                              setWorkouts(prev => {
                                const updated = { ...prev, [selectedDayKey]: updatedWorkout }
                                if (!isAuth) {
                                  try {
                                    const toSave = Object.fromEntries(Object.entries(updated).filter(([_, v]) => v !== null))
                                    localStorage.setItem("life-os-workouts", JSON.stringify(toSave))
                                  } catch {}
                                }
                                return updated
                              })
                              saveWorkoutToDB(selectedDayKey, { ...editingWorkout, notes: e.target.value })
                            }}
                            placeholder="Add notes for this workout…"
                            rows={3}
                            className="w-full text-xs text-gray-700 placeholder-gray-300 border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                  ) : (
                    <div className="flex flex-col gap-3 h-full">
                      <div className="flex gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
                        <div className={cn("flex flex-col gap-3 w-64 flex-shrink-0 p-4 border-r border-gray-100 bg-white")}>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Name</p>
                            <input value={editingWorkout.label} onChange={e => setEditingWorkout(p => p ? { ...p, label: e.target.value } : p)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-white/80" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Subtitle</p>
                            <input value={editingWorkout.sub} onChange={e => setEditingWorkout(p => p ? { ...p, sub: e.target.value } : p)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-white/80" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Type</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(["strength","cardio","mobility","hiit","recovery","rest"] as WorkoutType[]).map(t => (
                                <button key={t} onClick={() => setEditingWorkout(p => p ? { ...p, type: t } : p)}
                                  className={cn("text-[10px] px-2.5 py-1 rounded-full border capitalize transition-colors",
                                    editingWorkout.type === t ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-500 bg-white/80 hover:border-gray-300")}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                              <input type="number" value={editingWorkout.duration} onChange={e => setEditingWorkout(p => p ? { ...p, duration: Number(e.target.value) } : p)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-white/80" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Kcal</p>
                              <input type="number" value={editingWorkout.kcal} onChange={e => setEditingWorkout(p => p ? { ...p, kcal: Number(e.target.value) } : p)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-white/80" />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Exercises</p>
                            <button onClick={() => setEditingWorkout(p => p ? { ...p, exercises: [...p.exercises, { name: "", sets: "" }] } : p)}
                              className="text-[11px] text-brand-600 hover:text-brand-800 font-medium">+ Add exercise</button>
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            {editingWorkout.exercises.map((ex, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <div className="flex-1 flex flex-col gap-1.5 bg-gray-50 rounded-xl p-2.5">
                                  <input value={ex.name}
                                    onChange={e => setEditingWorkout(p => p ? { ...p, exercises: p.exercises.map((x, j) => j === i ? { ...x, name: e.target.value } : x) } : p)}
                                    placeholder="Exercise name"
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-white font-medium" />
                                  <div className="flex gap-1.5">
                                    <div className="flex-1">
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Sets</p>
                                      <input
                                        value={ex.sets?.split("×")[0]?.trim() ?? ""}
                                        onChange={e => {
                                          const reps = ex.sets?.split("×")[1]?.trim() ?? "8"
                                          setEditingWorkout(p => p ? { ...p, exercises: p.exercises.map((x, j) => j === i ? { ...x, sets: `${e.target.value} × ${reps}` } : x) } : p)
                                        }}
                                        placeholder="4" type="number"
                                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Reps</p>
                                      <input
                                        value={ex.sets?.split("×")[1]?.trim() ?? ""}
                                        onChange={e => {
                                          const sets = ex.sets?.split("×")[0]?.trim() ?? "3"
                                          setEditingWorkout(p => p ? { ...p, exercises: p.exercises.map((x, j) => j === i ? { ...x, sets: `${sets} × ${e.target.value}` } : x) } : p)
                                        }}
                                        placeholder="10" type="number"
                                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Weight (kg)</p>
                                      <input
                                        value={ex.weight ?? ""}
                                        onChange={e => setEditingWorkout(p => p ? { ...p, exercises: p.exercises.map((x, j) => j === i ? { ...x, weight: e.target.value } : x) } : p)}
                                        placeholder="—" type="number"
                                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center placeholder-gray-300" />
                                    </div>
                                  </div>
                                </div>
                                <button onClick={() => setEditingWorkout(p => p ? { ...p, exercises: p.exercises.filter((_, j) => j !== i) } : p)}
                                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={14} /></button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100 justify-end flex-shrink-0">
                            <button
                              onClick={() => {
                                if (!selectedDayKey || !editingWorkout) return
                                const updated = { ...workouts, [selectedDayKey]: { ...editingWorkout } }
                                saveWorkouts(updated)
                                saveWorkoutToDB(selectedDayKey, editingWorkout)
                                setIsEditing(false)
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-800 transition-colors font-medium">
                              ✓ Save
                            </button>
                            <button onClick={() => setIsEditing(false)}
                              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex-shrink-0 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}>
              <Sparkles size={14} className="text-white" />
              <span className="text-sm font-medium text-white">Log workout with AI</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
              {chatHistory.length === 0 && (
                <>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                      <Sparkles size={20} className="text-brand-400" />
                    </div>
                    <p className="text-xs text-gray-500 text-center leading-relaxed px-2">
                      Describe your workout and I&apos;ll log it with the right sets, reps, and calories.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {["Click any day card to edit it", "Or type below to log a set"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-brand-600 font-bold">{i + 1}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">{s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] text-gray-400">Try asking:</p>
                    {AI_CHIPS_DEFAULT.map(s => (
                      <button key={s} onClick={() => setAiInput(`"${s}"`)}
                        className="text-left text-[10px] px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                        &quot;{s}&quot;
                      </button>
                    ))}
                  </div>
                </>
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
                      <div className="bg-gray-100 text-gray-400 text-xs px-3 py-2 rounded-2xl rounded-tl-sm">...</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiSubmit()}
                placeholder="e.g. log pull-ups 3×10…"
                className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 bg-gray-50 outline-none focus:border-brand-300 text-gray-800 placeholder-gray-400" />
              <button onClick={handleAiSubmit} disabled={!aiInput.trim() || aiLoading}
                className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-800 disabled:opacity-40 transition-colors flex-shrink-0">
                {aiLoading ? <span className="text-[10px]">...</span> : <Send size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddWorkoutModal
          onClose={() => setShowAddModal(false)}
          defaultDate={dayKeyToInputDate(newWorkout.dayKey)}
          onAdd={(workout) => {
            const d = new Date(workout.date + "T12:00:00")
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
            const isCardio = workout.category === "cardio"
            const categoryToType: Record<string, WorkoutType> = {
              strength: "strength", cardio: "cardio", hiit: "hiit",
              mobility: "mobility", recovery: "recovery", rest: "rest",
            }
            const newDay: DayData = {
              day: "", date: d.getDate(),
              type: categoryToType[workout.category] ?? "rest",
              label: workout.name, sub: workout.name2 || "",
              duration: Number(workout.duration), kcal: Number(workout.kcal) || 0,
              exercises: isCardio
                ? workout.cardioExercises.filter(e => e.name.trim()).map(e => ({ name: e.name, sets: `${e.duration} min${e.distance ? ` · ${e.distance}km` : ""}` }))
                : workout.strengthExercises.filter(e => e.name.trim()).map(e => ({ name: e.name, sets: `${e.sets} × ${e.reps}${e.weight ? ` · ${e.weight}kg` : ""}` })),
              extra: 0, status: "planned",
            }
            saveWorkouts({ ...workouts, [key]: newDay })
            saveWorkoutToDB(key, newDay)
            setSelectedDayKey(key)
            setEditingWorkout(newDay)
            setActiveWeek(LAST_WEEK.some(d => d.key === key) ? "last" : NEXT_WEEK.some(d => d.key === key) ? "next" : "this")
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}