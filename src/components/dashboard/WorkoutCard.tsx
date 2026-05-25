"use client"

import { useState, useEffect } from "react"
import { Dumbbell } from "lucide-react"
import Link from "next/link"

interface WorkoutData {
  label: string
  sub: string
  duration: number
  kcal: number
  status: string
  type: string
  exercises: { name: string; sets?: string }[]
}

export function WorkoutCard() {
  const [workout, setWorkout] = useState<WorkoutData | null>(null)

useEffect(() => {
  async function load() {
    try {
      const res = await fetch("/api/workouts")
      if (res.ok) {
        const data = await res.json()
        const t = new Date()
        const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
        setWorkout(data.workouts[key] ?? null)
        return
      }
    } catch {}
    try {
      const stored = localStorage.getItem("life-os-workouts")
      if (stored) {
        const parsed = JSON.parse(stored)
        const t = new Date()
        const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
        setWorkout(parsed[key] ?? null)
      }
    } catch {}
  }
  load()
}, [])

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-gray-800 flex items-center gap-1.5">
            Workout
        </p>
        <Link href="/workout" className="text-[10px] text-brand-600 hover:text-brand-800">
          View →
        </Link>
      </div>

      {!workout ? (
        <div className="flex flex-col items-center justify-center py-4 gap-1">
          <Dumbbell size={20} className="text-gray-200" />
          <p className="text-[11px] text-gray-400">No workout planned today</p>
          <Link href="/workout" className="text-[10px] text-brand-600 hover:text-brand-800 mt-1">
            + Add workout
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{workout.label}</p>
              {workout.sub && <p className="text-[10px] text-gray-400 mt-0.5">{workout.sub}</p>}
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium capitalize ${
              workout.status === "done" ? "bg-green-100 text-green-700" :
              workout.status === "progress" ? "bg-brand-100 text-brand-700" :
              "bg-gray-100 text-gray-500"
            }`}>
              {workout.status}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs font-medium text-gray-800">{workout.duration}</p>
              <p className="text-[9px] text-gray-400">min</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs font-medium text-gray-800">{workout.kcal}</p>
              <p className="text-[9px] text-gray-400">kcal</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs font-medium text-gray-800">{workout.exercises?.length ?? 0}</p>
              <p className="text-[9px] text-gray-400">exercises</p>
            </div>
          </div>

        </>
      )}
    </div>
  )
}