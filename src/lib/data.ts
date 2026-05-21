export const mockEmails = [
  { id: "1", from: "OpenAI Recruiting", preview: "Interview confirmed for Friday 2 PM", time: "8:03 AM", read: false, urgent: true },
  { id: "2", from: "Priya (client)",    preview: "Can you move the deadline to Friday?",  time: "7:45 AM", read: false, urgent: true },
  { id: "3", from: "GitHub",            preview: "New comment on your PR #42",            time: "6:30 AM", read: true,  urgent: false },
  { id: "4", from: "AWS Billing",       preview: "Your monthly invoice is ready",         time: "Yesterday", read: true, urgent: false },
]

export const mockTasks = [
  { id: "1", text: "Review LangGraph docs",    done: true,  tag: "Learning", tagColor: "purple" },
  { id: "2", text: "Build email agent MVP",    done: false, tag: "Dev",      tagColor: "teal"   },
  { id: "3", text: "Reply to Priya",           done: false, tag: "Urgent",   tagColor: "amber"  },
  { id: "4", text: "Prep interview questions", done: false, tag: "Career",   tagColor: "purple" },
  { id: "5", text: "Morning standup",          done: true,  tag: "Work",     tagColor: "teal"   },
]

export const mockCalendar = [
  { id: "1", time: "9:00 AM",  label: "Deep work block — email agent", badge: "Focus",   dotColor: "#534AB7", badgeStyle: "purple" },
  { id: "2", time: "10:00 AM", label: "Team standup",                  badge: "Meeting", dotColor: "#1D9E75", badgeStyle: "teal"   },
  { id: "3", time: "12:00 PM", label: "Lunch break",                   badge: "Break",   dotColor: "#888780", badgeStyle: "gray"   },
  { id: "4", time: "2:00 PM",  label: "Interview prep — OpenAI role",  badge: "Career",  dotColor: "#D85A30", badgeStyle: "amber"  },
  { id: "5", time: "4:00 PM",  label: "Review PR #42 + reply Priya",   badge: "Urgent",  dotColor: "#BA7517", badgeStyle: "coral"  },
]

export const mockSchedule = [
  { time: "6 AM",  label: "Wake up",        type: "free" },
  { time: "8 AM",  label: "Morning routine", type: "event", bg: "#E1F5EE", color: "#085041", accent: "#0F6E56", meta: "8:00 – 9:00 AM" },
  { time: "9 AM",  label: "Deep work",       type: "event", bg: "#EEEDFE", color: "#26215C", accent: "#534AB7", meta: "9:00 – 10:00 AM", current: true },
  { time: "10 AM", label: "Team standup",    type: "event", bg: "#E1F5EE", color: "#085041", accent: "#0F6E56", meta: "10:00 – 10:30 AM" },
  { time: "12 PM", label: "Lunch · 12–1 PM", type: "free" },
  { time: "2 PM",  label: "Interview prep",  type: "event", bg: "#FAECE7", color: "#4A1B0C", accent: "#712B13", meta: "2:00 – 3:30 PM" },
  { time: "4 PM",  label: "Review PR + reply", type: "event", bg: "#FAEEDA", color: "#412402", accent: "#633806", meta: "4:00 – 5:00 PM" },
  { time: "6 PM",  label: "Free time",       type: "free" },
  { time: "8 PM",  label: "Reading habit",   type: "event", bg: "#EEEDFE", color: "#26215C", accent: "#534AB7", meta: "8:00 – 8:30 PM · AI suggested" },
  { time: "10 PM", label: "Wind down",       type: "free" },
]

export const mockMetrics = {
  tasks:     { value: 7, sub: "3 done",      dotColor: "#1D9E75" },
  emails:    { value: 12, sub: "2 urgent",   dotColor: "#D85A30" },
  meetings:  { value: 3,  sub: "Next 10 AM", dotColor: "#534AB7" },
  focus:     { value: "82%", sub: "This week", dotColor: "#BA7517" },
}
