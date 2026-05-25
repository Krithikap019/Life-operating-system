import { sql } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

async function ensureUser(email: string, name: string) {
  const id = email.replace(/[^a-z0-9]/gi, "_")
  await sql`
    INSERT INTO users (id, email, name)
    VALUES (${id}, ${email}, ${name})
    ON CONFLICT (email) DO NOTHING
  `
  return id
}

// GET all exceptions for user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")

  const exceptions = await sql`
    SELECT event_id, date FROM schedule_exceptions
    WHERE user_id = ${userId}
  `

  // Return as { eventId: [date1, date2] }
  const map: Record<string, string[]> = {}
  for (const e of exceptions) {
    if (!map[e.event_id]) map[e.event_id] = []
    map[e.event_id].push(e.date)
  }

  return NextResponse.json({ exceptions: map })
}

// POST add an exception (delete repeat event on specific day)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = await ensureUser(session.user.email, session.user.name || "")
  const { eventId, date } = await req.json()

  await sql`
    INSERT INTO schedule_exceptions (id, user_id, event_id, date)
    VALUES (${`${userId}-${eventId}-${date}`}, ${userId}, ${eventId}, ${date})
    ON CONFLICT (user_id, event_id, date) DO NOTHING
  `

  return NextResponse.json({ ok: true })
}

// DELETE remove an exception (restore repeat event on specific day)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")
  const { eventId, date } = await req.json()

  await sql`
    DELETE FROM schedule_exceptions
    WHERE user_id = ${userId} AND event_id = ${eventId} AND date = ${date}
  `

  return NextResponse.json({ ok: true })
}
