"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import CommentSection from "@/components/custom/comments/CommentSection";
import { Issue, Comment } from "@/lib/types"; // Import the Issue type

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/issues/${issueId}`)
      .then(response => response.json())
      .then(data => {
        setIssue(data);
        setComments(
          (data.comments || []).map((comment: any) => ({
            ...comment,
            author:
              typeof comment.author === 'object' && comment.author !== null
                ? comment.author
                : typeof comment.author === 'string'
                ? comment.author
                : 'Unknown',
          }))
        );
      })
      .catch(error => console.error('Error fetching issue:', error));
  }, [issueId]);

  if (!issue) {
    return <div className="p-4">Issue not found.</div>;
  }


  const handleAddComment = () => {
    if (newCommentText.trim() === "") return;
    const nextId = comments.length ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
    const newComment = {
      id: nextId,
      author: "CurrentUser",
      content: newCommentText.trim(),
      images: attachedFiles.map((file) => ({
        id: Number(file.name.split(".")[0]),
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText("");
    setShowAddCommentForm(false);
    setAttachedFiles([]); // Clear attached files after adding
  };

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
        <span className="px-2 py-1 rounded bg-gray-100">Author: {issue.author?.name ?? "Unknown"}</span>
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
      
      <CommentSection 
        comments={comments} 
        setComments={setComments} 
        editingId={editingId} 
        setEditingId={setEditingId} 
        editContent={editContent} 
        setEditContent={setEditContent} 
        showAddCommentForm={showAddCommentForm} 
        setShowAddCommentForm={setShowAddCommentForm} 
        newCommentText={newCommentText} 
        setNewCommentText={setNewCommentText} 
        handleAddComment={handleAddComment} 
        handleDeleteComment={handleDeleteComment} 
        startEdit={startEdit} 
        handleEditSave={handleEditSave} 
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
      />
    </div>
  );
}
