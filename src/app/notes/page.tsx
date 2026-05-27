"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Plus, X, ChevronDown, ChevronRight, Trash2, Edit2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ContentType = "plain" | "mininotes" | "list"
type TagColor = "purple" | "teal" | "amber" | "coral" | "gray"

interface MiniNote {
  id: string
  title: string
  content: string
  collapsed: boolean
}

interface ListItem {
  id: string
  text: string
}

interface Note {
  id: string
  title: string
  tag: string
  tagColor: TagColor
  contentType: ContentType
  content: string
  miniNotes: MiniNote[]
  listItems: ListItem[]
  createdAt: string
}

const TAG_OPTIONS: { label: string; color: TagColor }[] = [
  { label: "Work",     color: "teal"   },
  { label: "Personal", color: "amber"   },
  { label: "Career",   color: "purple"  },
  { label: "Urgent",   color: "coral"  },
  { label: "Other",    color: "gray" },
]

const COLOR_CONFIG: Record<TagColor, { bg: string; text: string; border: string; dot: string; miniHeader: string; miniBorder: string }> = {
  purple: { bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC", dot: "#534AB7", miniHeader: "#EEEDFE", miniBorder: "#CECBF6" },
  teal:   { bg: "#E1F5EE", text: "#085041", border: "#9FE1CB", dot: "#1D9E75", miniHeader: "#E1F5EE", miniBorder: "#9FE1CB" },
  coral:  { bg: "#FAECE7", text: "#712B13", border: "#F0997B", dot: "#D85A30", miniHeader: "#FAECE7", miniBorder: "#F5C4B3" },
  amber:  { bg: "#FAEEDA", text: "#633806", border: "#FAC775", dot: "#BA7517", miniHeader: "#FAEEDA", miniBorder: "#FAC775" },
  gray:   { bg: "#F1EFE8", text: "#444441", border: "#B4B2A9", dot: "#5F5E5A", miniHeader: "#F1EFE8", miniBorder: "#D3D1C7" },

}
const COLOR_MAP = {
  purple: { bg: "bg-brand-50",  text: "text-brand-900",  dot: "#534AB7",  accent: "#AFA9EC" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-800",   dot: "#1D9E75",  accent: "#9FE1CB" },
  coral:  { bg: "bg-coral-50",  text: "text-coral-900",  dot: "#D85A30",  accent: "#F0997B" },
  amber:  { bg: "bg-amber2-50", text: "text-amber2-900", dot: "#BA7517",  accent: "#FAC775" },
  gray:   { bg: "bg-gray-100",  text: "text-gray-600",   dot: "#888780",  accent: "#D3D1C7" },
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  plain:     "Plain",
  mininotes: "Mini Notes",
  list:      "List",
}

const STORAGE_KEY = "ai-life-os-notes"

function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveNotes(notes: Note[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)) } catch {}
}

function getFilterLabel(note: Note): "today" | "yesterday" | "thisweek" | "older" {
  const now = new Date()
  const created = new Date(note.createdAt)
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays <= 7) return "thisweek"
  return "older"
}

function PlainNoteBody({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="mt-2 cursor-text" onClick={() => setEditing(true)}>
      {editing ? (
        <textarea value={content} onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus rows={8}
          className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 outline-none focus:border-brand-300 resize-none leading-relaxed" />
      ) : (
        <div className="min-h-[120px] text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
          {content
            ? renderWithLinks(content)
            : <span className="text-gray-300">Start writing…</span>
          }
        </div>
      )}
    </div>
  )
}

function renderWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-brand-600 underline hover:text-brand-800 break-all">
        {part}
      </a>
    ) : <span key={i}>{part}</span>
  )
}

function MiniNoteBody({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="px-4 py-3 cursor-text" onClick={() => setEditing(true)}>
      {editing ? (
        <textarea
          value={content}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus
          rows={3}
          className="w-full text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none resize-none leading-relaxed"
          placeholder="Write notes here…"
        />
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all min-h-[48px]">
          {content
            ? content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                /https?:\/\//.test(part) ? (
                  <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-brand-600 underline hover:text-brand-800 break-all">
                    {part}
                  </a>
                ) : <span key={i}>{part}</span>
              )
            : <span className="text-gray-300">Write notes here…</span>
          }
        </p>
      )}
    </div>
  )
}

