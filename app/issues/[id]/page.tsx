"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import CommentSectionWrapper from "@/components/custom/comments/CommentSectionWrapper";
import { Issue, Tag } from "@/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import { fetchWithAuth } from "@/app/utils/api";
import { Textarea } from "@/components/ui/Textarea";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TagChip from "@/components/custom/issue/TagChip";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = Number(params.id);
  const { user, role } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([])
  const [priorities, setPriorities] = useState<{ id: number; name: string }[]>([])
  const [statusId, setStatusId] = useState<number | null>(null)
  const [priorityId, setPriorityId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    tags: [] as Tag[]
  });

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetchWithAuth(`/api/issues/${issueId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Issue not found');
        }
        return response.json();
      })
      .then(data => {
        setIssue(data);
        // Initialize form with issue data
        setForm({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          tags: data.tags
        });
      })
      .catch(error => {
        console.error('Error fetching issue:', error);
        setError(error.message || 'Failed to load issue');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [issueId]);

  // Fetch available tags, statuses, and priorities
  useEffect(() => {
    fetchWithAuth('/api/tags')
      .then(r => r.json())
      .then(setAvailableTags)
      .catch(error => console.error('Error fetching tags:', error));

    fetchWithAuth('/api/statuses')
      .then(r => r.json())
      .then(setStatuses)
      .catch(e => console.error('Error fetching statuses:', e))

    fetchWithAuth('/api/priorities')
      .then(r => r.json())
      .then(setPriorities)
      .catch(e => console.error('Error fetching priorities:', e))
  }, []);

  // When both issue and availableTags are loaded, sync form.tags to use full tag objects from availableTags
  useEffect(() => {
    if (issue && availableTags.length > 0) {
      const tags = issue.tags
        .map(itag => availableTags.find(t => t.id === itag.id))
        .filter((t): t is Tag => !!t);
        setForm({
          title: issue.title,
          description: issue.description,
          status: issue.status?.name || "",
          priority: issue.priority?.name || "",
          tags,
        });
        setStatusId(issue.status?.id || null);
        setPriorityId(issue.priority?.id || null);        
    }
  }, [issue, availableTags]);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetchWithAuth(`/api/issues/${issueId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Navigate back to the main page after successful deletion
        router.push('/');
      } else {
        console.error('Failed to delete issue');
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

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
        {user && (role === 'admin' || user.id === issue.author?.id) && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="Title"
          />
          <Textarea
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Description"
            rows={4}
          />
          <select
            value={statusId ?? ""}
            onChange={e => {
              const v = e.target.value;
              setStatusId(v ? Number(v) : null);
              const name = statuses.find(s => String(s.id) === v)?.name || "";
              setForm(f => ({ ...f, status: name }));
            }}
            className="w-full border p-2 rounded"
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={priorityId ?? ""}
            onChange={e => {
              const v = e.target.value;
              setPriorityId(v ? Number(v) : null);
              const name = priorities.find(p => String(p.id) === v)?.name || "";
              setForm(f => ({ ...f, priority: name }));
            }}
            className="w-full border p-2 rounded"
          >
            {priorities.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const selected = form.tags.some(t => t.id === tag.id);
              return (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  isSelected={selected}
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      tags: selected
                        ? prev.tags.filter(t => t.id !== tag.id)
                        : [...prev.tags, tag],
                    }))
                  }
                  size="sm"
                />
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex gap-2"
              onClick={() => {
                fetchWithAuth(`/api/issues/${issueId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    status_id: statusId,
                    priority_id: priorityId,
                    tags: form.tags.map(t => t.id),
                  }),
                })
                  .then(res => res.json())
                  .then(updated => {
                    // After update, map returned tags to availableTags for consistency
                    const updatedTags = (updated.tags || []).map((utag: any) =>
                      availableTags.find(t => t.id === utag.id) || utag
                    );
                    setIssue({ ...updated, tags: updatedTags });
                    setForm(f => ({ ...f, tags: updatedTags }));
                    setIsEditing(false);
                  })
                  .catch(error => {
                    console.error('Error updating issue:', error);
                  });
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-4">{issue.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="px-2 py-1 rounded bg-gray-100">Author: {issue.author?.name ?? "Unknown"}</span>
            <span className="px-2 py-1 rounded bg-gray-100">Status: {issue.status?.name}</span>
            <span className="px-2 py-1 rounded bg-gray-100">Priority: {issue.priority?.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Tags:</span>
              {issue.tags.map((t) => (
                <TagChip
                  key={t.id}
                  tag={t}
                  size="sm"
                />
              ))}
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-base text-gray-700">
              {issue.description || "No description provided."}
            </p>
          </div>
        </>
      )}
      
      <CommentSectionWrapper issueId={issueId} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Issue"
        description={issue ? `Are you sure you want to delete the issue "${issue.title}"?` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
