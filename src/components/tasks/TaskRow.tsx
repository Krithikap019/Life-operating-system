"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Trash2 } from "lucide-react"
import { Task, TagColor, PRIORITY_OPTIONS } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const TAG_STYLES: Record<TagColor, string> = {
  purple: "bg-brand-50 text-brand-800",
  teal:   "bg-teal-50 text-teal-800",
  amber:  "bg-amber2-50 text-amber2-800",
  coral:  "bg-coral-50 text-coral-800",
  gray:   "bg-gray-100 text-gray-500",
}

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
}

function formatDue(dueDate: string | null): { label: string; overdue: boolean } {
  if (!dueDate) return { label: "", overdue: false }
  const [y, m, d] = dueDate.split("-").map(Number)
  const due = new Date(y, m - 1, d)
  const today = localToday()

  if (dueDate < today) return { label: "Overdue", overdue: true }
  if (dueDate === today) return { label: "Today", overdue: false }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((due.getTime() - todayStart.getTime()) / 86400000)
  if (diff === 1) return { label: "Tomorrow", overdue: false }
  if (diff <= 6) return { label: due.toLocaleDateString("en-US", { weekday: "short" }), overdue: false }
  return { label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue: false }
}

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function TaskRow({ task, onToggle, onDelete, onUpdate }: Props) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)
  const due = formatDue(task.dueDate)
  const priorityColor = PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color || "#B4B2A9"

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEdit() {
    if (task.done) return
    setEditText(task.text)
    setEditing(true)
  }

  function saveEdit() {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(task.id, { text: trimmed })
    }
    setEditing(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveEdit()
    if (e.key === "Escape") {
      setEditText(task.text)
      setEditing(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 transition-colors group",
        task.done ? "opacity-50" : "hover:bg-gray-50/70"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors",
          task.done ? "bg-brand-50 border-brand-200" : "border-gray-200 hover:border-brand-300"
        )}
      >
        {task.done && <Check size={9} className="text-brand-600" />}
      </button>

      {/* Priority dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: priorityColor }}
      />

      {/* Task text — click to edit */}
      {editing ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={handleKey}
          onBlur={saveEdit}
          className="flex-1 text-sm text-gray-800 border border-brand-300 rounded-lg px-2 py-0.5 outline-none bg-white min-w-0"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          title="Double-click to edit"
          className={cn(
            "flex-1 text-sm min-w-0 truncate cursor-text",
            task.done ? "line-through text-gray-400" : "text-gray-800"
          )}
        >
          {task.text}
        </span>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full", TAG_STYLES[task.tagColor])}>
          {task.tag}
        </span>
        {due.label && (
          <span className={cn(
            "text-[11px] min-w-[52px] text-right",
            due.overdue ? "text-red-500 font-medium" : "text-gray-400"
          )}>
            {due.label}
          </span>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className={cn(
            "text-gray-300 hover:text-red-400 transition-all",
            hovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}