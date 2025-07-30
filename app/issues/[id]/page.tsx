"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import CommentSection from "@/components/custom/comments/CommentSection";
import { Issue } from "@/lib/types";

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetch(`http://localhost:5000/api/issues/${issueId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Issue not found');
        }
        return response.json();
      })
      .then(data => {
        setIssue(data);
      })
      .catch(error => {
        console.error('Error fetching issue:', error);
        setError(error.message || 'Failed to load issue');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [issueId]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700 mb-2">Loading issue...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the issue details.</div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600 mb-2">Issue not found</div>
          <div className="text-sm text-gray-500 mb-4">
            {error || "The issue you're looking for doesn't exist or has been removed."}
          </div>
          <Button variant="outline" size="sm">
            <Link href="/">Back to Issues</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white border shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          <Link href="/">Back</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-4">{issue.title}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
        <span className="px-2 py-1 rounded bg-gray-100">Author: {issue.author?.name ?? "Unknown"}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Status: {issue.status}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Priority: {issue.priority}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tags:</span>
          {issue.tags.map((t) => (
            <span
              key={t.id}
              className="px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: t.color, color: '#fff' }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-base text-gray-700">
          {issue.description || "No description provided."}
        </p>
      </div>
      
      <CommentSection issueId={issueId} />
    </div>
  );
}
