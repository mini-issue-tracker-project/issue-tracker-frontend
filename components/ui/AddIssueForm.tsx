"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AddIssueForm() {
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState({
    title: "",
    priority: "low",
    status: "open",
  })

  const handleSubmit = () => {
    console.log("New Issue Submitted:", form)
    setForm({ title: "", priority: "low", status: "open" })
    setVisible(false)
  }

  return (
    <div className="mb-6">
      <Button onClick={() => setVisible(!visible)}>+ Add Issue</Button>

      {visible && (
        <div className="mt-4 space-y-3 border p-4 rounded bg-gray-50">
          <input
            type="text"
            placeholder="Issue Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border w-full px-3 py-1 rounded"
          />

          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="border w-full px-3 py-1 rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border w-full px-3 py-1 rounded"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      )}
    </div>
  )
}
