"use client";

import { useParams } from "next/navigation";
import { dummyIssues } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const issue = dummyIssues.find(i => i.id === issueId);

  if (!issue) {
    return <div className="p-4">Issue not found.</div>;
  }

  return (
    <div className="p-4 rounded-lg bg-white border shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <Button variant="outline" size="sm">
          <Link href="/">Back</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold">{issue.title}</h1>
      <p className="text-gray-500 text-sm">Author: {issue.author}</p>
      <div className="flex gap-4 text-sm text-gray-700">
        <span className="px-2 py-1 rounded bg-gray-100">Status: {issue.status}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Priority: {issue.priority}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {issue.tags.map(t => (
          <span
            key={t.id}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
          >
            {t.name}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <h2 className="font-semibold text-lg mb-2">Description</h2>
        <p className="text-sm text-gray-700">
          {issue.description || "No description provided."}
        </p>
      </div>

      <div className="mt-4 border-t pt-4">
        <h2 className="font-semibold text-lg mb-2">Comments</h2>
        <ul className="space-y-3">
          {issue.comments.map(comment => (
            <li key={comment.id} className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-sm font-medium text-gray-800">{comment.author}</p>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
