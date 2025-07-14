export type Issue = {
  id: number;
  title: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  tags: string[]; // 🆕 eklendi
};

export const dummyIssues: Issue[] = [
  {
    id: 1,
    title: "Login page not responsive",
    status: "open",
    priority: "high",
    tags: ["bug", "frontend"]
  },
  {
    id: 2,
    title: "Add dark mode support",
    status: "in_progress",
    priority: "medium",
    tags: ["feature", "ui"]
  },
  {
    id: 3,
    title: "Fix typo in About page",
    status: "closed",
    priority: "low",
    tags: ["bug", "documentation"]
  }
];
