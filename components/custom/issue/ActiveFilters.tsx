"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { X, FilterX } from "lucide-react"
import { useEffect, useState } from "react"
import { Tag } from "@/lib/types"
import { fetchWithAuth } from "@/app/utils/api"

type ActiveFilter = {
  key: string
  label: string
  value: string
  displayValue: string
}

export function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([])
  const [priorities, setPriorities] = useState<{ id: number; name: string }[]>([])

  // Fetch reference data for human-readable labels
  useEffect(() => {
    fetchWithAuth('/api/tags')
      .then(response => response.json())
      .then(setAvailableTags)
      .catch(error => console.error('Error fetching tags:', error))
    
    fetchWithAuth('/api/statuses')
      .then(r => r.json())
      .then(setStatuses)
      .catch(e => console.error('Error fetching statuses:', e))
    
    fetchWithAuth('/api/priorities')
      .then(r => r.json())
      .then(setPriorities)
      .catch(e => console.error('Error fetching priorities:', e))
  }, [])

  // Parse active filters from URL
  useEffect(() => {
    const filters: ActiveFilter[] = []
    const query = Object.fromEntries(searchParams.entries())

    // Status filter
    if (query.status_id) {
      const status = statuses.find(s => s.id === Number(query.status_id))
      if (status) {
        filters.push({
          key: 'status_id',
          label: 'Status',
          value: query.status_id,
          displayValue: status.name
        })
      }
    }

    // Priority filter
    if (query.priority_id) {
      const priority = priorities.find(p => p.id === Number(query.priority_id))
      if (priority) {
        filters.push({
          key: 'priority_id',
          label: 'Priority',
          value: query.priority_id,
          displayValue: priority.name
        })
      }
    }

    // Tags filter
    if (query.tags) {
      const tagIds = query.tags.split(',').map(Number).filter(Boolean)
      const selectedTags = availableTags.filter(tag => tagIds.includes(tag.id))
      if (selectedTags.length > 0) {
        filters.push({
          key: 'tags',
          label: 'Tags',
          value: query.tags,
          displayValue: selectedTags.map(tag => tag.name).join(', ')
        })
      }
    }

    // Author filter
    if (query.author_id) {
      filters.push({
        key: 'author_id',
        label: 'Author',
        value: query.author_id,
        displayValue: query.author_id // Could be enhanced with user lookup
      })
    }

    // Skip and limit are pagination, not filters
    // Other potential filters can be added here

    setActiveFilters(filters)
  }, [searchParams, statuses, priorities, availableTags])

  const removeFilter = (filterKey: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(filterKey)
    
    // Reset pagination when removing filters
    newParams.delete('skip')
    
    const newQuery = newParams.toString()
    router.push(newQuery ? `/?${newQuery}` : '/')
  }

  const clearAllFilters = () => {
    router.push('/')
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Active Filters</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          <FilterX className="h-3 w-3" />
          Clear All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-gray-600">{filter.label}:</span>
            <span className="font-medium text-gray-800">{filter.displayValue}</span>
            <button
              onClick={() => removeFilter(filter.key)}
              className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 