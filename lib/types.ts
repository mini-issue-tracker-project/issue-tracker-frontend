export type Issue = {
    id: number
    title: string
    author: string
    status: "open" | "in_progress" | "closed"
    priority: "low" | "medium" | "high"
    tags: { id: number; name: string }[]
    description: string
    comments: { id: number; author: string; content: string }[]
  }

  export const availableTags = [
    { id: 1, name: "ui" },
    { id: 2, name: "bug" },
    { id: 3, name: "feature" },
    { id: 4, name: "enhancement" },
    { id: 5, name: "documentation" },
  ];
  
