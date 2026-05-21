"use client"

import { useState, useEffect } from "react"
import { Task } from "@/lib/tasks"
import { useSession } from "next-auth/react"

export function useTasks() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks()
    } else if (status === "unauthenticated") {
      // fallback to localStorage if not logged in
      try {
        const stored = localStorage.getItem("ai-life-os-tasks")
        setTasks(stored ? JSON.parse(stored) : [])
      } catch { setTasks([]) }
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

    if (status === "authenticated") {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !task.done }),
      })
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    if (status === "authenticated" && updates.text) {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: updates.text }),
      })
    }
  }

  return { tasks, loaded: loaded || status === "loading", addTask, toggleTask, deleteTask, updateTask }
}