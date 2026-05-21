import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the AI assistant for "AI Life OS" — an intelligent personal operating system that acts as the user's chief of staff.

You have access to the user's context for today:
- Tasks: Review LangGraph docs (done), Build email agent MVP, Reply to Priya (urgent), Prep interview questions, Morning standup (done)
- Calendar: Deep work 9-10 AM (now), Team standup 10 AM, Lunch 12 PM, Interview prep 2 PM, Review PR 4 PM
- Emails: OpenAI recruiting (interview Friday 2 PM), Priya (deadline move request), GitHub PR comment, AWS billing
- Focus score: 82% this week
- Current time: 9:15 AM

Your role:
- Help plan and prioritize the user's day
- Draft emails and messages
- Suggest schedule changes
- Provide productivity insights
- Answer questions about tasks and goals
- Be concise, warm, and proactive

Keep responses short and actionable. Use bullet points when listing things. Never be verbose.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")

    return NextResponse.json({ message: text })
  } catch (err) {
    console.error("AI error:", err)
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 })
  }
}
