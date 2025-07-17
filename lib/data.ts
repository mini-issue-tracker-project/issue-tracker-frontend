import { availableTags, Issue } from "./types";

export const dummyIssues: Issue[] = [
  {
    id: 1,
    title: "Fix login bug",
    author: "Kemal",
    tags: [availableTags[1]],
    status: "open",
    priority: "high",
    description: "There is a login bug we need to fix.",
    comments: [
      { id: 1, author: "Ali", content: "I noticed this happens only on mobile." },
      { id: 2, author: "Ayşe", content: "Working on this right now." }
    ]
  },
  {
    id: 2,
    title: "Login page not responsive",
    author: "John Doe",
    status: "open",
    priority: "high",
    tags: [availableTags[1], availableTags[4]],
    description: "The login page is not responsive on mobile devices.",
    comments: []
  },
  {
    id: 3,
    title: "Add dark mode support",
    author: "Jane Smith",
    status: "in_progress",
    priority: "medium",
    tags: [availableTags[2], availableTags[0]],
    description: "Add dark mode support to the application.",
    comments: []
  },
  {
    id: 4,
    title: "Fix typo in About page",
    author: "John Doe",
    status: "closed",
    priority: "low",
    tags: [availableTags[1], availableTags[5]],
    description: "Fix the typo in the About page.",
    comments: []
  }
];


