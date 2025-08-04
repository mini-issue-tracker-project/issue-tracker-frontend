"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui"
import { Issue, Tag } from "@/lib/types"
import { fetchWithAuth } from "@/app/utils/api";
import TagChip from "./TagChip"

export default function AddIssueForm({ onAdd }: { onAdd: (issue: Issue) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("");
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([])
  const [priorities, setPriorities] = useState<{ id: number; name: string }[]>([])
  const [priorityId, setPriorityId] = useState<number | null>(null)
  const [statusId, setStatusId] = useState<number | null>(null)
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tags')
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error('Error fetching tags:', error))
  
    fetchWithAuth('/api/statuses')
      .then(r => r.json())
      .then(d => setStatuses(d))
      .catch(e => console.error('Error fetching statuses:', e))
  
    fetchWithAuth('/api/priorities')
      .then(r => r.json())
      .then(d => setPriorities(d))
      .catch(e => console.error('Error fetching priorities:', e))
  }, [])
  

  const toggleTag = (tagId: number) => {
    setTags((prev) =>
      prev.some(t => t.id === tagId) ? prev.filter((t) => t.id !== tagId) : [...prev, { id: tagId, name: availableTags.find((t: Tag) => t.id === tagId)?.name || "" }]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError("Title is required.")
      return
    }

    // 1. Check for login token
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("You must log in before adding an issue.")
      return
    }

    // 2. Send request with Bearer token and handle response
    try {
      if (!statusId) {
        setError("Status is required.");
        return;
      }
      if (!priorityId) {
        setError("Priority is required.");
        return;
      }
      
      const response = await fetchWithAuth("/api/issues", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          status_id: statusId,
          priority_id: priorityId,
          tags: tags.map(t => t.id),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add issue");
      }      
      // 3. Only add issue when data.id is defined
      onAdd(data);
      // Reset form
      setTitle("");
      setDescription("");
      setPriorityId(null);
      setStatusId(null);
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
        placeholder="Describe the issue (optional)…"
      />

      <select
        value={priorityId ?? ""}
        onChange={(e) => setPriorityId(e.target.value ? Number(e.target.value) : null)}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="">Select priority</option>
        {priorities.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={statusId ?? ""}
        onChange={(e) => setStatusId(e.target.value ? Number(e.target.value) : null)}
        className="w-full border px-3 py-1 rounded"
      >
        <option value="">Select status</option>
        {statuses.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>


      <div className="space-y-1">
        <label className="text-sm font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag: Tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              isSelected={tags.some(t => t.id === tag.id)}
              onClick={() => toggleTag(tag.id)}
              size="sm"
            />
          ))}
        </div>
      </div>

      <Button type="submit">Add Issue</Button>
    </form>
  )
}
