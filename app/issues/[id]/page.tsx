"use client";

import { useParams } from "next/navigation";
import { dummyIssues } from "@/lib/data";
import Link from "next/link";

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const issue = dummyIssues.find(i => i.id === issueId);

  if (!issue) {
    return <div className="p-4">Issue not found.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Link href="/" className="text-blue-500 underline text-sm">← Back to Issues</Link>
      <h1 className="text-2xl font-bold">{issue.title}</h1>
      <p className="text-gray-500 text-sm">Author: {issue.author}</p>

      <ul className="text-sm space-y-1">
        <li>Status: {issue.status}</li>
        <li>Priority: {issue.priority}</li>
        <li>Tags: {issue.tags.join(", ")}</li>
      </ul>

      <div className="mt-4">
        <h2 className="font-semibold">Description</h2>
        <p className="text-sm text-gray-700">
          {issue.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
