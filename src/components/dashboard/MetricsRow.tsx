"use client"

import { useState, useEffect } from "react"
import { useTasks } from "@/hooks/useTasks"

export function MetricsRow() {
  const { tasks } = useTasks()

  const [todayWorkout, setTodayWorkout] = useState<{ label: string; duration: number; kcal: number } | null>(null)
  const [todayKcal, setTodayKcal] = useState(0)
  const [todayMealCount, setTodayMealCount] = useState(0)
  const [todayMeals, setTodayMeals] = useState<any[]>([])

  useEffect(() => {
    const t = new Date()
    const todayKey = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"]

    // Workout — always localStorage
    try {
      const stored = localStorage.getItem("life-os-workouts")
      if (stored) {
        const parsed = JSON.parse(stored)
        setTodayWorkout(parsed[todayKey] ?? null)
      }
    } catch {}

    // Meals — API if logged in, else localStorage
    async function loadMeals() {
      try {
        const res = await fetch("/api/meals")
        if (res.ok) {
          const data = await res.json()
          const mealData = data.mealData || {}
          let kcal = 0, count = 0
          const meals: any[] = []
          mealTypes.forEach(type => {
            const meal = mealData[`${todayKey}-${type}`]
            if (meal) { kcal += meal.kcal || 0; count++; meals.push(meal) }
          })
          setTodayKcal(kcal)
          setTodayMealCount(count)
          setTodayMeals(meals)
          return
        }
      } catch {}

      // Not logged in — fallback to localStorage
      try {
        const stored = localStorage.getItem("ai-life-os-meals")
        if (stored) {
          const parsed = JSON.parse(stored)
          let kcal = 0, count = 0
          const meals: any[] = []
          mealTypes.forEach(type => {
            const meal = parsed[`${todayKey}-${type}`]
            if (meal) { kcal += meal.kcal || 0; count++; meals.push(meal) }
          })
          setTodayKcal(kcal)
          setTodayMealCount(count)
          setTodayMeals(meals)
        }
      } catch {}
    }

    loadMeals()
  }, [])

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`

  const relevantTasks = tasks.filter(t => {
    if (t.dueDate === null) return false
    if (t.dueDate === today) return true
    if (t.dueDate < today && !t.done) return true
    return false
  })

  const total = relevantTasks.length
  const done = relevantTasks.filter(t => t.done).length
  const focusScore = total > 0 ? Math.round((done / total) * 100) : 0

  const CARDS = [
    { label: "Tasks today",   value: total,            sub: `${done} done`,      dotColor: "#1D9E75" },
    { label: "Unread emails", value: 12,               sub: "2 urgent",          dotColor: "#D85A30" },
    { label: "Meetings",      value: 3,                sub: "Next 10 AM",        dotColor: "#534AB7" },
    { label: "Focus score",   value: `${focusScore}%`, sub: "Today",             dotColor: "#BA7517" },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {CARDS.map(({ label, value, sub, dotColor }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3">
          <p className="text-[9px] text-gray-400 mb-1">{label}</p>
          <p className="text-lg font-medium text-gray-800 leading-tight">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
            <span className="text-[9px] text-gray-500">{sub}</span>
          </div>
        </div>
      ))}

    </div>
  )
}