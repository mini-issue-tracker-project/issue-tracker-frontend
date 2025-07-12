"use client"

import { Button } from "@/components/ui/button"

export function IssueFilters() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm text-gray-600 mr-2">Filter by status:</span>
      <Button variant="outline">Open</Button>
      <Button variant="outline">In Progress</Button>
      <Button variant="outline">Closed</Button>

      <span className="ml-6 text-sm text-gray-600 mr-2">Priority:</span>
      <Button variant="outline">Low</Button>
      <Button variant="outline">Medium</Button>
      <Button variant="outline">High</Button>
    </div>
  )
}
