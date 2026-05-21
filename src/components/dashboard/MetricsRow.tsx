import { mockMetrics } from "@/lib/data"

const CARDS = [
  { label: "Tasks today",   key: "tasks"    },
  { label: "Unread emails", key: "emails"   },
  { label: "Meetings",      key: "meetings" },
  { label: "Focus score",   key: "focus"    },
]

export function MetricsRow() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CARDS.map(({ label, key }) => {
        const m = mockMetrics[key as keyof typeof mockMetrics]
        return (
          <div key={key} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] text-gray-400 mb-1">{label}</p>
            <p className="text-lg font-medium text-gray-800 leading-tight">{m.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dotColor }} />
              <span className="text-[9px] text-gray-500">{m.sub}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
