"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { dummyIssues } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea" 

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const issue = dummyIssues.find((i) => i.id === issueId);

  // Eğer issue yoksa hata göster
  if (!issue) {
    return <div className="p-4">Issue not found.</div>;
  }

  // Commentler için state tutuyoruz
  const [comments, setComments] = useState(issue.comments);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const handleAddComment = () => {
    if (newCommentText.trim() === "") return
    const nextId = comments.length ? Math.max(...comments.map(c => c.id)) + 1 : 1
    const newComment = {
      id: nextId,
      author: "CurrentUser",
      content: newCommentText.trim(),
    }
    setComments(prev => [...prev, newComment])
    setNewCommentText("")
    setShowAddCommentForm(false)
  }

  const handleDeleteComment = (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this comment?");
    if (confirmed) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const startEdit = (id: number, currentContent: string) => {
    setEditingId(id);
    setEditContent(currentContent);
  };

  const handleEditSave = () => {
    setComments((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, content: editContent } : c))
    );
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="p-4 rounded-lg bg-white border shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          <Link href="/">Back</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-4">{issue.title}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
        <span className="px-2 py-1 rounded bg-gray-100">Author: {issue.author}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Status: {issue.status}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Priority: {issue.priority}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tags:</span>
          {issue.tags.map((t) => (
            <span
              key={t.id}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
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
        
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          <Button
            onClick={() => setShowAddCommentForm(!showAddCommentForm)}
            variant="outline"
          >
            {showAddCommentForm ? "Cancel" : "New Comment"}
          </Button>
        </div>

        {showAddCommentForm && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your comment..."
            />
            <Button onClick={handleAddComment}>Add Comment</Button>
          </div>
        )}

        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="p-3 rounded-lg bg-gray-50 border flex justify-between items-start"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {comment.author}
                </p>
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      className="w-full border rounded p-1 text-sm"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{comment.content}</p>
                )}
              </div>

              {editingId !== comment.id && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="hover:bg-gray-200"
                    onClick={() => startEdit(comment.id, comment.content)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="hover:bg-red-400"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
