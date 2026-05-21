"use client"

import { useState, useEffect, useRef } from "react"
import { X, Check } from "lucide-react"
import { Task, TAG_OPTIONS, PRIORITY_OPTIONS, Priority, TagColor } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const TAG_STYLES: Record<TagColor, string> = {
  purple: "bg-brand-50 text-brand-800",
  teal:   "bg-teal-50 text-teal-800",
  amber:  "bg-amber2-50 text-amber2-800",
  coral:  "bg-coral-50 text-coral-800",
  gray:   "bg-gray-100 text-gray-500",
}

const TAG_ACTIVE: Record<TagColor, string> = {
  purple: "bg-brand-600 text-white",
  teal:   "bg-teal-600 text-white",
  amber:  "bg-amber-600 text-white",
  coral:  "bg-red-500 text-white",
  gray:   "bg-gray-500 text-white",
}

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void
  defaultDueDate?: string
}

export function AddTaskModal({ open, onClose, onAdd, defaultDueDate }: Props) {
  const [text, setText] = useState("")
  const [tag, setTag] = useState(TAG_OPTIONS[0])
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState(defaultDueDate || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setText("")
      setDueDate(defaultDueDate || "")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, defaultDueDate])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit()
    if (e.key === "Escape") onClose()
  }

  function submit() {
    if (!text.trim()) return
    onAdd({
      text: text.trim(),
      done: false,
      tag: tag.label,
      tagColor: tag.color,
      priority,
      dueDate: dueDate || null,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-md mx-4 p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-800">New task</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Task input */}
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="What needs to be done?"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-300 mb-4"
        />

        {/* Priority */}
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Priority</p>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map(p => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors",
                  priority === p.value
                    ? "border-transparent text-white"
                    : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100"
                )}
                style={priority === p.value ? { background: p.color, borderColor: p.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag */}
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Tag</p>
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map(t => (
              <button
                key={t.label}
                onClick={() => setTag(t)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full transition-colors",
                  tag.label === t.label ? TAG_ACTIVE[t.color] : TAG_STYLES[t.color]
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="mb-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Due date</p>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-300"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-brand-600 text-white rounded-xl hover:bg-brand-800 disabled:opacity-40 transition-colors"
          >
            <Check size={12} /> Add task
          </button>
        </div>
      </div>
    </div>
  )
}
