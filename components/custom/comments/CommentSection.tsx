import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { fetchWithAuth } from "@/app/utils/api";
import { useAuth } from "@/app/context/AuthContext";
import { Comment } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface CommentsData {
  data: Comment[];
  total_count: number;
  skip: number;
  limit: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

function CommentSection({ issueId }: { issueId: number }) {
  const { user, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Helper to get query params as object
  const getQuery = () => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => { obj[k] = v; });
    return obj;
  };
  const query = getQuery();
  
  // State for comments data
  const [commentsData, setCommentsData] = useState<CommentsData>({
    data: [],
    total_count: 0,
    skip: 0,
    limit: 5
  });
  
  // State for UI
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  // Fetch comments when query changes
  useEffect(() => {
    const skipQ = typeof query.skip === 'string' ? parseInt(query.skip) : 0;
    const limitQ = typeof query.limit === 'string' ? parseInt(query.limit) : 5;
    
    setCommentsData(prev => ({
      ...prev,
      skip: isNaN(skipQ) ? 0 : skipQ,
      limit: isNaN(limitQ) ? 5 : limitQ
    }));
    
          const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter(([k, v]) => v !== undefined)),
        skip: String(isNaN(skipQ) ? 0 : skipQ),
        limit: String(isNaN(limitQ) ? 5 : limitQ),
      });

    setIsLoading(true);
    fetchWithAuth(`/api/issues/${issueId}/comments?${params}`)
      .then(response => response.json())
      .then(data => {
        setCommentsData(data);
      })
      .catch(error => console.error('Error fetching comments:', error))
      .finally(() => setIsLoading(false));
  }, [searchParams, issueId]);

  // Fetch available users for filter dropdown
  useEffect(() => {
    fetchWithAuth('/api/users')
      .then(response => response.json())
      .then(setAvailableUsers)
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Helper to reload comments
  const loadComments = () => {
    const skipQ = typeof query.skip === 'string' ? parseInt(query.skip) : 0;
    const limitQ = typeof query.limit === 'string' ? parseInt(query.limit) : 5;
    const params = new URLSearchParams({
      ...Object.fromEntries(Object.entries(query).filter(([k, v]) => v !== undefined)),
      skip: String(isNaN(skipQ) ? 0 : skipQ),
      limit: String(isNaN(limitQ) ? 5 : limitQ),
    });
    setIsLoading(true);
    fetchWithAuth(`/api/issues/${issueId}/comments?${params}`)
      .then(response => response.json())
      .then(data => {
        setCommentsData(data);
      })
      .catch(error => console.error('Error fetching comments:', error))
      .finally(() => setIsLoading(false));
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (newCommentText.trim() === "") return;
    
    try {
      const response = await fetchWithAuth(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText })
      });
      
      if (response.ok) {
        const newComment = await response.json();
        setCommentsData(prev => ({
          ...prev,
          data: [...prev.data, newComment],
          total_count: prev.total_count + 1
        }));
        setNewCommentText("");
        setShowAddCommentForm(false);
        loadComments();
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle editing a comment
  const handleEditSave = async () => {
    if (!editingId || editContent.trim() === "") return;
    
    try {
      const response = await fetchWithAuth(`/api/comments/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editContent })
      });
      
      if (response.ok) {
        setEditingId(null);
        setEditContent("");
        loadComments();
      } else {
        console.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = (comment: Comment) => {
    setDeleteTarget(comment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteComment = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await fetchWithAuth(`/api/comments/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCommentsData(prev => ({
          ...prev,
          data: prev.data.filter(c => c.id !== deleteTarget.id),
          total_count: prev.total_count - 1
        }));
        loadComments();
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // For router.push, use router.push(url) with a string
  const updateQuery = (newQuery: Record<string, any>) => {
    const params = new URLSearchParams({ ...query, ...newQuery });
    router.push(`/issues/${issueId}?${params.toString()}`);
  };

  const startEdit = (id: number, currentContent: string) => {
    setEditingId(id);
    setEditContent(currentContent);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Comments ({commentsData.total_count})</h2>
        <div className="flex gap-2">
          {user && (
            <Button
              onClick={() => setShowAddCommentForm(!showAddCommentForm)}
              variant="outline"
            >
              {showAddCommentForm ? "Cancel" : "New Comment"}
            </Button>
          )}
          {/* Filter button with icon */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="author-filter">Author Name</Label>
              <Input
                id="author-filter"
                type="text"
                placeholder="Search by author name"
                value={query.author_name || ""}
                onChange={(e) => {
                  const newQuery = { ...query };
                  if (e.target.value) {
                    newQuery.author_name = e.target.value;
                  } else {
                    delete newQuery.author_name;
                  }
                  newQuery.skip = '0'; // Reset pagination
                  const params = new URLSearchParams(newQuery);
                  router.push(`/issues/${issueId}?${params.toString()}`);
                }}
              />
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={query.start || ""}
                onChange={(e) => {
                  const newQuery = { ...query };
                  if (e.target.value) {
                    newQuery.start = e.target.value;
                  } else {
                    delete newQuery.start;
                  }
                  newQuery.skip = '0'; // Reset pagination
                  const params = new URLSearchParams(newQuery);
                  router.push(`/issues/${issueId}?${params.toString()}`);
                }}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={query.end || ""}
                onChange={(e) => {
                  const newQuery = { ...query };
                  if (e.target.value) {
                    newQuery.end = e.target.value;
                  } else {
                    delete newQuery.end;
                  }
                  newQuery.skip = '0'; // Reset pagination
                  const params = new URLSearchParams(newQuery);
                  router.push(`/issues/${issueId}?${params.toString()}`);
                }}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={() => {
                router.push(`/issues/${issueId}`);
                setShowFilters(false);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Add Comment Form */}
      {showAddCommentForm && user && (
        <div className="mb-4 space-y-2">
          <Textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write your comment..."
          />
          <Button onClick={handleAddComment}>Add Comment</Button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : (
        <ul className="space-y-3">
          {commentsData.data.map((comment) => {
            const authorId = comment.author?.id;
            const canEdit = role === 'admin' || (user && user.id === authorId);
            return (
              <li
                key={comment.id}
                className="p-3 rounded-lg bg-gray-50 border flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-800">
                      {comment.author?.name || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-500">
                      Updated at: {new Date(comment.updated_at).toLocaleString()}
                    </span>
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        className="w-full resize-none overflow-hidden whitespace-pre-wrap break-words break-all"
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
                    <div className="max-w-full overflow-hidden">
                      <p className="text-sm text-gray-700 w-full whitespace-pre-wrap break-words break-all overflow-hidden">
                        {comment.content}
                      </p>
                    </div>
                  )}
                </div>
                {editingId !== comment.id && canEdit && (
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
                      onClick={() => handleDeleteComment(comment)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {commentsData.total_count > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {commentsData.skip + 1} to {Math.min(commentsData.skip + commentsData.limit, commentsData.total_count)} of {commentsData.total_count} comments
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuery({ skip: Math.max(0, commentsData.skip - commentsData.limit) })}
              disabled={commentsData.skip === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuery({ skip: commentsData.skip + commentsData.limit })}
              disabled={commentsData.skip + commentsData.limit >= commentsData.total_count}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Comment"
        description={deleteTarget ? `Are you sure you want to delete this comment?` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteComment}
        variant="destructive"
      />
    </div>
  );
}

export default CommentSection;