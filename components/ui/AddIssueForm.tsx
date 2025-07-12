"use client"

import { useState } from "react"
import { Issue } from "@/lib/types"

export function AddIssueForm({ onAdd }: { onAdd: (newIssue: Issue) => void }) {
  const [form, setForm] = useState({
    title: "",
    priority: "low",
    status: "open",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const newIssue = {
      ...form,
      id: Date.now(),
      status: form.status as "open" | "in_progress" | "closed",
      priority: form.priority as "low" | "medium" | "high"
    };
    onAdd(newIssue)
    setForm({ title: "", priority: "low", status: "open" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Issue title"
        className="w-full border px-3 py-1 rounded"
      />
      <select
        value={form.priority}
        onChange={(e) => setForm({ ...form, priority: e.target.value })}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      <button type="submit" className="bg-black text-white px-4 py-1 rounded">
        Add
      </button>
    </form>
  )
}
