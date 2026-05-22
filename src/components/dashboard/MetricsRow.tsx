"use client"

import { useTasks } from "@/hooks/useTasks"

export function MetricsRow() {
  const { tasks } = useTasks()

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter(t => t.dueDate === today || t.dueDate < today || !t.dueDate)
  const doneTasks = todayTasks.filter(t => t.done).length
  const totalTasks = todayTasks.length

  const CARDS = [
    {
      label: "Tasks today",
      value: totalTasks,
      sub: `${doneTasks} done`,
      dotColor: "#1D9E75",
    },
    {
      label: "Unread emails",
      value: 12,
      sub: "2 urgent",
      dotColor: "#D85A30",
    },
    {
      label: "Meetings",
      value: 3,
      sub: "Next 10 AM",
      dotColor: "#534AB7",
    },
    {
      label: "Focus score",
      value: "82%",
      sub: "This week",
      dotColor: "#BA7517",
    },
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