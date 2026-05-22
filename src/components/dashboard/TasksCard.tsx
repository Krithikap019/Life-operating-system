"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, Plus, X, Trash2 } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { TAG_OPTIONS, TagColor } from "@/lib/tasks"

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

export function TasksCard() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState("")
  const [newTag, setNewTag] = useState(TAG_OPTIONS[0])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

function handleAdd() {
  const text = newText.trim()
  if (!text) return
  const now = new Date()
  const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
  addTask({
    text,
    done: false,
    tag: newTag.label,
    tagColor: newTag.color,
    priority: "medium",
    dueDate: localToday,
  })
  setNewText("")
  setAdding(false)
}

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd()
    if (e.key === "Escape") { setAdding(false); setNewText("") }
  }

  // Show only today's tasks (max 5)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
  const todayTasks = tasks
  .filter(t => t.dueDate !== null && t.dueDate <= today)
  .sort((a, b) => {
    if (a.done === b.done) return 0
    return a.done ? 1 : -1  // completed tasks go to bottom
  })

  const remaining = todayTasks.filter(t => !t.done).length

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-base font-medium text-gray-800 flex items-center gap-1.5">
          <span className="text-brand-600">☑</span> Tasks
          <span className="text-[10px] text-gray-400 font-normal">{remaining} remaining</span>
        </p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-800 transition-colors"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      <div className="flex flex-col">
        {todayTasks.map((task, i) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-2 py-1.5 group",
              i < todayTasks.length - 1 && "border-b border-gray-50"
            )}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors",
                task.done ? "bg-brand-50 border-brand-200" : "border-gray-200 hover:border-brand-300"
              )}
            >
              {task.done && <Check size={8} className="text-brand-600" />}
            </button>
            <span className={cn(
              "text-[11px] flex-1 min-w-0 truncate",
              task.done ? "line-through text-gray-400" : "text-gray-800"
            )}>
              {task.text}
            </span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0",
              TAG_STYLES[task.tagColor] || TAG_STYLES.purple
            )}>
              {task.tag}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-300 hover:text-red-400"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}

        {todayTasks.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center py-3">No tasks for today 🎉</p>
        )}
      </div>

      {adding && (
        <div className="mt-2.5 border-t border-gray-100 pt-2.5">
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Task name…"
              className="flex-1 text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-300 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-800 transition-colors flex-shrink-0"
            >
              <Check size={11} />
            </button>
            <button
              onClick={() => { setAdding(false); setNewText("") }}
              className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X size={11} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {TAG_OPTIONS.map(tag => (
              <button
                key={tag.label}
                onClick={() => setNewTag(tag)}
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full transition-colors",
                  newTag.label === tag.label ? TAG_ACTIVE[tag.color] : TAG_STYLES[tag.color]
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}