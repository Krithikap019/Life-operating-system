# AI Life OS

Your intelligent personal operating system — built with Next.js, Tailwind CSS, shadcn/ui, and Claude AI.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your key:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get your key at: https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features
- **Dashboard** — metrics, AI insight banner, email digest, tasks, today's calendar
- **Today's schedule** — right-side timeline with color-coded events
- **AI chat** — powered by Claude (claude-sonnet-4-20250514), context-aware about your day
- **Interactive tasks** — click checkboxes to toggle completion
- **Suggestion chips** — one-tap AI prompts below the chat input

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Anthropic SDK (Claude AI)

## Project structure
```
src/
├── app/
│   ├── api/chat/route.ts   ← AI API endpoint
│   ├── layout.tsx
│   ├── page.tsx            ← Main dashboard
│   └── globals.css
├── components/dashboard/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── MetricsRow.tsx
│   ├── AIInsight.tsx
│   ├── EmailDigest.tsx
│   ├── TasksCard.tsx
│   ├── CalendarCard.tsx
│   ├── ScheduleColumn.tsx
│   └── ChatBar.tsx         ← AI-powered chat
└── lib/
    ├── data.ts             ← Mock data (replace with real APIs)
    └── utils.ts
```

## Next steps
- Connect Gmail API for real email data
- Connect Google Calendar API
- Add authentication (Clerk)
- Build Goals, Habits, Reflection pages
- Add LangGraph multi-agent backend
