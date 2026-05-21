import { google } from "googleapis"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface EmailItem {
  id: string; from: string; fromEmail: string; subject: string
  preview: string; time: string; read: boolean; urgent: boolean
}

export interface GmailResponse {
  emails: EmailItem[]
  digest: string
  suggestedTasks: { text: string; tag: string; tagColor: string }[]
}

function parseFrom(raw: string) {
  const match = raw.match(/^(.*?)\s*<(.+?)>$/)
  if (match) return { name: match[1].replace(/"/g, "").trim(), email: match[2] }
  return { name: raw, email: raw }
}

function getHeader(headers: { name: string; value: string }[], name: string) {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ""
}

function formatTime(internalDate: string) {
  const date = new Date(parseInt(internalDate))
  const diffHours = (Date.now() - date.getTime()) / 3600000
  if (diffHours < 24) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  if (diffHours < 48) return "Yesterday"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    const gmail = google.gmail({ version: "v1", auth })

    const listRes = await gmail.users.messages.list({ userId: "me", maxResults: 10, labelIds: ["INBOX"] })
    const messageIds = listRes.data.messages || []

    const messages = await Promise.all(
      messageIds.map(({ id }) =>
        gmail.users.messages.get({ userId: "me", id: id!, format: "metadata", metadataHeaders: ["From", "Subject"] })
      )
    )

    const emails: EmailItem[] = messages.map(res => {
      const msg = res.data
      const headers = (msg.payload?.headers || []) as { name: string; value: string }[]
      const { name, email } = parseFrom(getHeader(headers, "from"))
      const subject = getHeader(headers, "subject") || "(no subject)"
      const isUnread = (msg.labelIds || []).includes("UNREAD")
      const isImportant = (msg.labelIds || []).includes("IMPORTANT")
      return { id: msg.id!, from: name || email, fromEmail: email, subject, preview: (msg.snippet || "").slice(0, 120), time: formatTime(msg.internalDate || "0"), read: !isUnread, urgent: isImportant && isUnread }
    })

    const summaries = emails.slice(0, 6).map((e, i) => `${i+1}. From: ${e.from} | Subject: ${e.subject} | Snippet: ${e.preview}`).join("\n")

    const claudeRes = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001", max_tokens: 300,
      messages: [{ role: "user", content: `Analyze these emails. Reply ONLY with valid JSON, no markdown.\n${summaries}\nReturn:\n{"digest":"1-2 sentence briefing","suggestedTasks":[{"text":"action item","tag":"Work|Urgent|Career|Personal|Dev|Learning","tagColor":"teal|purple|amber|coral"}]}\nMax 3 tasks.` }],
    })

    let digest = "Your inbox is up to date."
    let suggestedTasks: GmailResponse["suggestedTasks"] = []
    try {
      const raw = claudeRes.content[0].type === "text" ? claudeRes.content[0].text : ""
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
      digest = parsed.digest || digest
      suggestedTasks = parsed.suggestedTasks || []
    } catch { /* use defaults */ }

    return NextResponse.json({ emails, digest, suggestedTasks } as GmailResponse)
  } catch (err) {
    console.error("Gmail error:", err)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}
