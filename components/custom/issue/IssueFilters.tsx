"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Tag } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"

export function IssueFilters({ onFilterApply }: { onFilterApply: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Helper to get query params as object
  const getQuery = () => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => { obj[k] = v; });
    return obj;
  };
  const query = getQuery();
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  // Fetch tags and initialize selectedTags from query
  useEffect(() => {
    fetch('/api/tags')
      .then(response => response.json())
      .then(data => {
        setAvailableTags(data);
        // Initialize selectedTags from query.tags (comma-separated ids)
        if (query.tags && typeof query.tags === 'string') {
          const tagIds = query.tags.split(',').map(Number).filter(Boolean);
          setSelectedTags(data.filter((tag: Tag) => tagIds.includes(tag.id)));
        }
      })
      .catch(error => console.error('Error fetching tags:', error))
  }, [query.tags]);

  const toggleTag = (tag: { id: number; name: string }) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  const handleFilter = () => {
    const params = new URLSearchParams({
      ...query,
      tags: selectedTags.map(t => t.id).join(','),
      skip: '0',
    });
    router.push(`?${params.toString()}`);
    onFilterApply();
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
      <Button onClick={handleFilter}>Apply Filter</Button>
    </div>
  )
}
