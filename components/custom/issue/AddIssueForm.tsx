"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Issue, Tag } from "@/lib/types"

export default function AddIssueForm({ onAdd }: { onAdd: (issue: Issue) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low")
  const [status, setStatus] = useState<"open" | "in_progress" | "closed">("open")
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  useEffect(() => {
    fetch('http://localhost:5000/api/tags')
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error('Error fetching tags:', error))
  }, [])

  const toggleTag = (tagId: number) => {
    setTags((prev) =>
      prev.some(t => t.id === tagId) ? prev.filter((t) => t.id !== tagId) : [...prev, { id: tagId, name: availableTags.find((t: Tag) => t.id === tagId)?.name || "" }]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    fetch('http://localhost:5000/api/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        author,
        priority,
        status,
        tags: tags.map(t => t.id),
      }),
    })
      .then(response => response.json())
      .then(data => {
        onAdd(data)
        setTitle("")
        setDescription("")
        setAuthor("")
        setPriority("low")
        setStatus("open")
        setTags([])
      })
      .catch(error => console.error('Error adding issue:', error))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded shadow mt-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-3 py-1 rounded"
        placeholder="Issue title"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full border px-3 py-1 rounded"
        placeholder="Describe the issue…"
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
          {availableTags.map((tag: Tag) => (
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
