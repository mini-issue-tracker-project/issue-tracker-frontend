"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Issue } from "@/lib/types"
import { dummyIssues as initialIssues } from "@/lib/data"
import AddIssueForm from './AddIssueForm'
import { availableTags } from "@/lib/types"
import { IssueFilters } from "./IssueFilters"
import { Filter } from "lucide-react"
import Link from "next/link"

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState<{
    title: string;
    author: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in_progress" | "closed";
    tags: { id: number; name: string }[];
    comments: { id: number; author: string; content: string }[];
  }>({
    title: "",
    author: "",
    priority: "low",
    status: "open",
    tags: [],
    comments: [],
  });

  const handleEdit = (issue: Issue) => {
    setEditingId(issue.id)
    setForm({
      title: issue.title,
      author: issue.author,
      priority: issue.priority,
      status: issue.status,
      tags: issue.tags || [], // Ensure tags is always an array
      comments: issue.comments || [],
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
    setIssues([...issues, { ...newIssue, id: nextId, tags: newIssue.tags || [] }])
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setShowAddForm(prev => !prev)}>
          {showAddForm ? "Cancel" : "Add New Issue"}
        </Button>

        {/* Filter button with icon */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(prev => !prev)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {showAddForm && <AddIssueForm onAdd={handleAdd} />}

      {/* Filter UI */}
      {showFilters && (
        <div className="mb-4">
          <IssueFilters onFilterApply={() => setShowFilters(false)} />
        </div>
      )}

      {/* Issues list */}
      {issues.map((issue) => (
        <div key={issue.id} className="border p-4 rounded shadow">
          {editingId === issue.id ? (
            <div className="space-y-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border px-3 py-1 rounded"
                placeholder="Title"
              />
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full border px-3 py-1 rounded"
                placeholder="Author"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full border px-3 py-1 rounded"

              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full border px-3 py-1 rounded"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <div className="flex gap-2 flex-wrap">
                {availableTags.map(tag => {
                  const selected = form.tags.some(t => t.id === tag.id)
                  return (
                    <Button
                      key={tag.id}
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          tags: selected
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag],
                        }))
                      }
                    >
                      {tag.name}
                    </Button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <Link href={`/issues/${issue.id}`}>
                <h3 className="font-semibold text-lg cursor-pointer hover:underline">{issue.title}</h3>
              </Link>
              <p className="text-sm text-gray-500">
                Author: {issue.author} | Status: {issue.status} | Priority: {issue.priority}
              </p>
              {issue.tags && issue.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {issue.tags.filter(tag => tag && tag.name).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
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
