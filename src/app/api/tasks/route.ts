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

  const tasks = await sql`
    SELECT * FROM tasks
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

  return NextResponse.json({ tasks: tasks.map(t => ({
    id: t.id,
    text: t.text,
    done: t.done,
    tag: t.tag,
    tagColor: t.tag_color,
    priority: t.priority,
    dueDate: t.due_date,
    createdAt: t.created_at,
  }))})
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = await ensureUser(session.user.email, session.user.name || "")
  const body = await req.json()
  const id = Date.now().toString()

  await sql`
    INSERT INTO tasks (id, user_id, text, done, tag, tag_color, priority, due_date, created_at)
    VALUES (${id}, ${userId}, ${body.text}, ${body.done}, ${body.tag}, ${body.tagColor}, ${body.priority}, ${body.dueDate}, ${body.createdAt})
  `

  return NextResponse.json({ ok: true, id })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (updates.done !== undefined) {
    await sql`UPDATE tasks SET done = ${updates.done} WHERE id = ${id}`
  }
  if (updates.text !== undefined) {
    await sql`UPDATE tasks SET text = ${updates.text} WHERE id = ${id}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id } = await req.json()
  await sql`DELETE FROM tasks WHERE id = ${id}`

  return NextResponse.json({ ok: true })
}