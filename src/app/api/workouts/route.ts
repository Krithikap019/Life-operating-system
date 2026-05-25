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

  const rows = await sql`
    SELECT * FROM workouts WHERE user_id = ${userId}
  `

  const workouts: Record<string, any> = {}
  for (const r of rows) {
    workouts[r.day_key] = {
      day: "", date: 0,
      label: r.label, sub: r.sub,
      type: r.type, status: r.status,
      duration: r.duration, kcal: r.kcal,
      exercises: r.exercises, notes: r.notes,
      extra: r.extra,
    }
  }

  return NextResponse.json({ workouts })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = await ensureUser(session.user.email, session.user.name || "")
  const { dayKey, workout } = await req.json()
  const id = `${userId}_${dayKey}`

  await sql`
    INSERT INTO workouts (id, user_id, day_key, label, sub, type, status, duration, kcal, exercises, notes, extra)
    VALUES (
      ${id}, ${userId}, ${dayKey},
      ${workout.label}, ${workout.sub || ""},
      ${workout.type}, ${workout.status || "planned"},
      ${workout.duration}, ${workout.kcal},
      ${JSON.stringify(workout.exercises || [])},
      ${workout.notes || ""}, ${workout.extra || 0}
    )
    ON CONFLICT (user_id, day_key) DO UPDATE SET
      label = EXCLUDED.label,
      sub = EXCLUDED.sub,
      type = EXCLUDED.type,
      status = EXCLUDED.status,
      duration = EXCLUDED.duration,
      kcal = EXCLUDED.kcal,
      exercises = EXCLUDED.exercises,
      notes = EXCLUDED.notes,
      extra = EXCLUDED.extra
  `

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")
  const { dayKey } = await req.json()

  await sql`
    DELETE FROM workouts WHERE user_id = ${userId} AND day_key = ${dayKey}
  `

  return NextResponse.json({ ok: true })
}