import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      tag TEXT NOT NULL,
      tag_color TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      color TEXT DEFAULT 'purple',
      repeat BOOLEAN DEFAULT false,
      notes TEXT DEFAULT '',
      type TEXT DEFAULT 'other',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      day_key TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '🍽️',
      kcal INTEGER DEFAULT 0,
      prep_min INTEGER DEFAULT 0,
      time TEXT DEFAULT '12:00 PM',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
  CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    event_id TEXT NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(user_id, event_id, date)
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_key TEXT NOT NULL,
    label TEXT NOT NULL,
    sub TEXT DEFAULT '',
    type TEXT DEFAULT 'strength',
    status TEXT DEFAULT 'planned',
    duration INTEGER DEFAULT 0,
    kcal INTEGER DEFAULT 0,
    exercises JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    extra INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, day_key)
  )
`
await sql`
  ALTER TABLE schedule_events 
  ADD COLUMN IF NOT EXISTS date TEXT
`
}

export { sql }