"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Tag } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import TagChip from "./TagChip"

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
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([])
  const [priorities, setPriorities] = useState<{ id: number; name: string }[]>([])
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null)
  const [selectedPriorityId, setSelectedPriorityId] = useState<number | null>(null)


  // Fetch tags and initialize selectedTags from query
  useEffect(() => {
    fetch('/api/tags')
      .then(response => response.json())
      .then(data => {
        setAvailableTags(data);
        if (query.tags && typeof query.tags === 'string') {
          const tagIds = query.tags.split(',').map(Number).filter(Boolean);
          setSelectedTags(data.filter((tag: Tag) => tagIds.includes(tag.id)));
        }
      })
      .catch(error => console.error('Error fetching tags:', error))
  
    fetch('/api/statuses')
      .then(r => r.json())
      .then(data => {
        setStatuses(data);
        if (query.status_id) setSelectedStatusId(Number(query.status_id));
      })
      .catch(e => console.error('Error fetching statuses:', e))
  
    fetch('/api/priorities')
      .then(r => r.json())
      .then(data => {
        setPriorities(data);
        if (query.priority_id) setSelectedPriorityId(Number(query.priority_id));
      })
      .catch(e => console.error('Error fetching priorities:', e))
  }, [query.tags, query.status_id, query.priority_id]);
  

  const toggleTag = (tag: { id: number; name: string }) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  const handleFilter = () => {
    // Build a clean query object
    const query: Record<string, string> = {};
    if (selectedTags.length > 0) {
      query.tags = selectedTags.map(t => t.id).join(',');
    }
    if (selectedStatusId) {
      query.status_id = String(selectedStatusId);
    }
    if (selectedPriorityId) {
      query.priority_id = String(selectedPriorityId);
    }    
    // Always reset skip to 0 on filter
    if (Object.keys(query).length === 0) {
      router.push('/');
    } else {
      query.skip = '0';
      const params = new URLSearchParams(query).toString();
      router.push(`/?${params}`);
    }
    onFilterApply();
  }

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm">
      <div>
        <label className="text-sm font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {availableTags.map((tag: Tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              isSelected={selectedTags.some(t => t.id === tag.id)}
              onClick={() => toggleTag(tag)}
              size="sm"
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Status</label>
        <select
          value={selectedStatusId ?? ""}
          onChange={(e) => setSelectedStatusId(e.target.value ? Number(e.target.value) : null)}
          className="w-full border px-3 py-1 rounded mt-1"
        >
          <option value="">Any</option>
          {statuses.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold">Priority</label>
        <select
          value={selectedPriorityId ?? ""}
          onChange={(e) => setSelectedPriorityId(e.target.value ? Number(e.target.value) : null)}
          className="w-full border px-3 py-1 rounded mt-1"
        >
          <option value="">Any</option>
          {priorities.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <Button onClick={handleFilter}>Apply Filter</Button>
    </div>
  )
}
