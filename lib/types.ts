export type Issue = {
    id: number
    title: string
    author: string
    status: "open" | "in_progress" | "closed"
    priority: "low" | "medium" | "high"
    tags: string[]
  }

export const availableTags = ["ui", "bug", "feature", "enhancement", "documentation"];
