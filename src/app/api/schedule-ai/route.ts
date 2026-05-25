import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { message, event } = await req.json()

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `You are a schedule assistant. ${event ? `Current selected event: "${event.title}" from ${event.startTime} to ${event.endTime}.` : "No event is currently selected."}

User request: "${message}"

Determine if the user wants to:
1. UPDATE the selected event (e.g. "move to 3pm", "rename to X", "make it 2 hours")
2. ADD a new event (e.g. "add meeting at 4pm", "schedule gym at 7am", "new event called lunch at 1pm")

Return ONLY valid JSON, no markdown:
{
  "action": "update" or "add",
  "startTime": "HH:MM or null",
  "endTime": "HH:MM or null",
  "title": "title string or null",
  "notes": "notes string or null",
  "color": "purple or teal or coral or amber or gray",
  "type": "focus or meeting or habit or other or free",
  "repeat": false,
  "response": "short friendly confirmation message"
}

Rules:
- Times in 24hr HH:MM format. "3pm"="15:00", "9am"="09:00"
- For UPDATE: only include fields that changed, others null
- For ADD: always include title and startTime, estimate endTime (+1hr if not specified)
- Pick color/type based on context: meetings=teal/meeting, gym/habits=purple/habit, focus=purple/focus
- If no event selected and user says update, set action to "add" instead`
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