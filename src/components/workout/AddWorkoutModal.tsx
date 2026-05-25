"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type WorkoutCategory = "strength" | "cardio" | "mobility" | "hiit" | "recovery" | "rest"

interface StrengthExercise {
  name: string
  sets: string
  reps: string
  weight: string
}

interface CardioExercise {
  name: string
  duration: string
  distance: string
}

interface WorkoutForm {
  name: string
  name2: string
  category: WorkoutCategory
  date: string
  time: string
  duration: string
  kcal:string
  notes: string
  strengthExercises: StrengthExercise[]
  cardioExercises: CardioExercise[]
}

const CATEGORIES: { key: WorkoutCategory; label: string; emoji: string }[] = [
  { key: "strength",  label: "Strength",  emoji: "🏋️" },
  { key: "cardio",    label: "Cardio",    emoji: "🏃" },
  { key: "mobility",  label: "Mobility",  emoji: "🧘" },
  { key: "hiit",      label: "HIIT",      emoji: "⚡" },
  { key: "recovery",  label: "Recovery",  emoji: "💆" },
  { key: "rest",      label: "Rest Day",  emoji: "😴" },
]

const STRENGTH_SUGGESTIONS = ["Bench Press", "Squat", "Deadlift", "Pull Ups", "Shoulder Press", "Barbell Row", "Leg Press", "Bicep Curl"]
const CARDIO_SUGGESTIONS   = ["Running", "Cycling", "Swimming", "Jump Rope", "Rowing"]

function today() {
  return new Date().toISOString().split("T")[0]
}

interface Props {
  onClose: () => void
  onAdd: (workout: WorkoutForm) => void
  defaultDate?: string
}

