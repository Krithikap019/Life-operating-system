import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { message, event, currentDate, availableDates } = await req.json()

  const now = new Date()
  const days = [0, 1, 2].map(offset => {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" })
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
    const sub = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return { label, date, sub, day: d.getDate() }
  })

  const daysInfo = days.map(d => `${d.label} (${d.sub}) = "${d.date}"`).join(", ")

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `You are a schedule assistant.
      
Available days: ${daysInfo}
Currently viewing: "${currentDate || days[0].date}"
${event ? `Selected event: "${event.title}" from ${event.startTime} to ${event.endTime}.` : "No event selected."}

User request: "${message}"

If the user mentions a date/day that is NOT in the available days list (e.g. "Friday", "3 days from now", "next week"), respond with action "unavailable" and suggest the available days.

If the date IS available or no date mentioned (use currently viewing date), determine if user wants to UPDATE or ADD.

Return ONLY valid JSON, no markdown:
{
  "action": "update" or "add" or "unavailable",
  "date": "YYYY-MM-DD from available days or null",
  "startTime": "HH:MM or null",
  "endTime": "HH:MM or null",
  "title": "title string or null",
  "notes": "notes string or null",
  "color": "purple or teal or coral or amber or gray",
  "type": "focus or meeting or habit or other or free",
  "repeat": false,
  "response": "short friendly confirmation. If unavailable, say cant add for that day and suggest: ${days.map(d => `${d.label} ${d.sub}`).join(", ")}"
}

Rules:
- Times in 24hr HH:MM format. "3pm"="15:00", "9am"="09:00"
- For UPDATE: only include fields that changed, others null
- For ADD: always include title, startTime, and date
- Estimate endTime as startTime +1hr if not specified
- Pick color/type based on context: meetings=teal/meeting, gym/habits=purple/habit, focus=purple/focus
- If no event selected and user says update, set action to "add" instead
- If user says "today" use "${days[0].date}", "tomorrow" use "${days[1].date}", "${days[2].label}" use "${days[2].date}"`
    }]
  })

  try {
    const raw = res.content[0].type === "text" ? res.content[0].text : ""
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ response: "Sorry, I couldn't understand that. Try: 'add meeting at 4pm' or 'move to 3pm'" })
  }
}