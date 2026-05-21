"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Task, TAG_OPTIONS } from "@/lib/tasks"
import { useTasks } from "@/hooks/useTasks"
import { TaskRow } from "@/components/tasks/TaskRow"
import { AddTaskModal } from "@/components/tasks/AddTaskModal"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import { AITaskPanel } from "@/components/tasks/AITaskPAnel"

type Tab = "all" | "today" | "week" | "upcoming" | "completed"
type SortKey = "due" | "priority" | "tag"

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
}

function parseLocal(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function isToday(date: string | null) {
  if (!date) return false
  return date === localToday()
}

function isThisWeek(date: string | null) {
  if (!date) return false
  const d = parseLocal(date)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekEnd = new Date(todayStart.getTime() + 7 * 86400000)
  return d >= todayStart && d <= weekEnd
}

function isUpcoming(date: string | null) {
  if (!date) return false
  const d = parseLocal(date)
  const now = new Date()
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  return d > weekEnd
}

function isOverdue(date: string | null) {
  if (!date) return false
  return date < localToday()
}

const TAG_COLORS: Record<string, string> = {
  Dev:      "bg-teal-50 text-teal-800 border-teal-200",
  Learning: "bg-brand-50 text-brand-800 border-brand-200",
  Urgent:   "bg-amber2-50 text-amber2-800 border-amber-300",
  Career:   "bg-brand-50 text-brand-800 border-brand-200",
  Work:     "bg-teal-50 text-teal-800 border-teal-200",
  Personal: "bg-coral-50 text-coral-800 border-coral-200",
}

export default function TasksPage() {
  const { tasks, loaded, addTask, toggleTask, deleteTask, updateTask } = useTasks()
  const [tab, setTab] = useState<Tab>("all")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("due")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDueDate, setModalDueDate] = useState<string | undefined>()

  function openAdd(dueDate?: string) {
    setModalDueDate(dueDate)
    setModalOpen(true)
  }

  function sortTasks(arr: Task[]) {
    return [...arr].sort((a, b) => {
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sort === "tag") return a.tag.localeCompare(b.tag)
      // due date — nulls last, overdue first
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }

  const activeTasks = tasks.filter(t => !t.done)
  const doneTasks = tasks.filter(t => t.done)

  // Tab counts
  const counts: Record<Tab, number> = {
    all:       activeTasks.length,
    today:     activeTasks.filter(t => isToday(t.dueDate) || isOverdue(t.dueDate)).length,
    week:      activeTasks.filter(t => isThisWeek(t.dueDate) || isOverdue(t.dueDate)).length,
    upcoming:  activeTasks.filter(t => isUpcoming(t.dueDate)).length,
    completed: doneTasks.length,
  }

  // Filter by tab
  const tabFiltered = useMemo(() => {
    if (tab === "completed") return doneTasks
    if (tab === "today")    return activeTasks.filter(t => isToday(t.dueDate) || isOverdue(t.dueDate))
    if (tab === "week")     return activeTasks.filter(t => isThisWeek(t.dueDate) || isOverdue(t.dueDate))
    if (tab === "upcoming") return activeTasks.filter(t => isUpcoming(t.dueDate))
    return activeTasks
  }, [tasks, tab])

  // Filter by tag
  const filtered = useMemo(() => {
    if (!activeTag) return tabFiltered
    return tabFiltered.filter(t => t.tag === activeTag)
  }, [tabFiltered, activeTag])

  // Group by section for "all" tab
  const todayGroup    = sortTasks(filtered.filter(t => isToday(t.dueDate) || isOverdue(t.dueDate)))
  const weekGroup = sortTasks(filtered.filter(t => isThisWeek(t.dueDate) && !isToday(t.dueDate) && !isOverdue(t.dueDate)))
  const upcomingGroup = sortTasks(filtered.filter(t => isUpcoming(t.dueDate)))
  const noDueGroup    = sortTasks(filtered.filter(t => !t.dueDate))
  const completedGroup = sortTasks(tab === "completed" ? filtered : doneTasks.filter(t => !activeTag || t.tag === activeTag))

  const TABS: { key: Tab; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "today",     label: "Today" },
    { key: "week",      label: "This week" },
    { key: "upcoming",  label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ]

  function SectionHeader({ label, count, dueDate }: { label: string; count: number; dueDate?: string }) {
    return (
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[12px] text-gray-400">{count} task{count !== 1 ? "s" : ""}</span>
        <button
          onClick={() => openAdd(dueDate)}
          className="text-[10px] text-brand-600 hover:text-brand-800 flex items-center gap-0.5 transition-colors"
        >
          <Plus size={11} /> Add
        </button>
      </div>
    )
  }

  function TaskSection({ label, items, dueDate }: { label: string; items: Task[]; dueDate?: string }) {
    if (items.length === 0 && tab !== "all") return null
    return (
      <div className="mb-5">
        <SectionHeader label={label} count={items.length} dueDate={dueDate} />
        {items.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {items.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
            ))}
          </div>
        ) : (
          <div
            className="border border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-pointer hover:border-brand-300 hover:text-brand-500 transition-colors flex items-center gap-1.5"
            onClick={() => openAdd(dueDate)}
          >
            <Plus size={12} /> Add a task here…
          </div>
        )}
      </div>
    )
  }

  const todayStr = new Date().toISOString().split("T")[0]
  const weekEndStr = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  if (!loaded) return (
    <div className="flex h-screen items-center justify-center text-sm text-gray-400">
      Loading tasks…
    </div>
  )
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="tasks" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <p className="text-base font-medium text-gray-800">Tasks</p>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2 rounded-full hover:bg-brand-800 transition-colors"
          >
            <Plus size={12} /> Add task
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-5 flex items-center gap-0 flex-shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors",
                tab === key
                  ? "text-brand-600 border-brand-600 font-medium"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              )}
            >
              {label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                tab === key ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-400"
              )}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 flex-shrink-0">Filter:</span>
          <div className="flex items-center gap-1.5 flex-1 flex-wrap">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                !activeTag
                  ? "bg-brand-50 border-brand-200 text-brand-700 font-medium"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              All tags
            </button>
            {TAG_OPTIONS.map(t => (
              <button
                key={t.label}
                onClick={() => setActiveTag(activeTag === t.label ? null : t.label)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  activeTag === t.label
                    ? TAG_COLORS[t.label] + " font-medium"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400">Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-600 outline-none"
            >
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
              <option value="tag">Tag</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {/* Content + AI Panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "all" && (
            <>
              <TaskSection label="Today" items={todayGroup} dueDate={todayStr} />
              <TaskSection label="This week" items={weekGroup} dueDate={weekEndStr} />
              <TaskSection label="Upcoming" items={upcomingGroup} />
              {noDueGroup.length > 0 && <TaskSection label="No due date" items={noDueGroup} />}
              {completedGroup.length > 0 && (
                <div className="mb-5">
                  <SectionHeader label="Completed" count={completedGroup.length} />
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    {completedGroup.map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "today" && (
            <div className="mb-5">
              <SectionHeader label="Today" count={filtered.length} dueDate={todayStr} />
              {filtered.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {sortTasks(filtered).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                  ))}
                </div>
              ) : (
                <div
                  className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-400 text-center cursor-pointer hover:border-brand-300 hover:text-brand-500 transition-colors"
                  onClick={() => openAdd(todayStr)}
                >
                  Nothing due today 🎉 — click to add a task
                </div>
              )}
            </div>
          )}

          {tab === "week" && (
            <div className="mb-5">
              <SectionHeader label="This week" count={filtered.length} />
              {filtered.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {sortTasks(filtered).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-400 text-center">
                  No tasks this week
                </div>
              )}
            </div>
          )}

          {tab === "upcoming" && (
            <div className="mb-5">
              <SectionHeader label="Upcoming" count={filtered.length} />
              {filtered.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {sortTasks(filtered).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-400 text-center">
                  No upcoming tasks
                </div>
              )}
            </div>
          )}

          {tab === "completed" && (
            <div className="mb-5">
              <SectionHeader label="Completed" count={filtered.length} />
              {filtered.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {sortTasks(filtered).map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-400 text-center">
                  No completed tasks yet
                </div>
              )}
            </div>
          )}
        </div>
        <AITaskPanel onAddTask={addTask} />  {/* ← add here */}
        </div>
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addTask}
        defaultDueDate={modalDueDate}
      />
    </div>
  )
}
