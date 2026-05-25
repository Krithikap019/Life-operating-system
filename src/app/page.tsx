"use client"

import { useState, useMemo } from "react"
import { Sidebar }        from "@/components/dashboard/Sidebar"
import { Topbar }         from "@/components/dashboard/Topbar"
import { MetricsRow }     from "@/components/dashboard/MetricsRow"
import { AIInsight }      from "@/components/dashboard/AIInsight"
import { EmailDigest }    from "@/components/dashboard/EmailDigest"
import { TasksCard }      from "@/components/dashboard/TasksCard"
import { CalendarCard }   from "@/components/dashboard/CalendarCard"
import { ScheduleColumn } from "@/components/dashboard/ScheduleColumn"
import { ChatBar }        from "@/components/dashboard/ChatBar"
import { WorkoutCard }    from "@/components/dashboard/WorkoutCard"
import { MealCard }       from "@/components/dashboard/MealCard"

export default function Home() {
  const [emailDigest, setEmailDigest] = useState("")
  const [suggestedTasks, setSuggestedTasks] = useState<{ text: string; tag: string; tagColor: string }[]>([])

  const rightCol = useMemo(() => (
    <div className="flex flex-col gap-3">
      <TasksCard />
      <div className="grid grid-cols-2 gap-3">
        <WorkoutCard />
        <MealCard />
      </div>
    </div>
  ), [])
  
  console.log({ TasksCard, WorkoutCard, MealCard })

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-w-0">
            <h1 className="text-base font-medium text-gray-800">
              Here&apos;s your <span className="text-brand-600">daily briefing</span>
            </h1>

            <MetricsRow />

            <AIInsight digest={emailDigest} />

            <div className="grid grid-cols-2 gap-3 items-start">
              {/* Left col — email + calendar */}
              <div className="flex flex-col gap-3">
                <EmailDigest
                  onTasksSuggested={setSuggestedTasks}
                  onDigestReady={setEmailDigest}
                />
                <CalendarCard />
              </div>

              {/* Right col — memoized so it never re-renders on emailDigest change */}
              {rightCol}
            </div>
          </main>

          <ScheduleColumn />
        </div>

        <ChatBar />
      </div>
    </div>
  )
}