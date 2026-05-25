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

  const meals = await sql`
    SELECT * FROM meals
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `

  // Return as the same key-value shape the frontend uses: "dayKey-mealType"
  const mealData: Record<string, any> = {}
  for (const m of meals) {
    const key = `${m.day_key}-${m.meal_type}`
    mealData[key] = {
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      kcal: m.kcal,
      prepMin: m.prep_min,
      time: m.time,
      type: m.meal_type,
      notes: m.notes,
    }
  }

  return NextResponse.json({ mealData })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const userId = await ensureUser(session.user.email, session.user.name || "")
  const { dayKey, type, meal } = await req.json()

  if (!meal) {
    // null means deleted
    await sql`DELETE FROM meals WHERE user_id = ${userId} AND day_key = ${dayKey} AND meal_type = ${type}`
    return NextResponse.json({ ok: true })
  }

  await sql`
    INSERT INTO meals (id, user_id, day_key, meal_type, name, emoji, kcal, prep_min, time, notes)
    VALUES (${meal.id}, ${userId}, ${dayKey}, ${type}, ${meal.name}, ${meal.emoji}, ${meal.kcal}, ${meal.prepMin}, ${meal.time}, ${meal.notes})
    ON CONFLICT (id) DO UPDATE SET
      name = ${meal.name},
      emoji = ${meal.emoji},
      kcal = ${meal.kcal},
      prep_min = ${meal.prepMin},
      time = ${meal.time},
      notes = ${meal.notes}
  `

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { dayKey, type } = await req.json()
  const userId = session.user.email.replace(/[^a-z0-9]/gi, "_")

  await sql`
    DELETE FROM meals
    WHERE user_id = ${userId} AND day_key = ${dayKey} AND meal_type = ${type}
  `

  return NextResponse.json({ ok: true })
}
