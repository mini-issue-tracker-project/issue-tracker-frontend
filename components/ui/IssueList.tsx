"use client"

import { dummyIssues } from "@/lib/data"
import { Issue } from "@/lib/types"

export function IssueList() {
  return (
    <div className="space-y-2">
      {dummyIssues.map((issue: Issue) => (
        <div key={issue.id} className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg">{issue.title}</h3>
          <div className="text-sm text-gray-600 mt-1">
            Status: <span className="capitalize">{issue.status}</span> · 
            Priority: <span className="capitalize">{issue.priority}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
