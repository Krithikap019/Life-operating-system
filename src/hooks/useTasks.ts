"use client"

import { useState, useEffect } from "react"
import { Task, INITIAL_TASKS } from "@/lib/tasks"
import { useSession } from "next-auth/react"

export function useTasks() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

useEffect(() => {
  if (status === "authenticated") {
    fetchTasks()
  } else if (status === "unauthenticated") {
    try {
      const stored = localStorage.getItem("ai-life-os-tasks")
      if (stored) {
        const parsed: Task[] = JSON.parse(stored)
        
        // Remove completed tasks older than 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3)
        const cleaned = parsed.filter(t => {
          if (!t.done) return true
          const createdAt = new Date(t.createdAt)
          return createdAt > sevenDaysAgo
        })
        
        setTasks(cleaned)
        localStorage.setItem("ai-life-os-tasks", JSON.stringify(cleaned))
      } else {
        setTasks(INITIAL_TASKS)
      }
    } catch { setTasks(INITIAL_TASKS) }
    setLoaded(true)
  }
}, [status])

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch { setTasks([]) }
    setLoaded(true)
  }

  async function addTask(data: Omit<Task, "id" | "createdAt">) {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])

    if (status === "authenticated") {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })
    } else {
      localStorage.setItem("ai-life-os-tasks", JSON.stringify([newTask, ...tasks]))
    }
  }

async function toggleTask(id: string) {
  const task = tasks.find(t => t.id === id)
  if (!task) return
  const updatedTasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
  setTasks(updatedTasks)

  if (status === "authenticated") {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !task.done }),
    })
  } else {
    localStorage.setItem("ai-life-os-tasks", JSON.stringify(updatedTasks))
  }
}

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))

    if (status === "authenticated") {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    }
  }

async function updateTask(id: string, updates: Partial<Task>) {
  const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  setTasks(updatedTasks)

  if (status === "authenticated" && updates.text) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, text: updates.text }),
    })
  } else if (status === "unauthenticated") {
    try {
      localStorage.setItem("ai-life-os-tasks", JSON.stringify(updatedTasks))
    } catch {}
  }
}

  return { tasks, loaded: loaded || status === "loading", addTask, toggleTask, deleteTask, updateTask }
}