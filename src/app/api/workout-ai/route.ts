import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { message, workout, dayKey, todayKey, availableDays } = await req.json()

    const daysInfo = availableDays
      ? availableDays.map((d: any) =>
          `${d.isToday ? "TODAY" : d.label} (${d.date}) = "${d.key}"${
            d.workout
              ? ` → has "${d.workout.label}" (${d.workout.type}) with exercises: [${
                  (d.workout.exercises || []).map((e: any) => e.name).join(", ")
                }]`
              : " → empty"
          }`
        ).join("\n")
      : `Today = "${dayKey}"`

    const systemPrompt = `You are a workout planning AI assistant.

Today is marked as TODAY below. Use this to resolve "today", "tomorrow" etc.

Available days and their current workouts:
${daysInfo}

Currently selected day: "${dayKey}"
Currently selected workout: ${workout ? JSON.stringify(workout) : "none"}

RULES for finding the target day:
- "today" = the day marked TODAY = "${todayKey}"
- "tomorrow" = the day after TODAY
- A date like "30th" or "May 30" = match by date number
- A workout name like "yoga", "pull day", "push" = find which day has that workout label matching the name
- "edit yoga today" = find TODAY and confirm it has yoga, then update it
- "edit yoga" with no day = find whichever day has yoga and update that
- If user says "add 3 more exercises to yoga" = find yoga's day, keep ALL existing exercises, add 3 new relevant ones
- Never replace existing exercises unless user explicitly says "replace" or "change all exercises"

RULES for exercise updates:
- "add N more exercises" = keep ALL current exercises + add N new ones
- "remove [exercise name]" = remove only that specific exercise, keep everything else  
- "remove N exercises" = remove the last N exercises
- "replace exercises" = replace all with new ones

Respond ONLY with valid JSON (no markdown):
{
  "action": "add" or "update" or "none",
  "dayKey": "the key of the target day",
  "workout": {
    "label": "workout name",
    "sub": "short subtitle",
    "type": "strength" or "cardio" or "hiit" or "mobility" or "recovery" or "rest",
    "duration": number,
    "kcal": number,
    "status": "planned" or "done" or "progress",
    "exercises": [{ "name": "exercise name", "sets": "3 × 10" }],
    "notes": "",
    "extra": 0
  },
  "response": "short friendly confirmation under 20 words"
}`

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    })

    const text = completion.content[0]?.type === "text" ? completion.content[0].text : ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("workout-ai error:", err)
    return NextResponse.json(
      { action: "none", response: "Something went wrong. Try again." },
      { status: 500 }
    )
  }
}