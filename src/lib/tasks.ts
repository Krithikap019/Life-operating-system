export type TagColor = "purple" | "teal" | "amber" | "coral" | "gray"
export type Priority = "high" | "medium" | "low"

export interface Task {
  id: string
  text: string
  done: boolean
  tag: string
  tagColor: TagColor
  priority: Priority
  dueDate: string | null   // ISO date string or null
  createdAt: string
}

export const TAG_OPTIONS: { label: string; color: TagColor }[] = [
  { label: "Dev",      color: "teal"   },
  { label: "Learning", color: "purple" },
  { label: "Urgent",   color: "amber"  },
  { label: "Career",   color: "purple" },
  { label: "Work",     color: "teal"   },
  { label: "Personal", color: "coral"  },
]

export const PRIORITY_OPTIONS: { label: string; value: Priority; color: string }[] = [
  { label: "High",   value: "high",   color: "#D85A30" },
  { label: "Medium", value: "medium", color: "#534AB7" },
  { label: "Low",    value: "low",    color: "#B4B2A9" },
]

const today = new Date().toISOString().split("T")[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
const inFourDays = new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
const inSixDays = new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0]
const inTenDays = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0]
const inFifteenDays = new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

export const INITIAL_TASKS: Task[] = [
  { id: "1", text: "Reply to Priya re: deadline",        done: false, tag: "Urgent",   tagColor: "amber",  priority: "high",   dueDate: yesterday,      createdAt: today },
  { id: "2", text: "Build email agent MVP",              done: false, tag: "Dev",      tagColor: "teal",   priority: "medium", dueDate: today,           createdAt: today },
  { id: "3", text: "Morning standup notes",              done: false, tag: "Work",     tagColor: "teal",   priority: "low",    dueDate: today,           createdAt: today },
  { id: "4", text: "Prep interview questions — OpenAI",  done: false, tag: "Career",   tagColor: "purple", priority: "medium", dueDate: inFourDays,      createdAt: today },
  { id: "5", text: "LangGraph tutorial — chapter 3",     done: false, tag: "Learning", tagColor: "purple", priority: "low",    dueDate: inSixDays,       createdAt: today },
  { id: "6", text: "Review PR #42 and merge",            done: false, tag: "Dev",      tagColor: "teal",   priority: "low",    dueDate: inTwoDays,       createdAt: today },
  { id: "7", text: "Update resume with new projects",    done: false, tag: "Career",   tagColor: "purple", priority: "low",    dueDate: inTenDays,       createdAt: today },
  { id: "8", text: "Read 'Deep Work' chapter 4",         done: false, tag: "Learning", tagColor: "purple", priority: "low",    dueDate: inFifteenDays,   createdAt: today },
  { id: "9", text: "Review LangGraph docs",              done: true,  tag: "Learning", tagColor: "purple", priority: "low",    dueDate: yesterday,       createdAt: today },
  { id: "10",text: "Morning standup",                    done: true,  tag: "Work",     tagColor: "teal",   priority: "low",    dueDate: today,           createdAt: today },
]
