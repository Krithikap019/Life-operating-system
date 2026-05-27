"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Plus, Sparkles, Send, X, Trash2, Edit2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"] as const
type MealType = typeof MEAL_TYPES[number]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "BREAKFAST",
  lunch:     "LUNCH",
  snack:     "SNACK",
  dinner:    "DINNER",
}

const MEAL_COLORS: Record<MealType, { bg: string; border: string; text: string; header: string; headerText: string }> = {
  breakfast: { bg: "bg-brand-50",   border: "border-brand-200",  text: "text-brand-800",  header: "bg-brand-50",   headerText: "text-brand-700"  },
  lunch:     { bg: "bg-teal-50",    border: "border-teal-200",   text: "text-teal-800",   header: "bg-teal-50",    headerText: "text-teal-700"   },
  snack:     { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-800",   header: "bg-blue-50",    headerText: "text-blue-700"   },
  dinner:    { bg: "bg-amber2-50",  border: "border-amber2-200", text: "text-amber2-800", header: "bg-amber2-50",  headerText: "text-amber2-700" },
}

interface MealItem {
  id: string
  name: string
  emoji: string
  kcal: number
  prepMin: number
  time: string
  type: string
  notes: string
}

interface DayItem {
  key: string
  label: string
  num: number
  date: string
  week: string
}

const MEAL_TEMPLATES = [
  { breakfast: { name: "Oats & berries",   emoji: "🥣", kcal: 380, prepMin: 15, time: "7:30 AM"  }, lunch: { name: "Caesar salad",   emoji: "🥗", kcal: 490, prepMin: 20, time: "12:30 PM" }, snack: { name: "Banana & PB",    emoji: "🍌", kcal: 220, prepMin: 5,  time: "3:30 PM"  }, dinner: { name: "Grilled chicken", emoji: "🍗", kcal: 620, prepMin: 30, time: "7:00 PM"  } },
  { breakfast: { name: "Egg omelette",     emoji: "🍳", kcal: 310, prepMin: 10, time: "7:30 AM"  }, lunch: { name: "Rice & chicken", emoji: "🍱", kcal: 560, prepMin: 10, time: "12:30 PM" }, snack: { name: "Mixed nuts",     emoji: "🥜", kcal: 180, prepMin: 1,  time: "3:30 PM"  }, dinner: { name: "Salmon & veg",   emoji: "🐟", kcal: 650, prepMin: 35, time: "7:00 PM"  } },
  { breakfast: { name: "Oats & berries",   emoji: "🥣", kcal: 380, prepMin: 15, time: "7:30 AM"  }, lunch: { name: "Turkey wrap",    emoji: "🥙", kcal: 510, prepMin: 10, time: "12:30 PM" }, snack: { name: "Banana & PB",    emoji: "🍌", kcal: 220, prepMin: 5,  time: "3:30 PM"  }, dinner: { name: "Pasta & turkey", emoji: "🍝", kcal: 700, prepMin: 25, time: "7:00 PM"  } },
  { breakfast: { name: "Protein pancakes", emoji: "🥞", kcal: 420, prepMin: 20, time: "7:30 AM"  }, lunch: { name: "Caesar salad",   emoji: "🥗", kcal: 490, prepMin: 20, time: "12:30 PM" }, snack: { name: "Protein shake",  emoji: "🥛", kcal: 200, prepMin: 2,  time: "3:30 PM"  }, dinner: { name: "Steak & salad",  emoji: "🥩", kcal: 680, prepMin: 40, time: "7:00 PM"  } },
  { breakfast: { name: "Yogurt & granola", emoji: "🥣", kcal: 420, prepMin: 5,  time: "7:30 AM"  }, lunch: { name: "Chicken caesar", emoji: "🥗", kcal: 540, prepMin: 20, time: "12:30 PM" }, snack: { name: "Apple & almond", emoji: "🍎", kcal: 210, prepMin: 2,  time: "3:30 PM"  }, dinner: { name: "Baked salmon",   emoji: "🍗", kcal: 670, prepMin: 35, time: "7:00 PM"  } },
  { breakfast: { name: "Avocado toast",    emoji: "🥑", kcal: 350, prepMin: 10, time: "7:30 AM"  }, lunch: { name: "Quinoa bowl",    emoji: "🥗", kcal: 480, prepMin: 15, time: "12:30 PM" }, snack: { name: "Greek yogurt",   emoji: "🫙", kcal: 150, prepMin: 1,  time: "3:30 PM"  }, dinner: { name: "Grilled shrimp", emoji: "🍤", kcal: 520, prepMin: 25, time: "7:00 PM"  } },
  { breakfast: { name: "Smoothie bowl",    emoji: "🫐", kcal: 390, prepMin: 10, time: "7:30 AM"  }, lunch: { name: "BLT sandwich",   emoji: "🥪", kcal: 530, prepMin: 10, time: "12:30 PM" }, snack: { name: "Mixed fruit",    emoji: "🍇", kcal: 120, prepMin: 2,  time: "3:30 PM"  }, dinner: { name: "Chicken curry",  emoji: "🍛", kcal: 680, prepMin: 40, time: "7:00 PM"  } },
]

function getWeekDays(startDate: Date, weekLabel: string): DayItem[] {
  const days: DayItem[] = []
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const month = d.toLocaleDateString("en-US", { month: "short" })
    const num = d.getDate()
    const key = `${d.getFullYear()}-${d.getMonth()}-${num}`
    days.push({ key, label: dayLabels[d.getDay()], num, date: `${month} ${num}`, week: weekLabel })
  }
  return days
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const today = new Date()
const thisMonday = getMonday(today)
const lastMonday = new Date(thisMonday)
lastMonday.setDate(thisMonday.getDate() - 7)
const nextMonday = new Date(thisMonday)
nextMonday.setDate(thisMonday.getDate() + 7)

const LAST_WEEK = getWeekDays(lastMonday, "last")
const THIS_WEEK = getWeekDays(thisMonday, "this")
const NEXT_WEEK = getWeekDays(nextMonday, "next")
const ALL_DAYS = [...LAST_WEEK, ...THIS_WEEK, ...NEXT_WEEK]
const TODAY_KEY = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

const DEFAULT_MEALS = (() => {
  const meals: Record<string, MealItem> = {}
  ;[...THIS_WEEK].forEach((day, i) => {
    const template = MEAL_TEMPLATES[i % MEAL_TEMPLATES.length]
    MEAL_TYPES.forEach(type => {
      const m = template[type]
      meals[`${day.key}-${type}`] = {
        id: `${day.key}-${type[0]}`,
        name: m.name, emoji: m.emoji, kcal: m.kcal,
        prepMin: m.prepMin, time: m.time, type, notes: "",
      }
    })
  })
  return meals
})()

const STORAGE_KEY = "ai-life-os-meals"

async function loadMeals(): Promise<{ mealData: Record<string, MealItem>; isAuthenticated: boolean }> {
  try {
    const res = await fetch("/api/meals")
    if (res.status === 401) {
      const stored = localStorage.getItem(STORAGE_KEY)
      return { mealData: stored ? JSON.parse(stored) : {}, isAuthenticated: false }
    }
    if (!res.ok) return { mealData: {}, isAuthenticated: true }
    const data = await res.json()
    return { mealData: data.mealData || {}, isAuthenticated: true }
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY)
    return { mealData: stored ? JSON.parse(stored) : {}, isAuthenticated: false }
  }
}

