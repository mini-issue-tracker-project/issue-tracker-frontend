"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Tag } from "@/lib/types"

export function IssueFilters({ onFilterApply }: { onFilterApply: () => void }) {
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([])
  const [selectedLogic, setSelectedLogic] = useState<"AND" | "OR">("AND")
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  useEffect(() => {
    fetch('http://localhost:5000/api/tags')
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error('Error fetching tags:', error))
  }, [])
  const toggleTag = (tag: { id: number; name: string }) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  const handleFilter = () => {
    console.log("Filter applied with:", selectedTags, selectedLogic)
    onFilterApply();
    // later, you can hook this to real filtering logic
  }

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm">
      <div>
        <label className="text-sm font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {availableTags.map((tag: Tag) => (
            <button
              key={tag.id}
              type="button"
              className={`px-3 py-1 border rounded-full text-sm ${
                selectedTags.some(t => t.id === tag.id)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold">Logic:</label>
        <select
          value={selectedLogic}
          onChange={(e) => setSelectedLogic(e.target.value as "AND" | "OR")}
          className="border px-2 py-1 rounded"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <Button onClick={handleFilter}>Apply Filter</Button>
    </div>
  )
}
