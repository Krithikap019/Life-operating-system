"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "What should I focus on now?",
  "Draft a reply to Priya",
  "Reschedule my afternoon",
  "Summarize urgent emails",
]

export function ChatBar() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(text?: string) {
    const query = text || input.trim()
    if (!query || loading) return

    setInput("")
    setOpen(true)
    const newMessages: Message[] = [...messages, { role: "user", content: query }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Chat messages panel */}
      {open && messages.length > 0 && (
        <div className="max-h-64 overflow-y-auto px-4 py-3 flex flex-col gap-3 border-b border-gray-100 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2 items-start", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-brand-100" : "bg-brand-600"
              )}>
                {msg.role === "user"
                  ? <User size={12} className="text-brand-700" />
                  : <Bot size={12} className="text-brand-100" />
                }
              </div>
              <div className={cn(
                "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-brand-100" />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl rounded-tl-sm px-3 py-2">
                <Loader2 size={12} className="animate-spin text-brand-600" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Suggestions (only when chat is empty) */}
      {!open && (
        <div className="flex gap-2 px-4 pt-2 pb-0 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your AI — 'Plan my afternoon' or 'Draft a reply to Priya'…"
          className="chat-input flex-1 border border-gray-200 rounded-full px-4 py-2 text-xs bg-gray-50 text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </div>
    </div>
  )
}