type Filter = "all" | "today" | "yesterday" | "thisweek" | "older"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", tag: "Work", tagColor: "teal" as TagColor, contentType: "plain" as ContentType })
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTitleText, setEditingTitleText] = useState("")
  const [newMiniTitle, setNewMiniTitle] = useState("")
  const [newListItem, setNewListItem] = useState("")

  useEffect(() => {
    const loaded = loadNotes()
    setNotes(loaded)
    if (loaded.length > 0) setSelectedId(loaded[0].id)
  }, [])

  const filteredNotes = notes.filter(n => filter === "all" || getFilterLabel(n) === filter)

  const counts: Record<Filter, number> = {
    all:       notes.length,
    today:     notes.filter(n => getFilterLabel(n) === "today").length,
    yesterday: notes.filter(n => getFilterLabel(n) === "yesterday").length,
    thisweek:  notes.filter(n => getFilterLabel(n) === "thisweek").length,
    older:     notes.filter(n => getFilterLabel(n) === "older").length,
  }

  const selectedNote = notes.find(n => n.id === selectedId) ?? null

  function updateNote(updated: Note) {
    const next = notes.map(n => n.id === updated.id ? updated : n)
    setNotes(next)
    saveNotes(next)
  }

  function deleteNote(id: string) {
    const next = notes.filter(n => n.id !== id)
    setNotes(next)
    saveNotes(next)
    setSelectedId(next.length > 0 ? next[0].id : null)
  }

  function addNote() {
    if (!newNote.title.trim()) return
    const tag = TAG_OPTIONS.find(t => t.label === newNote.tag) || TAG_OPTIONS[0]
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      tag: tag.label,
      tagColor: tag.color,
      contentType: newNote.contentType,
      content: "",
      miniNotes: [],
      listItems: [],
      createdAt: new Date().toISOString(),
    }
    const next = [note, ...notes]
    setNotes(next)
    saveNotes(next)
    setSelectedId(note.id)
    setShowAddModal(false)
    setNewNote({ title: "", tag: "Work", tagColor: "teal", contentType: "plain" })
  }

  function addMiniNote() {
    if (!selectedNote || !newMiniTitle.trim()) return
    const mini: MiniNote = { id: Date.now().toString(), title: newMiniTitle, content: "", collapsed: false }
    updateNote({ ...selectedNote, miniNotes: [...selectedNote.miniNotes, mini] })
    setNewMiniTitle("")
  }

  function updateMiniNote(miniId: string, changes: Partial<MiniNote>) {
    if (!selectedNote) return
    updateNote({ ...selectedNote, miniNotes: selectedNote.miniNotes.map(m => m.id === miniId ? { ...m, ...changes } : m) })
  }

  function deleteMiniNote(miniId: string) {
    if (!selectedNote) return
    updateNote({ ...selectedNote, miniNotes: selectedNote.miniNotes.filter(m => m.id !== miniId) })
  }

  function addListItem() {
    if (!selectedNote || !newListItem.trim()) return
    updateNote({ ...selectedNote, listItems: [...selectedNote.listItems, { id: Date.now().toString(), text: newListItem }] })
    setNewListItem("")
  }

  function deleteListItem(itemId: string) {
    if (!selectedNote) return
    updateNote({ ...selectedNote, listItems: selectedNote.listItems.filter(i => i.id !== itemId) })
  }

  function updateListItem(itemId: string, text: string) {
    if (!selectedNote) return
    updateNote({ ...selectedNote, listItems: selectedNote.listItems.map(i => i.id === itemId ? { ...i, text } : i) })
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",       label: "All"       },
    { key: "today",     label: "Today"     },
    { key: "yesterday", label: "Yesterday" },
    { key: "thisweek",  label: "This week" },
    { key: "older",     label: "Older"     },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0]">
      <Sidebar activePage="notes" />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-5 flex items-center justify-between py-3 flex-shrink-0">
          <p className="text-base font-medium text-gray-800">Notes</p>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2 rounded-full hover:bg-brand-800 transition-colors">
            <Plus size={12} /> New note
          </button>
        </div>

        {/* Filter tab bar */}
        <div className="bg-white border-b border-gray-100 px-5 flex items-center flex-shrink-0">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 text-sm px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap",
                filter === f.key
                  ? "border-brand-600 text-brand-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}>
              {f.label}
              {counts[f.key] > 0 && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full",
                  filter === f.key ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-500"
                )}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left — notes list */}
          <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <p className="text-xs">No notes</p>
                <button onClick={() => setShowAddModal(true)} className="text-[10px] text-brand-600">+ Create one</button>
              </div>
            ) : (
              filteredNotes.map(note => {
                const c = COLOR_CONFIG[note.tagColor]
                const isSelected = selectedId === note.id
                return (
                  <div key={note.id} onClick={() => setSelectedId(note.id)}
                  className="cursor-pointer transition-colors mx-2 my-1 rounded-xl px-3 py-3"
                  style={{
                    background: c.bg,
                    outline: isSelected ? `2px solid ${c.dot}` : "none",
                    outlineOffset: "-1px",
                  }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate flex-1" style = {{color: c.text}}>
                        {note.title}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 font-medium"
                        style={{ background: c.bg, color: c.text }}>
                        {note.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-gray-400 capitalize">{CONTENT_TYPE_LABELS[note.contentType]}</span>
                      <span className="text-[9px] text-gray-300">·</span>
                      <span className="text-[9px] text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right — note detail */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-w-0">
            {!selectedNote ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus size={20} className="text-gray-300" />
                </div>
                <p className="text-sm">Select a note or create one</p>
              </div>
            ) : (() => {
              const c = COLOR_CONFIG[selectedNote.tagColor]
              return (
                <>
                  {/* Header card — purple border when selected */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {editingTitle ? (
                          <div className="flex items-center gap-2">
                            <input value={editingTitleText}
                              onChange={e => setEditingTitleText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { updateNote({ ...selectedNote, title: editingTitleText.trim() }); setEditingTitle(false) }
                                if (e.key === "Escape") setEditingTitle(false)
                              }}
                              className="flex-1 text-lg font-medium border border-brand-300 rounded-lg px-2 py-1 outline-none"
                              autoFocus />
                            <button onClick={() => { updateNote({ ...selectedNote, title: editingTitleText.trim() }); setEditingTitle(false) }}
                              className="text-brand-600"><Check size={14} /></button>
                            <button onClick={() => setEditingTitle(false)} className="text-gray-400"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h1 className="text-lg font-medium text-gray-800">{selectedNote.title}</h1>
                            <button onClick={() => { setEditingTitle(true); setEditingTitleText(selectedNote.title) }}
                              className="text-gray-300 hover:text-brand-600 transition-colors">
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: c.bg, color: c.text }}>
                            {selectedNote.tag}
                          </span>
                          <span className="text-[9px] text-gray-400 capitalize">{CONTENT_TYPE_LABELS[selectedNote.contentType]}</span>
                          <span className="text-[9px] text-gray-300">·</span>
                          <span className="text-[9px] text-gray-400">
                            {new Date(selectedNote.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deleteNote(selectedNote.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-3">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Plain content */}
                    {selectedNote.contentType === "plain" && (
                      <PlainNoteBody
  content={selectedNote.content}
  onChange={content => updateNote({ ...selectedNote, content })}
/>
                    )}
                  </div>

                  {/* Mini Notes */}
                  {selectedNote.contentType === "mininotes" && (
                    <div className="flex flex-col gap-3">
                      {selectedNote.miniNotes.map(mini => (
                        <div key={mini.id} className="bg-white rounded-xl overflow-hidden"
                          style={{ border: `0.5px solid ${c.border}` }}>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <button onClick={() => updateMiniNote(mini.id, { collapsed: !mini.collapsed })}
                                className="text-gray-400 hover:text-gray-600">
                                {mini.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <input value={mini.title} onChange={e => updateMiniNote(mini.id, { title: e.target.value })}
                                className="flex-1 text-sm font-medium bg-transparent outline-none text-gray-700"
                                placeholder="Sub-note title…" />
                            <button onClick={() => deleteMiniNote(mini.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                    {!mini.collapsed && (
                      <MiniNoteBody
                        content={mini.content}
                        onChange={content => updateMiniNote(mini.id, { content })}
                      />
                    )}
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <input value={newMiniTitle} onChange={e => setNewMiniTitle(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addMiniNote()}
                          placeholder="New sub-note title…"
                          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-300 bg-white" />
                        <button onClick={addMiniNote}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: "#534AB7" }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List */}
                  {selectedNote.contentType === "list" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-2">
                      {selectedNote.listItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group border-b border-gray-50 pb-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                          <input value={item.text} onChange={e => updateListItem(item.id, e.target.value)}
                            className="flex-1 text-sm text-gray-700 bg-transparent outline-none py-0.5"
                            placeholder="List item…" />
                          <button onClick={() => deleteListItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gray-200" />
                        <input value={newListItem} onChange={e => setNewListItem(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addListItem()}
                          placeholder="Add item…"
                          className="flex-1 text-sm text-gray-500 bg-transparent outline-none py-0.5 placeholder-gray-300" />
                        <button onClick={addListItem} className="text-[10px] text-brand-600 hover:text-brand-800 flex-shrink-0">+ Add</button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Add note modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">New note</p>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder="Note title" value={newNote.title}
                onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addNote()}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-300" autoFocus />

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map(t => {
                    const c = COLOR_CONFIG[t.color]
                    const isActive = newNote.tag === t.label
                    return (
                      <button key={t.label}
                        onClick={() => setNewNote(p => ({ ...p, tag: t.label, tagColor: t.color }))}
                        className="text-[10px] px-2.5 py-1 rounded-full border capitalize transition-colors"
                        style={isActive
                          ? { background: c.dot, color: "#fff", borderColor: c.dot }
                          : { background: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                        }>
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 mb-1.5">Content type</p>
                <div className="flex gap-2">
                  {(["plain", "mininotes", "list"] as ContentType[]).map(type => (
                    <button key={type} onClick={() => setNewNote(p => ({ ...p, contentType: type }))}
                      className={cn("flex-1 py-2 rounded-xl border text-[10px] capitalize transition-colors",
                        newNote.contentType === type ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                      {CONTENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-xs border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={addNote} disabled={!newNote.title.trim()}
                className="flex-1 py-2 text-xs bg-brand-600 text-white rounded-xl hover:bg-brand-800 disabled:opacity-40 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}