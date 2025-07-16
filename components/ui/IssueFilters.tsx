"use client"

import { useState } from "react"
import { availableTags } from "./IssueStatus"
import { Button } from "@/components/ui/button"

export function IssueFilters() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLogic, setSelectedLogic] = useState<"AND" | "OR">("AND")

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleFilter = () => {
    console.log("Filter applied with:", selectedTags, selectedLogic)
    // later, you can hook this to real filtering logic
  }

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm">
      <div>
        <label className="text-sm font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              className={`px-3 py-1 border rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
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
