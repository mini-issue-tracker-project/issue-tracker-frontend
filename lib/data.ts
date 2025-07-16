import { Issue } from "./types";

export const dummyIssues: Issue[] = [
  {
    id: 1,
    title: "Login page not responsive",
    author: "John Doe",
    status: "open",
    priority: "high",
    tags: ["bug", "enhancement"],
    description: "The login page is not responsive on mobile devices."
  },
  {
    id: 2,
    title: "Add dark mode support",
    author: "Jane Smith",
    status: "in_progress",
    priority: "medium",
    tags: ["feature", "ui"],
    description: "Add dark mode support to the application."
  },
  {
    id: 3,
    title: "Fix typo in About page",
    author: "John Doe",
    status: "closed",
    priority: "low",
    tags: ["bug", "documentation"],
    description: "Fix the typo in the About page."
  }
];
