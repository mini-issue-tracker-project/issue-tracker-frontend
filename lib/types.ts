export type Issue = {
    id: number
    title: string
    author: string
    status: "open" | "in_progress" | "closed"
    priority: "low" | "medium" | "high"
    tags: { id: number; name: string }[]
    description: string
    comments: Comment[]
  }

  export const availableTags = [
    { id: 1, name: "ui" },
    { id: 2, name: "bug" },
    { id: 3, name: "feature" },
    { id: 4, name: "enhancement" },
    { id: 5, name: "documentation" },
  ];

  export type Image = {
    id: number;
    name: string;
    url: string;
  };

  export type Comment = {
    id: number;
    author: string;
    content: string;
    images: Image[];
  };
  