async function saveMeal(dayKey: string, type: string, meal: MealItem) {
  try {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayKey, type, meal }),
    })
    if (res.status === 401) {
      const stored = localStorage.getItem(STORAGE_KEY)
      const data = stored ? JSON.parse(stored) : {}
      data[`${dayKey}-${type}`] = meal
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY)
    const data = stored ? JSON.parse(stored) : {}
    data[`${dayKey}-${type}`] = meal
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

async function deleteMealFromDB(dayKey: string, type: string) {
  try {
    const res = await fetch("/api/meals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayKey, type }),
    })
    if (res.status === 401) {
      const stored = localStorage.getItem(STORAGE_KEY)
      const data = stored ? JSON.parse(stored) : {}
      delete data[`${dayKey}-${type}`]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY)
    const data = stored ? JSON.parse(stored) : {}
    delete data[`${dayKey}-${type}`]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export default function MealPrepPage() {
  const [activeWeek, setActiveWeek] = useState("this")
  const [selectedDay, setSelectedDay] = useState(TODAY_KEY)
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null)
  const [mealData, setMealData] = useState<Record<string, MealItem | null>>({})
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([])
  const [editingNotes, setEditingNotes] = useState("")
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: "", emoji: "🍽️", kcal: 400, prepMin: 15,
    time: "12:00 PM", type: "lunch", notes: "", dayKey: TODAY_KEY,
  })
  const [emojiLoading, setEmojiLoading] = useState(false)
  const emojiTimer = { current: null as ReturnType<typeof setTimeout> | null }

  const DAYS = activeWeek === "last" ? LAST_WEEK : activeWeek === "this" ? THIS_WEEK : NEXT_WEEK

  useEffect(() => {
    loadMeals().then(({ mealData: stored, isAuthenticated }) => {
      const seeded = isAuthenticated ? { ...stored } : { ...DEFAULT_MEALS, ...stored }
      setMealData(seeded)
      if (!isAuthenticated) {
        try {
          const existing = localStorage.getItem(STORAGE_KEY)
          if (!existing) localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
        } catch {}
      }
      const todayBreakfast = seeded[`${TODAY_KEY}-breakfast`]
      if (todayBreakfast) setSelectedMeal(todayBreakfast)
    })
  }, [])

  function getMeal(dayKey: string, type: string): MealItem | null {
    return mealData[`${dayKey}-${type}`] ?? null
  }

  function setMeal(dayKey: string, type: string, meal: MealItem) {
    const key = `${dayKey}-${type}`
    setMealData(prev => ({ ...prev, [key]: meal }))
    setSelectedMeal(prev =>
      prev != null && (prev.id === meal?.id || (prev.type === type && dayKey === selectedDay))
        ? meal : prev
    )
    saveMeal(dayKey, type, meal)
  }

  function deleteMeal(dayKey: string, type: string) {
    const key = `${dayKey}-${type}`
    setMealData(prev => ({ ...prev, [key]: null }))
    setSelectedMeal(null)
    setEditingMeal(null)
    setEditingNotes("")
    setChatHistory([])
    deleteMealFromDB(dayKey, type)
  }

  function selectMeal(meal: MealItem) {
    setSelectedMeal(meal)
    setEditingNotes(meal?.notes || "")
    setEditingMeal(null)
    setChatHistory([])
  }

  function totalKcal(dayKey: string): number {
    return MEAL_TYPES.reduce((sum, t) => sum + (getMeal(dayKey, t)?.kcal ?? 0), 0)
  }

  function openAddModal(type: string, dayKey?: string) {
    const dk = dayKey || selectedDay
    setNewMeal({
      name: "", emoji: "🍽️", kcal: 400, prepMin: 15,
      time: type === "breakfast" ? "7:30 AM" : type === "lunch" ? "12:30 PM" : type === "snack" ? "3:30 PM" : "7:00 PM",
      type: type || "lunch", notes: "", dayKey: dk,
    })
    setEmojiLoading(false)
    setShowAddModal(true)
  }

  async function fetchEmoji(name: string) {
    if (!name || name.trim().length < 3) return
    setEmojiLoading(true)
    try {
      const res = await fetch("/api/meal-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Just pick ONE perfect food emoji for "${name}". Reply with only the emoji character, nothing else.`,
          meal: null, day: selectedDay, emojiOnly: true,
        }),
      })
      const data = await res.json()
      const emoji = data.meal?.emoji || data.response?.trim()
      if (emoji && emoji.trim().length > 0) setNewMeal(p => ({ ...p, emoji }))
    } catch { /* silent */ } finally {
      setEmojiLoading(false)
    }
  }

  function handleMealNameChange(name: string) {
    setNewMeal(p => ({ ...p, name }))
    if (emojiTimer.current) clearTimeout(emojiTimer.current)
    emojiTimer.current = setTimeout(() => fetchEmoji(name), 600)
  }

  function addMeal() {
    if (!newMeal.name?.trim() || !newMeal.type) return
    const meal: MealItem = {
      id: Date.now().toString(),
      name: newMeal.name, emoji: newMeal.emoji || "🍽️",
      kcal: newMeal.kcal || 0, prepMin: newMeal.prepMin || 0,
      time: newMeal.time || "12:00 PM", type: newMeal.type, notes: newMeal.notes || "",
    }
    const targetDay = newMeal.dayKey || selectedDay
    setMeal(targetDay, meal.type, meal)
    setSelectedMeal(meal)
    setSelectedDay(targetDay)
    setActiveWeek(NEXT_WEEK.some(d => d.key === targetDay) ? "next" : "this")
    setShowAddModal(false)
    setNewMeal({ name: "", emoji: "🍽️", kcal: 400, prepMin: 15, time: "12:00 PM", type: "lunch", notes: "", dayKey: TODAY_KEY })
  }

  async function handleAiSubmit() {
    if (!aiInput.trim()) return
    const userText = aiInput
    setAiLoading(true)
    setChatHistory(prev => [...prev, { role: "user", text: userText }])
    setAiInput("")
    try {
      const res = await fetch("/api/meal-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, meal: selectedMeal, day: selectedDay }),
      })
      const data = await res.json()
      const targetDay = data.targetDay || selectedDay

      if (data.action === "add" && data.meal) {
        const m: MealItem = { id: Date.now().toString(), ...data.meal }
        setMeal(targetDay, m.type, m)
        setSelectedMeal(m)
        setSelectedDay(targetDay)
        setActiveWeek(NEXT_WEEK.some(d => d.key === targetDay) ? "next" : "this")
      } else if (data.action === "update") {
        const targetType = data.meals?.[0]?.type || data.meal?.type || selectedMeal?.type
        const updateDay = data.targetDay || selectedDay
        const baseMeal = getMeal(updateDay, targetType) || selectedMeal
        if (baseMeal) {
          const mealUpdate = data.meals?.[0] || data.meal || {}
          const updated: MealItem = { ...baseMeal, ...mealUpdate, id: baseMeal.id, type: targetType }
          setMeal(updateDay, targetType, updated)
          setSelectedMeal(updated)
          setSelectedDay(updateDay)
          setActiveWeek(NEXT_WEEK.some(d => d.key === updateDay) ? "next" : "this")
          setEditingNotes(updated.notes || "")
          setEditingMeal(null)
        }
      }

      setChatHistory(prev => [...prev, { role: "ai", text: data.response || "Done!" }])
    } catch {
      setChatHistory(prev => [...prev, { role: "ai", text: "Something went wrong. Try again." }])
    } finally {
      setAiLoading(false)
    }
  }

  const selectedDayData = ALL_DAYS.find(d => d.key === selectedDay) || THIS_WEEK[0]
  const total = totalKcal(selectedDay)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="meal" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="bg-white border-b border-gray-100 px-5 flex items-center justify-between py-3 flex-shrink-0">
          <p className="text-lg font-medium text-gray-800">Meal </p>
          <button onClick={() => openAddModal("lunch", selectedDay)}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2 rounded-full hover:bg-brand-800 transition-colors">
            <Plus size={12} /> Add meal
          </button>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center flex-shrink-0">
          <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
            {[
              { key: "last", label: "Last week", sub: `${LAST_WEEK[0].date}–${LAST_WEEK[6].date}` },
              { key: "this", label: "This week", sub: `${THIS_WEEK[0].date}–${THIS_WEEK[6].date}` },
              { key: "next", label: "Next week", sub: `${NEXT_WEEK[0].date}–${NEXT_WEEK[6].date}` },
            ].map(w => (
              <button key={w.key}
                onClick={() => {
                  setActiveWeek(w.key)
                  setSelectedDay(w.key === "this" ? TODAY_KEY : w.key === "last" ? LAST_WEEK[0].key : NEXT_WEEK[0].key)
                  setSelectedMeal(null)
                  setEditingMeal(null)
                  setEditingNotes("")
                  setChatHistory([])
                }}
                className={cn("px-3 py-1 rounded-full text-sm transition-colors",
                  activeWeek === w.key ? "bg-white text-brand-600 font-medium shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}>
                {w.label}
                <span className="ml-1 text-[10px] text-gray-400">{w.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          <div className="flex-1 flex flex-col overflow-hidden bg-white border-r border-gray-100">
            <div className="flex border-b border-gray-100 flex-shrink-0">
              <div className="w-[72px] flex-shrink-0 border-r border-gray-100 bg-gray-50" />
              {MEAL_TYPES.map(type => {
                const c = MEAL_COLORS[type]
                return (
                  <div key={type} className={cn("flex-1 text-center py-2.5 text-[10px] font-semibold tracking-wider border-r last:border-r-0 border-gray-100", c.header, c.headerText)}>
                    {MEAL_LABELS[type]}
                  </div>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto">
              {DAYS.map(day => {
                const isToday = day.key === TODAY_KEY
                const isSelected = day.key === selectedDay
                return (
                  <div key={day.key}
                    onClick={() => { setSelectedDay(day.key); setSelectedMeal(null); setEditingMeal(null); setEditingNotes(""); setChatHistory([]) }}
                    className={cn("flex border-b border-gray-50 min-h-[72px] cursor-pointer transition-colors",
                      isSelected ? "bg-brand-50/40" : "hover:bg-gray-50/60")}>
                    <div className={cn("w-[72px] min-w-[72px] max-w-[72px] flex-shrink-0 flex flex-col items-center justify-center gap-0.5 border-r border-gray-100",
                      isSelected ? "bg-brand-50" : "bg-gray-50")}>
                      <span className="text-[10px] text-gray-400 uppercase">{day.label}</span>
                      <div className={cn("text-sm font-medium flex items-center justify-center",
                        isToday ? "w-7 h-7 rounded-full bg-brand-600 text-white text-xs"
                          : isSelected ? "text-brand-600 font-semibold" : "text-gray-500")}>
                        {day.num}
                      </div>
                    </div>
                    {MEAL_TYPES.map(type => {
                      const meal = getMeal(day.key, type)
                      const c = MEAL_COLORS[type]
                      return (
                        <div key={type}
                          onClick={e => { e.stopPropagation(); setSelectedDay(day.key); if (meal) selectMeal(meal); else openAddModal(type, day.key) }}
                          className="flex-1 p-1.5 border-r last:border-r-0 border-gray-100 flex items-center min-w-0 overflow-hidden">
                          {meal ? (
                            <div className={cn("w-full min-w-0 rounded-lg px-2 py-1.5 border-l-2 overflow-hidden", c.bg, c.border)}>
                              <p className={cn("text-[11px] font-medium truncate", c.text)}>{meal.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{meal.kcal} kcal</p>
                            </div>
                          ) : (
                            <div className="w-full rounded-lg border border-dashed border-gray-200 py-1.5 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                              <span className="text-[10px] text-gray-300">+ Add</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-[#F5F4F0]">
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-medium text-gray-800">{selectedDayData.label}, {selectedDayData.date}</p>
              {total > 0 && <p className="text-sm font-medium text-brand-600">{total.toLocaleString()} kcal total</p>}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
              {MEAL_TYPES.map(type => {
                const meal = getMeal(selectedDay, type)
                const c = MEAL_COLORS[type]
                const isSelected = selectedMeal != null && meal != null && selectedMeal.id === meal.id
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className={cn("text-[9px] font-semibold tracking-wider", c.text)}>{MEAL_LABELS[type]}</p>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    {meal ? (
                      <div className={cn("bg-white border-l-2 rounded-xl border transition-all overflow-hidden",
                        isSelected ? "border-brand-300 ring-1 ring-brand-200" : "border-gray-100 hover:shadow-sm cursor-pointer",
                        c.border)}>
                        <div onClick={() => selectMeal(meal)} className="px-3 py-2.5 flex items-center gap-3 cursor-pointer min-w-0">
                          <span className="text-xl flex-shrink-0">{meal.emoji}</span>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-xs font-medium text-gray-800 truncate">{meal.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{meal.time} · {meal.prepMin} min</p>
                          </div>
                          <p className="text-xs font-medium text-brand-600 flex-shrink-0 ml-2">{meal.kcal} kcal</p>
                        </div>

                        {isSelected && (
                          <div className="border-t border-gray-50">
                            {editingMeal ? (
                              <div className="px-3 py-3 flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <input value={editingMeal.emoji} onChange={e => setEditingMeal(p => p ? ({ ...p, emoji: e.target.value }) : p)}
                                    className="w-10 border border-gray-200 rounded-lg text-base text-center outline-none focus:border-brand-300 bg-gray-50" />
                                  <input value={editingMeal.name} onChange={e => setEditingMeal(p => p ? ({ ...p, name: e.target.value }) : p)}
                                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50 text-gray-800" placeholder="Meal name" />
                                </div>
                                <div className="flex gap-1.5">
                                  <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 mb-1">Time</p>
                                    <input value={editingMeal.time} onChange={e => setEditingMeal(p => p ? ({ ...p, time: e.target.value }) : p)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] outline-none focus:border-brand-300 bg-gray-50 text-gray-800" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 mb-1">Prep (min)</p>
                                    <input type="number" value={editingMeal.prepMin} onChange={e => setEditingMeal(p => p ? ({ ...p, prepMin: Number(e.target.value) }) : p)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] outline-none focus:border-brand-300 bg-gray-50 text-gray-800" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 mb-1">Calories</p>
                                    <input type="number" value={editingMeal.kcal} onChange={e => setEditingMeal(p => p ? ({ ...p, kcal: Number(e.target.value) }) : p)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] outline-none focus:border-brand-300 bg-gray-50 text-gray-800" />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 mb-1">Type</p>
                                  <div className="flex gap-1 flex-wrap">
                                    {MEAL_TYPES.map(t => (
                                      <button key={t} onClick={() => setEditingMeal(p => p ? ({ ...p, type: t }) : p)}
                                        className={cn("text-[10px] px-2 py-0.5 rounded-full border capitalize transition-colors",
                                          editingMeal.type === t ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-400 hover:border-gray-300")}>
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 mb-1">Notes</p>
                                  <textarea value={editingMeal.notes} onChange={e => setEditingMeal(p => p ? ({ ...p, notes: e.target.value }) : p)} placeholder="Add notes…" rows={2}
                                    className="w-full text-[11px] text-gray-700 placeholder-gray-300 border border-gray-100 rounded-lg px-2.5 py-2 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed" />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => { setMeal(selectedDay, editingMeal.type, editingMeal); setSelectedMeal(editingMeal); setEditingNotes(editingMeal.notes || ""); setEditingMeal(null) }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] bg-brand-600 text-white rounded-lg hover:bg-brand-800 transition-colors">
                                    <Check size={11} /> Save
                                  </button>
                                  <button onClick={() => setEditingMeal(null)} className="flex-1 py-1.5 text-[11px] border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <button onClick={() => setEditingMeal({ ...meal, notes: editingNotes })}
                                    className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-800 transition-colors">
                                    <Edit2 size={10} /> Edit meal
                                  </button>
                                  <button onClick={() => deleteMeal(selectedDay, meal.type)}
                                    className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 size={10} /> Delete
                                  </button>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
                                  <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)}
                                    onBlur={() => { if (!selectedMeal) return; const u = { ...selectedMeal, notes: editingNotes }; setMeal(selectedDay, selectedMeal.type, u); setSelectedMeal(u) }}
                                    placeholder="Add notes for this meal…" rows={2}
                                    className="w-full text-[11px] text-gray-700 placeholder-gray-300 border border-gray-100 rounded-lg px-2.5 py-2 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!isSelected && meal.notes && (
                          <div onClick={() => selectMeal(meal)} className="px-3 pb-2 cursor-pointer overflow-hidden">
                            <p className="text-[10px] text-gray-400 italic truncate">{meal.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div onClick={() => openAddModal(type, selectedDay)}
                        className="bg-white border border-dashed border-gray-200 rounded-xl px-3 py-2.5 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                        <span className="text-[11px] text-gray-300">+ Add {type}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {total > 0 && (
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-gray-500">Total calories</p>
                <p className="text-sm font-medium text-brand-600">{total.toLocaleString()} kcal</p>
              </div>
            )}
          </div>

          <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex-shrink-0 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}>
              <Sparkles size={14} className="text-white" />
              <span className="text-sm font-medium text-white">Add meal with AI</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
              {!selectedMeal && chatHistory.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                    <Sparkles size={20} className="text-brand-400" />
                  </div>
                  <p className="text-xs text-gray-500 text-center leading-relaxed px-2">
                    Describe a meal in plain English and I&apos;ll add it with the right time, type and calories.
                  </p>
                </div>
              )}

              {chatHistory.length === 0 && (
                <div className="flex flex-col gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {["Click any meal on the left to edit it", "Or type below to add a new meal"].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] text-brand-600 font-bold">{i + 1}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedMeal && (
                <div className="bg-brand-50 rounded-xl p-3">
                  <p className="text-[9px] text-brand-400 uppercase tracking-wider mb-1">Editing</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedMeal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-800 truncate">{selectedMeal.name}</p>
                      <p className="text-[10px] text-brand-600 mt-0.5">{selectedMeal.time} · {selectedMeal.kcal} kcal</p>
                    </div>
                    <button onClick={() => { setSelectedMeal(null); setEditingMeal(null); setEditingNotes(""); setChatHistory([]) }}
                      className="text-brand-300 hover:text-brand-600">
                      <X size={12} />
                    </button>
                  </div>
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
                  {(selectedMeal ? ["Change to 600 kcal", "Move to 8pm", "Rename to Salmon bowl", "Add prep notes"]
                    : ["Add a high protein breakfast", "Plan lunch for tomorrow", "Suggest a low carb dinner", "Add a post-workout snack"]
                  ).map(s => (
                    <button key={s} onClick={() => setAiInput(`"${s}"`)}
                      className="text-left text-[10px] px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                      &quot;{s}&quot;
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiSubmit()}
                placeholder={selectedMeal ? "e.g. change to 600 kcal…" : "e.g. add salmon for dinner…"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">New meal</p>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative w-14 flex-shrink-0">
                  <div className={cn("w-14 h-full min-h-[44px] border border-gray-200 rounded-xl text-lg text-center flex items-center justify-center transition-all",
                    emojiLoading ? "bg-gray-50 animate-pulse" : "bg-white")}>
                    {emojiLoading ? <span className="text-gray-300 text-sm">✦</span> : <span>{newMeal.emoji}</span>}
                  </div>
                </div>
                <input placeholder="Meal name" value={newMeal.name} onChange={e => handleMealNameChange(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300" autoFocus />
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Day</p>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-[9px] text-gray-300 uppercase tracking-wider mb-1">This week</p>
                    <div className="flex gap-1 flex-wrap">
                      {THIS_WEEK.map(d => (
                        <button key={d.key} onClick={() => setNewMeal(p => ({ ...p, dayKey: d.key }))}
                          className={cn("flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center transition-colors min-w-[38px]",
                            newMeal.dayKey === d.key ? "bg-brand-600 border-brand-600 text-white" : "border-gray-200 text-gray-500 hover:border-brand-200 hover:bg-brand-50")}>
                          <span className="text-[9px] leading-none">{d.label}</span>
                          <span className={cn("text-xs font-medium leading-tight", d.key === TODAY_KEY && newMeal.dayKey !== d.key ? "text-brand-600" : "")}>{d.num}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-300 uppercase tracking-wider mb-1">Next week</p>
                    <div className="flex gap-1 flex-wrap">
                      {NEXT_WEEK.map(d => (
                        <button key={d.key} onClick={() => setNewMeal(p => ({ ...p, dayKey: d.key }))}
                          className={cn("flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center transition-colors min-w-[38px]",
                            newMeal.dayKey === d.key ? "bg-brand-600 border-brand-600 text-white" : "border-gray-200 text-gray-500 hover:border-brand-200 hover:bg-brand-50")}>
                          <span className="text-[9px] leading-none">{d.label}</span>
                          <span className="text-xs font-medium leading-tight">{d.num}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Time</p>
                  <input value={newMeal.time} onChange={e => setNewMeal(p => ({ ...p, time: e.target.value }))} placeholder="7:30 AM"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Prep (min)</p>
                  <input type="number" value={newMeal.prepMin} onChange={e => setNewMeal(p => ({ ...p, prepMin: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1">Calories</p>
                  <input type="number" value={newMeal.kcal} onChange={e => setNewMeal(p => ({ ...p, kcal: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-gray-50" />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Meal type</p>
                <div className="flex gap-1.5 flex-wrap">
                  {MEAL_TYPES.map(t => (
                    <button key={t} onClick={() => setNewMeal(p => ({ ...p, type: t }))}
                      className={cn("text-[10px] px-2.5 py-1 rounded-full border capitalize transition-colors",
                        newMeal.type === t ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <textarea placeholder="Notes (optional)" value={newMeal.notes} onChange={e => setNewMeal(p => ({ ...p, notes: e.target.value }))} rows={2}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-brand-300 resize-none text-gray-700 placeholder-gray-300" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-xs border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={addMeal} disabled={!newMeal.name?.trim()} className="flex-1 py-2 text-xs bg-brand-600 text-white rounded-xl hover:bg-brand-800 disabled:opacity-40 transition-colors">Add meal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}