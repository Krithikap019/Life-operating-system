"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F4F0" }}>
        <Loader2 className="animate-spin text-brand-600" size={24} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F4F0" }}>
      <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-sm flex flex-col items-center gap-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-semibold"
            style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}>
            AI
          </div>
          <div className="text-center">
            <h1 className="text-lg font-medium text-gray-800">AI Life OS</h1>
            <p className="text-xs text-gray-400 mt-1">Your intelligent personal operating system</p>
          </div>
        </div>

        <div className="w-full border-t border-gray-100" />

        <div className="w-full flex flex-col gap-4">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Sign in with Google to sync your tasks, emails and schedule across all your devices.
          </p>

          <button
            onClick={async () => {
              setLoading(true)
              await signIn("google", { callbackUrl: "/" })
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-brand-600" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          We only request read-only Gmail access. Your data is never shared or sold.
        </p>
      </div>
    </div>
  )
}