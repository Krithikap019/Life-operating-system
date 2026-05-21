"use client"

import { useState, useEffect } from "react"
import { Task, INITIAL_TASKS } from "@/lib/tasks"

const STORAGE_KEY = "ai-life-os-tasks"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: Task[] = JSON.parse(stored)
        setTasks(parsed)
      } else {
        setTasks(INITIAL_TASKS)
      }
    } catch {
      setTasks(INITIAL_TASKS)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {}
  }, [tasks, loaded])

  function addTask(data: Omit<Task, "id" | "createdAt">) {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id: string, updates: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  return { tasks, loaded, addTask, toggleTask, deleteTask, updateTask }
}