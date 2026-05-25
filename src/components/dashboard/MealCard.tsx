"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"]
const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-brand-50 text-brand-700",
  lunch:     "bg-teal-50 text-teal-700",
  snack:     "bg-blue-50 text-blue-700",
  dinner:    "bg-amber-50 text-amber-700",
}

export function MealCard() {
  const [meals, setMeals] = useState<Record<string, any>>({})
  const [totalKcal, setTotalKcal] = useState(0)

  const load = useCallback(async () => {
    const t = new Date()
    const todayKey = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`

    // Try API (signed in)
    try {
      const res = await fetch("/api/meals")
      if (res.ok) {
        const data = await res.json()
        const mealData = data.mealData || {}
        const todayMeals: Record<string, any> = {}
        let kcal = 0
        MEAL_TYPES.forEach(type => {
          const meal = mealData[`${todayKey}-${type}`]
          if (meal) { todayMeals[type] = meal; kcal += meal.kcal || 0 }
        })
        setMeals(todayMeals)
        setTotalKcal(kcal)
        return
      }
    } catch {}

    // Try localStorage (not signed in) — defaults seeded by meal page
    try {
      const stored = localStorage.getItem("ai-life-os-meals")
      if (stored) {
        const parsed = JSON.parse(stored)
        const todayMeals: Record<string, any> = {}
        let kcal = 0
        MEAL_TYPES.forEach(type => {
          const meal = parsed[`${todayKey}-${type}`]
          if (meal) { todayMeals[type] = meal; kcal += meal.kcal || 0 }
        })
        setMeals(todayMeals)
        setTotalKcal(kcal)
      }
    } catch {}
  }, [])

  useEffect(() => {
    load()
    window.addEventListener("focus", load)
    return () => window.removeEventListener("focus", load)
  }, [load])

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-gray-800 flex items-center gap-1.5">
          Meals
          {totalKcal > 0 && (
            <span className="text-[10px] text-gray-400 font-normal">{totalKcal} kcal today</span>
          )}
        </p>
        <Link href="/meal" className="text-[10px] text-brand-600 hover:text-brand-800">
          View →
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        {MEAL_TYPES.map(type => {
          const meal = meals[type]
          return (
            <div key={type} className="flex items-center gap-2">
              <span className={`text-[8px] font-semibold uppercase tracking-wider w-14 flex-shrink-0 px-1.5 py-0.5 rounded-full text-center ${MEAL_COLORS[type]}`}>
                {type}
              </span>
              {meal ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-sm">{meal.emoji}</span>
                  <span className="text-[11px] text-gray-700 truncate flex-1">{meal.name}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{meal.kcal} kcal</span>
                </div>
              ) : (
                <Link href="/meal" className="text-[10px] text-gray-300 hover:text-brand-400 transition-colors">
                  + Add {type}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}