"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Loader2, RefreshCw, LogOut, Mail, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EmailItem, GmailResponse } from "@/app/api/gmail/route"

interface Props {
  onTasksSuggested?: (tasks: { text: string; tag: string; tagColor: string }[]) => void
  onDigestReady?: (digest: string) => void
}

export function EmailDigest({ onTasksSuggested, onDigestReady }: Props) {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/gmail", {
        headers: { Authorization: `Bearer ${session?.accessToken ?? ""}` },
      })
      if (res.status === 401) { setError("auth"); return }
      if (!res.ok) throw new Error("Failed to fetch")
      const data: GmailResponse = await res.json()
      setEmails(data.emails)
      setLastFetched(new Date())
      if (data.suggestedTasks?.length) onTasksSuggested?.(data.suggestedTasks)
      if (data.digest) onDigestReady?.(data.digest)
    } catch {
      setError("Failed to load emails. Try refreshing.")
    } finally {
      setLoading(false)
    }
  }, [onTasksSuggested, onDigestReady])

  useEffect(() => {
    if (session?.accessToken) fetchEmails()
  }, [session?.accessToken, fetchEmails])

  if (status === "unauthenticated" || error === "auth") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
          <Mail size={16} className="text-brand-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-800">Connect Gmail</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Get your AI email digest every morning</p>
        </div>
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-2 border border-gray-200 rounded-xl py-2 px-4 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    )
  }

  if (status === "loading" || (loading && emails.length === 0)) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
            <Mail size={12} className="text-brand-600" /> Email digest
          </p>
          <Loader2 size={12} className="animate-spin text-brand-400" />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-2 py-1.5 border-b border-gray-50 last:border-0 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-1.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-2.5 bg-gray-100 rounded w-24" />
              <div className="h-2 bg-gray-100 rounded w-36" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const unread = emails.filter(e => !e.read).length
  const urgent = emails.filter(e => e.urgent).length

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
          <Mail size={12} className="text-brand-600" /> Email digest
          {unread > 0 && (
            <span className="bg-brand-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          {lastFetched && (
            <span className="text-[9px] text-gray-400">
              {lastFetched.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          <button onClick={fetchEmails} disabled={loading} className="text-gray-400 hover:text-brand-600 transition-colors" title="Refresh">
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => signOut()} className="text-gray-300 hover:text-red-400 transition-colors" title="Disconnect Gmail">
            <LogOut size={11} />
          </button>
        </div>
      </div>

      {urgent > 0 && (
        <div className="flex items-center gap-1.5 bg-amber2-50 rounded-lg px-2.5 py-1.5 mb-2">
          <AlertCircle size={10} className="text-amber-600 flex-shrink-0" />
          <span className="text-[10px] text-amber2-800">{urgent} email{urgent > 1 ? "s" : ""} need your attention today</span>
        </div>
      )}

      {error && error !== "auth" && (
        <p className="text-[10px] text-red-400 mb-2 text-center">{error}</p>
      )}

      <div className="flex flex-col">
        {emails.slice(0, 6).map((email, i) => (
          <div key={email.id} className={cn("flex items-start gap-2 py-1.5", i < Math.min(emails.length, 6) - 1 && "border-b border-gray-50")}>
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: email.read ? "#D3D1C7" : email.urgent ? "#D85A30" : "#534AB7" }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-medium text-gray-800 leading-tight truncate">{email.from}</p>
                {email.urgent && <span className="text-[8px] bg-coral-50 text-coral-600 px-1 py-0.5 rounded flex-shrink-0">urgent</span>}
              </div>
              <p className="text-[10px] text-gray-500 font-medium truncate">{email.subject}</p>
              <p className="text-[10px] text-gray-400 truncate">{email.preview}</p>
            </div>
            <span className="text-[9px] text-gray-400 flex-shrink-0 mt-0.5">{email.time}</span>
          </div>
        ))}
        {emails.length === 0 && !loading && (
          <p className="text-[11px] text-gray-400 text-center py-3">Inbox is empty 🎉</p>
        )}
      </div>

      {emails.length > 6 && (
        <p className="text-[10px] text-gray-400 text-center mt-2 pt-2 border-t border-gray-50">
          +{emails.length - 6} more emails in your inbox
        </p>
      )}
    </div>
  )
}
