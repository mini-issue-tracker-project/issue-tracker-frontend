import { Issue } from "./types";

export const dummyIssues: Issue[] = [
  {
    id: 1,
    title: "Login page not responsive",
    author: "John Doe",
    status: "open",
    priority: "high",
    tags: ["bug", "enhancement"]
  },
  {
    id: 2,
    title: "Add dark mode support",
    author: "Jane Smith",
    status: "in_progress",
    priority: "medium",
    tags: ["feature", "ui"]
  },
  {
    id: 3,
    title: "Fix typo in About page",
    author: "John Doe",
    status: "closed",
    priority: "low",
    tags: ["bug", "documentation"]
  }
];
