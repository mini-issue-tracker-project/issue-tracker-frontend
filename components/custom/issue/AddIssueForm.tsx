"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Issue, Tag } from "@/lib/types"
import { fetchWithAuth } from "@/app/utils/api";

export default function AddIssueForm({ onAdd }: { onAdd: (issue: Issue) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low")
  const [status, setStatus] = useState<"open" | "in_progress" | "closed">("open")
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tags')
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error('Error fetching tags:', error))
  }, [])

  const toggleTag = (tagId: number) => {
    setTags((prev) =>
      prev.some(t => t.id === tagId) ? prev.filter((t) => t.id !== tagId) : [...prev, { id: tagId, name: availableTags.find((t: Tag) => t.id === tagId)?.name || "" }]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) return

    // 1. Check for login token
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("You must log in before adding an issue.")
      return
    }

    // 2. Send request with Bearer token and handle response
    try {
      const response = await fetchWithAuth("/api/issues", {
        method: "POST",
        body: JSON.stringify({ title, description, priority, status, tags: tags.map(t => t.id) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add issue");
      }
      // 3. Only add issue when data.id is defined
      onAdd(data);
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("low");
      setStatus("open");
      setTags([]);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded shadow mt-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
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
