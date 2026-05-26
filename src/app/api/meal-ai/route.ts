import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic()

const MEAL_TIMES: Record<string, string> = {
  breakfast: "7:30 AM",
  lunch:     "12:30 PM",
  snack:     "3:30 PM",
  dinner:    "7:00 PM",
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function buildDayMap(): Record<string, string> {
  const map: Record<string, string> = {}
  const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const shortNames = ["sun","mon","tue","wed","thu","fri","sat"]
  const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"]
  const shortMonths = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

  for (let offset = -1; offset <= 14; offset++) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const key = dayKey(d)
    const num = d.getDate()
    const monthIdx = d.getMonth()
    const monthFull = monthNames[monthIdx]
    const monthShort = shortMonths[monthIdx]

    map[dayNames[d.getDay()]] = key
    map[shortNames[d.getDay()]] = key

    map[`${monthFull} ${num}`] = key
    map[`${monthShort} ${num}`] = key
    map[`${num}`] = key
    map[`${num}th`] = key
    map[`${num}st`] = key
    map[`${num}nd`] = key
    map[`${num}rd`] = key

    if (offset === 0) map["today"] = key
    if (offset === 1) map["tomorrow"] = key
    if (offset === -1) map["yesterday"] = key
  }
  return map
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { message, meal, day, emojiOnly } = await req.json()

    if (emojiOnly) {
      const completion = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: message }],
      })
      const emoji = completion.content[0]?.type === "text" ? completion.content[0].text.trim() : "🍽️"
      return NextResponse.json({ meal: { emoji } })
    }

    const todayKey = dayKey(new Date())
    const dayMap = buildDayMap()

    const todayDate = new Date()
    const dayList = Object.entries(dayMap)
      .filter(([k]) => /^[a-z]+ \d+$/.test(k))
      .map(([k, v]) => `"${k}" = key "${v}"`)
      .join(", ")

    const systemPrompt = `You are a meal planning AI assistant.

IMPORTANT: Day keys use format YYYY-M-D where M is 0-indexed (Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5...).
So May 24 2026 = key "2026-4-24", June 1 2026 = key "2026-5-1".

Today: ${todayDate.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
Today's key: "${todayKey}"
Currently selected day key: "${day}"
Selected meal: ${meal ? JSON.stringify(meal) : "none"}

Day reference (human date → key): ${dayList}

Actions:
- "add": add a new meal. Parse which day from the message. If unclear, use "${day}".
- "update": update a meal. Use "${day}" as targetDay. IMPORTANT: if the user explicitly mentions a meal type (breakfast/lunch/snack/dinner) in their message, set the "type" field to that meal type — even if a different meal is currently selected.

For kcal and prepMin: use the exact values if the user provides them in the message. If not provided, estimate realistic values based on the meal name — never use 0 or null, never ask the user to update them.
Respond ONLY with valid JSON (no markdown):
{
  "action": "add" or "update",
  "targetDay": "YYYY-M-D key",
  "meal": {
    "name": "meal name",
    "emoji": "one food emoji",
    "kcal": number,
    "prepMin": number,
    "time": "e.g. 7:30 AM",
    "type": "breakfast" or "lunch" or "snack" or "dinner",
    "notes": ""
  },
  "response": "short confirmation under 20 words"
}`

    const completion = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    })

    const text = completion.content[0]?.type === "text" ? completion.content[0].text : ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())

    if (parsed.meal && !parsed.meal.time && parsed.meal.type) {
      parsed.meal.time = MEAL_TIMES[parsed.meal.type] ?? "12:00 PM"
    }
    if (!parsed.targetDay) parsed.targetDay = day

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("meal-ai error:", err)
    return NextResponse.json(
      { action: "none", response: "Something went wrong. Try again." },
      { status: 500 }
    )
  }
}