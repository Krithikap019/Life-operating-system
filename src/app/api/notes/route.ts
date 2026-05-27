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
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")

    const rows = await sql`
      SELECT * FROM notes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    const notes = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      tag: r.tag,
      tagColor: r.tag_color,
      contentType: r.content_type,
      content: r.content || "",
      miniNotes: r.mini_notes || [],
      listItems: r.list_items || [],
      createdAt: r.created_at,
    }))

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("GET NOTES ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const userId = await ensureUser(session.user.email, session.user.name || "")
    const note = await req.json()

    if (!note.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const id = note.id || `${userId}_${Date.now()}`

    await sql`
      INSERT INTO notes (id, user_id, title, tag, tag_color, content_type, content, mini_notes, list_items, created_at, updated_at)
      VALUES (
        ${id}, ${userId}, ${note.title}, ${note.tag || "Other"}, ${note.tagColor || "gray"},
        ${note.contentType || "plain"}, ${note.content || ""},
        ${JSON.stringify(note.miniNotes || [])}::jsonb,
        ${JSON.stringify(note.listItems || [])}::jsonb,
        ${note.createdAt || new Date().toISOString()}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, tag = EXCLUDED.tag, tag_color = EXCLUDED.tag_color,
        content_type = EXCLUDED.content_type, content = EXCLUDED.content,
        mini_notes = EXCLUDED.mini_notes, list_items = EXCLUDED.list_items, updated_at = NOW()
    `

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error("SAVE NOTE ERROR:", error)
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")
    const note = await req.json()

    await sql`
      UPDATE notes SET
        title = ${note.title},
        tag = ${note.tag},
        tag_color = ${note.tagColor},
        content_type = ${note.contentType},
        content = ${note.content || ""},
        mini_notes = ${JSON.stringify(note.miniNotes || [])}::jsonb,
        list_items = ${JSON.stringify(note.listItems || [])}::jsonb,
        updated_at = NOW()
      WHERE id = ${note.id} AND user_id = ${userId}
    `

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")
    const { id } = await req.json()

    if (!id) return NextResponse.json({ error: "Missing note id" }, { status: 400 })

    await sql`DELETE FROM notes WHERE id = ${id} AND user_id = ${userId}`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}