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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")

  const events = await sql`
    SELECT * FROM schedule_events
    WHERE user_id = ${userId}
    ORDER BY start_time ASC
  `

  return NextResponse.json({
    events: events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      startTime: e.start_time,
      endTime: e.end_time,
      color: e.color,
      repeat: e.repeat,
      notes: e.notes,
      type: e.type,
    }))
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = await ensureUser(session.user.email, session.user.name || "")
  const { event } = await req.json()

  await sql`
    INSERT INTO schedule_events (id, user_id, title, date, start_time, end_time, color, repeat, notes, type)
    VALUES (${event.id}, ${userId}, ${event.title}, ${event.date}, ${event.startTime}, ${event.endTime}, ${event.color}, ${event.repeat}, ${event.notes}, ${event.type})
    ON CONFLICT (id) DO UPDATE SET
      title = ${event.title},
      date = ${event.date},
      start_time = ${event.startTime},
      end_time = ${event.endTime},
      color = ${event.color},
      repeat = ${event.repeat},
      notes = ${event.notes},
      type = ${event.type}
  `

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id } = await req.json()
  await sql`DELETE FROM schedule_events WHERE id = ${id}`

  return NextResponse.json({ ok: true })
}
