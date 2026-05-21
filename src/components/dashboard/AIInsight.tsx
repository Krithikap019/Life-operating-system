import { Sparkles } from "lucide-react"

interface Props { digest?: string }

const DEFAULT = "Connect your Gmail to get a personalized AI briefing every morning based on your emails, tasks, and schedule."

export function AIInsight({ digest }: Props) {
  return (
    <div className="flex items-start gap-3 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2.5">
      <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
        <Sparkles size={12} className="text-brand-100" />
      </div>
      <p className="text-xs text-brand-800 leading-relaxed">
        <span className="font-medium text-brand-900">AI insights — </span>
        {digest || DEFAULT}
      </p>
    </div>
  )
}
