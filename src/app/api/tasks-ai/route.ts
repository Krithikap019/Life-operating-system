import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
}

function datePlusDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const today = localToday()
  const tomorrow = datePlusDays(1)
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  const todayName = dayNames[new Date().getDay()]

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `You are a task parser. Today is ${todayName} ${today}. Tomorrow is ${tomorrow}.

Parse this task request and return ONLY valid JSON, no markdown:
"${message}"

Return:
{
  "text": "clear task title",
  "dueDate": "YYYY-MM-DD or null",
  "priority": "high|medium|low",
  "tag": "Dev|Work|Urgent|Career|Learning|Personal",
  "tagColor": "teal|teal|amber|purple|purple|coral"
}

Rules:
- "today" = ${today}, "tomorrow" = ${tomorrow}
- "this week" = within 7 days
- "Monday/Tuesday..." = next occurrence of that day
- If time mentioned, still use date only for dueDate
- Pick the most fitting tag from the list`
    }]
  })

  try {
    const raw = res.content[0].type === "text" ? res.content[0].text : ""
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    return NextResponse.json({ task: parsed })
  } catch {
    return NextResponse.json({ error: "Could not parse task" }, { status: 400 })
  }
}