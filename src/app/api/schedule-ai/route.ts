import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { message, event } = await req.json()

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `You are an event editor. Current event: "${event.title}" from ${event.startTime} to ${event.endTime}.
      
User request: "${message}"

Parse the request and return ONLY valid JSON, no markdown:
{
  "startTime": "HH:MM or null if unchanged",
  "endTime": "HH:MM or null if unchanged", 
  "title": "new title or null if unchanged",
  "notes": "new notes or null if unchanged",
  "response": "short friendly confirmation message"
}

Rules:
- Times must be in 24hr HH:MM format
- "3pm" = "15:00", "9am" = "09:00", "10:30am" = "10:30"
- Only change what the user asked to change
- If duration mentioned like "make it 2 hours", calculate endTime from startTime`
    }]
  })

  try {
    const raw = res.content[0].type === "text" ? res.content[0].text : ""
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ response: "Sorry, I couldn't understand that. Try: 'move to 3pm' or 'rename to Team sync'" })
  }
}