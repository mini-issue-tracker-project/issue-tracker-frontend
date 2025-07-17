"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Issue } from "@/lib/types"
import { availableTags } from "@/lib/types"

export default function AddIssueForm({ onAdd }: { onAdd: (issue: Issue) => void }) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low")
  const [status, setStatus] = useState<"open" | "in_progress" | "closed">("open")
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])

  const toggleTag = (tagId: number) => {
    setTags((prev) =>
      prev.some(t => t.id === tagId) ? prev.filter((t) => t.id !== tagId) : [...prev, { id: tagId, name: availableTags.find(t => t.id === tagId)?.name || "" }]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ id: 0, title, author, priority, status, tags, description: "", comments: [] })
    setTitle("")
    setAuthor("")
    setPriority("low")
    setStatus("open")
    setTags([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded shadow mt-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-3 py-1 rounded"
        placeholder="Issue title"
      />

      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full border px-3 py-1 rounded"
        placeholder="Author"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as "open" | "in_progress" | "closed")}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Button
            key={tag.id}
            type="button"
            variant={tags.some(t => t.id === tag.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </Button>
          ))}
        </div>
      </div>

      <Button type="submit">Add Issue</Button>
    </form>
  )
}