export default function AddWorkoutModal({ onClose, onAdd, defaultDate }: Props) {
  const [form, setForm] = useState<WorkoutForm>({
    name: "",
    name2: "",
    category: "strength",
    date: defaultDate ?? today(),
    time: "06:00",
    duration: "45",
    kcal:"550",
    notes: "",
    strengthExercises: [{ name: "", sets: "4", reps: "8", weight: "" }],
    cardioExercises:   [{ name: "", duration: "30", distance: "" }],
  })

  const isCardio = form.category === "cardio"

  function setField<K extends keyof WorkoutForm>(key: K, val: WorkoutForm[K]) {
    setForm(p => ({ ...p, [key]: val }))
  }

  // ── Strength exercises ───────────────────────────────────────────────────
  function addStrength() {
    setField("strengthExercises", [...form.strengthExercises, { name: "", sets: "4", reps: "8", weight: "" }])
  }
  function updateStrength(i: number, key: keyof StrengthExercise, val: string) {
    setField("strengthExercises", form.strengthExercises.map((e, j) => j === i ? { ...e, [key]: val } : e))
  }
  function removeStrength(i: number) {
    setField("strengthExercises", form.strengthExercises.filter((_, j) => j !== i))
  }

  // ── Cardio exercises ─────────────────────────────────────────────────────
  function addCardio() {
    setField("cardioExercises", [...form.cardioExercises, { name: "", duration: "30", distance: "" }])
  }
  function updateCardio(i: number, key: keyof CardioExercise, val: string) {
    setField("cardioExercises", form.cardioExercises.map((e, j) => j === i ? { ...e, [key]: val } : e))
  }
  function removeCardio(i: number) {
    setField("cardioExercises", form.cardioExercises.filter((_, j) => j !== i))
  }

  function handleAdd() {
    if (!form.name.trim()) return
    onAdd(form)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">Add Workout</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

          {/* 1. Name */}
          <div>
            <Label step={1}>Workout Name</Label>
            <input
              autoFocus
              value={form.name}
              onChange={e => setField("name", e.target.value)}
              placeholder="Push Day, Leg Day, Morning Run…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300 mt-1.5 placeholder-gray-300"
            />
          </div>

          {/* Subtitle */}
          <div>
            <Label step={3}>Subtitle <span className="text-gray-300 font-normal">(optional)</span></Label>
            <input
              value={form.name2 ?? ""}
              onChange={e => setForm(p => ({ ...p, name2: e.target.value }))}
              placeholder="e.g. Chest + Shoulders, Back + Biceps…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300 mt-1.5 placeholder-gray-300"
            />
          </div>

          {/* 3. Date & Time */}
          <div>
            <Label step={3}>Date & Time</Label>
            <div className="flex gap-2 mt-1.5">
              <input
                type="date"
                value={form.date}
                onChange={e => setField("date", e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-gray-50 text-gray-700"
              />
              <input
                type="time"
                value={form.time}
                onChange={e => setField("time", e.target.value)}
                className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-gray-50 text-gray-700"
              />
            </div>
          </div>

                    {/* 2. Type */}
          <div>
            <Label>Workout Type</Label>
            <div className="flex gap-2 flex-wrap mt-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setField("category", c.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                    form.category === c.key
                      ? "bg-brand-600 text-white border-brand-600"
                      : "border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600"
                  )}
                >
                  <span>{c.emoji}</span>{c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Duration  & calories*/}
        <div>
          <Label step={4}>Duration & Calories</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.duration}
                onChange={e => setField("duration", e.target.value)}
                className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-gray-50 text-gray-700"
              />
              <span className="text-sm text-gray-400">mins</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.kcal ?? ""}
                onChange={e => setField("kcal", e.target.value)}
                placeholder="0"
                className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-300 bg-gray-50 text-gray-700"
              />
              <span className="text-sm text-gray-400">kcal</span>
            </div>
          </div>
        </div>

          {/* 5. Exercises */}
          {form.category !== "rest" && <div>
            <div className="flex items-center justify-between mb-2">
              <Label step={5}>Exercises</Label>
              <button
                onClick={isCardio ? addCardio : addStrength}
                className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-800 font-medium transition-colors"
              >
                <Plus size={12} /> Add exercise
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {isCardio ? (
                // ── Cardio cards ──
                form.cardioExercises.map((ex, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        list={`cardio-suggestions-${i}`}
                        value={ex.name}
                        onChange={e => updateCardio(i, "name", e.target.value)}
                        placeholder="Running, Cycling…"
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-white font-medium"
                      />
                      <datalist id={`cardio-suggestions-${i}`}>
                        {CARDIO_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                      </datalist>
                      {form.cardioExercises.length > 1 && (
                        <button onClick={() => removeCardio(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Duration (min)</p>
                        <input
                          type="number"
                          value={ex.duration}
                          onChange={e => updateCardio(i, "duration", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Distance (km)</p>
                        <input
                          type="number"
                          step="0.1"
                          value={ex.distance}
                          onChange={e => updateCardio(i, "distance", e.target.value)}
                          placeholder="—"
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center placeholder-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // ── Strength cards ──
                form.strengthExercises.map((ex, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        list={`strength-suggestions-${i}`}
                        value={ex.name}
                        onChange={e => updateStrength(i, "name", e.target.value)}
                        placeholder="Bench Press, Squat…"
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-300 bg-white font-medium"
                      />
                      <datalist id={`strength-suggestions-${i}`}>
                        {STRENGTH_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                      </datalist>
                      {form.strengthExercises.length > 1 && (
                        <button onClick={() => removeStrength(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Sets</p>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={e => updateStrength(i, "sets", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Reps</p>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={e => updateStrength(i, "reps", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Weight (kg)</p>
                        <input
                          type="number"
                          value={ex.weight}
                          onChange={e => updateStrength(i, "weight", e.target.value)}
                          placeholder="—"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 bg-white text-center placeholder-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
             </div>}

          {/* 6. Notes */}
          <div>
            <Label step={6}>Notes <span className="text-gray-300 font-normal">(optional)</span></Label>
            <textarea
              value={form.notes}
              onChange={e => setField("notes", e.target.value)}
              placeholder="Focus on form, increase weight next week…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-brand-300 mt-1.5 resize-none text-gray-700 placeholder-gray-300 leading-relaxed"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 text-xs bg-brand-600 text-white rounded-xl hover:bg-brand-800 disabled:opacity-40 transition-colors font-medium"
          >
            Add workout
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ step, children }: { step: number; children: React.ReactNode }) {
  return <p className="text-xs font-medium text-gray-700">{children}</p>
}
