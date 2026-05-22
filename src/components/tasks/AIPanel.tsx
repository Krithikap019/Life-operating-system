"use client"


import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Check, X, Loader2 } from "lucide-react"
import { Task, TagColor } from "@/lib/tasks"
import { cn } from "@/lib/utils"


const TAG_STYLES: Record<TagColor, string> = {
 purple: "bg-brand-50 text-brand-800",
 teal:   "bg-teal-50 text-teal-800",
 amber:  "bg-amber2-50 text-amber2-800",
 coral:  "bg-coral-50 text-coral-800",
 gray:   "bg-gray-100 text-gray-500",
}


const PRIORITY_COLORS: Record<string, string> = {
 high:   "#D85A30",
 medium: "#534AB7",
 low:    "#B4B2A9",
}


const SUGGESTIONS = [
 '"Add a task for Monday morning"',
 '"Remind me to review PR by Friday"',
 '"Schedule deep work for tomorrow"',
 '"Call client today at 5pm"',
]


interface ParsedTask {
 text: string
 dueDate: string | null
 priority: "high" | "medium" | "low"
 tag: string
 tagColor: TagColor
}


interface Message {
 role: "user" | "ai"
 text: string
 parsedTask?: ParsedTask
 confirmed?: boolean
}


interface Props {
 onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
}


function formatDue(dueDate: string | null): string {
 if (!dueDate) return "No due date"
 const now = new Date()
 const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
 const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1)
 const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`
 if (dueDate === today) return "Today"
 if (dueDate === tomorrowStr) return "Tomorrow"
 const [y,m,d] = dueDate.split("-").map(Number)
 return new Date(y,m-1,d).toLocaleDateString("en-US",{month:"short",day:"numeric"})
}


export function AITaskPanel({ onAddTask }: Props) {
 const [messages, setMessages] = useState<Message[]>([])
 const [input, setInput] = useState("")
 const [loading, setLoading] = useState(false)
 const bottomRef = useRef<HTMLDivElement>(null)
 const inputRef = useRef<HTMLInputElement>(null)


 useEffect(() => {
   bottomRef.current?.scrollIntoView({ behavior: "smooth" })
 }, [messages])


 async function send(text?: string) {
   const query = (text || input).trim()
   if (!query || loading) return
   setInput("")


   const userMsg: Message = { role: "user", text: query }
   setMessages(prev => [...prev, userMsg])
   setLoading(true)


   try {
      const now = new Date()
      const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
      const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()]

      const res = await fetch("/api/tasks-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query, localDate, dayName }),
    })
     const data = await res.json()


     if (data.task) {
       setMessages(prev => [...prev, {
         role: "ai",
         text: "Got it! I've created a task for you.",
         parsedTask: data.task,
       }])
     } else {
       setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't parse that. Try something like: \"Add a task to call client by Friday\"" }])
     }
   } catch {
     setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }])
   } finally {
     setLoading(false)
   }
 }


 function confirmTask(msgIndex: number) {
   const msg = messages[msgIndex]
   if (!msg.parsedTask) return
   onAddTask({
     text: msg.parsedTask.text,
     done: false,
     tag: msg.parsedTask.tag,
     tagColor: msg.parsedTask.tagColor,
     priority: msg.parsedTask.priority,
     dueDate: msg.parsedTask.dueDate,
   })
   setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, confirmed: true } : m))
 }


 function dismissTask(msgIndex: number) {
   setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, confirmed: false, parsedTask: undefined } : m))
 }


 return (
   <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
     {/* Header */}
     <div className="px-4 py-3 flex-shrink-0 flex items-center gap-2" style={{background:"linear-gradient(135deg,#534AB7,#7F77DD)"}}>
       <Sparkles size={14} className="text-brand-100" />
       <span className="text-sm font-medium text-white">Add task with AI</span>
     </div>


     {/* Messages */}
     <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
       {messages.length === 0 && (
         <div className="text-center py-4">
           <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-2">
             <Sparkles size={18} className="text-brand-600" />
           </div>
           <p className="text-xs text-gray-500 leading-relaxed">
             Describe a task in plain English and I'll add it with the right date, tag and priority.
           </p>
         </div>
       )}


       {messages.map((msg, i) => (
         <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
           <div className={cn(
             "max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
             msg.role === "user"
               ? "bg-brand-600 text-white rounded-tr-sm"
               : "bg-gray-100 text-gray-700 rounded-tl-sm"
           )}>
             {msg.text}
           </div>


           {/* Task preview card */}
           {msg.parsedTask && msg.confirmed === undefined && (
             <div className="mt-2 w-full bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
               <div className="flex items-start gap-2">
                 <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                   <div className="w-3 h-3 rounded border-2 border-brand-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-medium text-gray-800 leading-tight">{msg.parsedTask.text}</p>
                   <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                     <span className="text-[10px] text-gray-400">{formatDue(msg.parsedTask.dueDate)}</span>
                     <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", TAG_STYLES[msg.parsedTask.tagColor])}>
                       {msg.parsedTask.tag}
                     </span>
                     <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize"
                       style={{
                         background: PRIORITY_COLORS[msg.parsedTask.priority] + "20",
                         color: PRIORITY_COLORS[msg.parsedTask.priority]
                       }}>
                       {msg.parsedTask.priority}
                     </span>
                   </div>
                 </div>
                 <div className="flex gap-1 flex-shrink-0">
                   <button
                     onClick={() => confirmTask(i)}
                     className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors"
                   >
                     <Check size={12} className="text-teal-700" />
                   </button>
                   <button
                     onClick={() => dismissTask(i)}
                     className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                   >
                     <X size={12} className="text-gray-500" />
                   </button>
                 </div>
               </div>
             </div>
           )}


           {/* Confirmed state */}
           {msg.parsedTask && msg.confirmed === true && (
             <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-teal-600">
               <Check size={10} /> Added to your tasks
             </div>
           )}
         </div>
       ))}


       {loading && (
         <div className="flex items-center gap-2 text-xs text-gray-400">
           <Loader2 size={12} className="animate-spin" /> Thinking…
         </div>
       )}
       <div ref={bottomRef} />
     </div>


     {/* Suggestions */}
     {messages.length === 0 && (
       <div className="px-3 pb-2 flex flex-col gap-1.5">
         <p className="text-[10px] text-gray-400">Try asking:</p>
         {SUGGESTIONS.map(s => (
           <button
             key={s}
             onClick={() => send(s.replace(/"/g, ""))}
             className="text-left text-[10px] px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-colors"
           >
             {s}
           </button>
         ))}
       </div>
     )}


     {/* Input */}
     <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
       <input
         ref={inputRef}
         value={input}
         onChange={e => setInput(e.target.value)}
         onKeyDown={e => e.key === "Enter" && send()}
         placeholder="Ask me to add a task…"
         className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 bg-gray-50 outline-none focus:border-brand-300 text-gray-800 placeholder-gray-400"
       />
       <button
         onClick={() => send()}
         disabled={!input.trim() || loading}
         className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-800 disabled:opacity-40 transition-colors flex-shrink-0"
       >
         <Send size={12} />
       </button>
     </div>
   </div>
 )
}

