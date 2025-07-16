"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { availableTags } from "./IssueStatus"

export function IssueFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mode, setMode] = useState<"AND" | "OR">("AND")

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleModeToggle = () => {
    setMode(prev => (prev === "AND" ? "OR" : "AND"))
  }

  const handleFilter = () => {
    console.log("Selected Tags:", selectedTags)
    console.log("Mode:", mode)
    // you can also close the form after filtering if you want:
    setIsOpen(false)
  }

  return (
    <div className="mb-6">
      {/* Button to toggle the filter form */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        className="mb-4"
      >
        {isOpen ? "Close Filters" : "Filter Issues"}
      </Button>

      {isOpen && (
        <div className="border p-4 rounded space-y-4">
          <h3 className="text-lg font-semibold">Filter Issues</h3>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Match Mode:</span>
            <Button variant="secondary" type="button" onClick={handleModeToggle}>
              {mode}
            </Button>
          </div>

          <Button type="button" onClick={handleFilter}>
            Apply Filter
          </Button>
        </div>
      )}
    </div>
  )
}
