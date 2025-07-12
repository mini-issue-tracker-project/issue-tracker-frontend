"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Issue } from "@/lib/types"
import { dummyIssues as initialIssues } from "@/lib/data"
import { AddIssueForm } from "./AddIssueForm"

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<{
    title: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in_progress" | "closed";
  }>({
    title: "",
    priority: "low",
    status: "open",
  });

  const handleEdit = (issue: Issue) => {
    setEditingId(issue.id)
    setForm({
      title: issue.title,
      priority: issue.priority,
      status: issue.status,
    })
  }

  const handleUpdate = () => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === editingId
          ? { ...issue, ...form }
          : issue
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this issue?")
    if (confirmed) {
      setIssues(prev => prev.filter(issue => issue.id !== id))
    }
  }

  const handleAdd = (newIssue: Issue) => {
    const nextId = issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1
    setIssues([...issues, { ...newIssue, id: nextId }])
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Button onClick={() => setShowAddForm(prev => !prev)}>
          {showAddForm ? "Cancel" : "Add New Issue"}
        </Button>
        {showAddForm && <AddIssueForm onAdd={handleAdd} />}
      </div>

      {issues.map((issue) => (
        <div key={issue.id} className="border p-4 rounded shadow">
          {editingId === issue.id ? (
            <div className="space-y-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border px-3 py-1 rounded"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })}
                className="w-full border px-3 py-1 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "open" | "in_progress" | "closed" })}
                className="w-full border px-3 py-1 rounded"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg">{issue.title}</h3>
              <p className="text-sm text-gray-500">
                Status: {issue.status} | Priority: {issue.priority}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(issue)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(issue.id)}>Delete</Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
