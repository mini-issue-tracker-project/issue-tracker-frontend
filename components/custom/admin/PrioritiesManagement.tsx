"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/utils/api";
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui";

interface Priority {
  id: number;
  name: string;
}

interface AffectedIssue {
  id: number;
  title: string;
}

interface PrioritiesManagementProps {
  isAdmin: boolean;
}

export default function PrioritiesManagement({ isAdmin }: PrioritiesManagementProps) {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState({ name: "" });
  const [editingPriority, setEditingPriority] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Priority | null>(null);
  const [affectedIssues, setAffectedIssues] = useState<AffectedIssue[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch priorities on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetchPriorities();
  }, [isAdmin]);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/priorities");
      if (response.ok) {
        const data = await response.json();
        setPriorities(data);
      } else {
        setError("Failed to fetch priorities");
      }
    } catch (err) {
      setError("Error fetching priorities");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePriority = async () => {
    if (!newPriority.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth("/api/priorities", {
        method: "POST",
        body: JSON.stringify(newPriority),
      });

      if (response.ok) {
        const createdPriority = await response.json();
        setPriorities(prev => [...prev, createdPriority]);
        setNewPriority({ name: "" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create priority");
      }
    } catch (err) {
      setError("Error creating priority");
    }
  };

  const handleUpdatePriority = async (id: number) => {
    if (!editForm.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/priorities/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedPriority = await response.json();
        setPriorities(prev => prev.map(priority => priority.id === id ? updatedPriority : priority));
        setEditingPriority(null);
        setEditForm({ name: "" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update priority");
      }
    } catch (err) {
      setError("Error updating priority");
    }
  };

  const handleDeletePriority = async (priority: Priority) => {
    setDeleteTarget(priority);
    setDeleteError(null);
    setAffectedIssues([]);
    setShowDeleteDialog(true);
  };

  const confirmDeletePriority = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const response = await fetchWithAuth(`/api/priorities/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPriorities(prev => prev.filter(priority => priority.id !== deleteTarget.id));
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        setAffectedIssues([]);
        setDeleteError(null);
      } else {
        const errorData = await response.json();
        if (errorData.error === "Cannot delete, in use") {
          setAffectedIssues(errorData.affected_issues || []);
          setDeleteError(errorData.message || "Cannot delete priority that is in use");
        } else {
          setDeleteError(errorData.error || "Failed to delete priority");
        }
      }
    } catch (err) {
      setDeleteError("Error deleting priority");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    setAffectedIssues([]);
    setDeleteError(null);
  };

  const startEditing = (priority: Priority) => {
    setEditingPriority(priority.id);
    setEditForm({ name: priority.name });
  };

  const cancelEditing = () => {
    setEditingPriority(null);
    setEditForm({ name: "" });
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500">Loading priorities...</div>
    );
  }

  return (
    <div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {/* Add New Priority Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add New Priority</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0">
            <Label htmlFor="new-priority-name">Name</Label>
            <Input
              id="new-priority-name"
              value={newPriority.name}
              onChange={(e) => setNewPriority(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter priority name"
            />
          </div>
          <Button
            onClick={handleCreatePriority}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
          >
            Add Priority
          </Button>
        </div>
      </div>

      {/* Priorities List */}
      <div className="space-y-3">
        {priorities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No priorities found</p>
        ) : (
          priorities.map((priority) => (
            <div key={priority.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              {editingPriority === priority.id ? (
                // Edit Mode
                <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center min-w-0">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Priority name"
                    />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleUpdatePriority(priority.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium truncate">{priority.name}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => startEditing(priority)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeletePriority(priority)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Custom Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Priority</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `Are you sure you want to delete the priority "${deleteTarget.name}"?` : ""}
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 mb-4">
              <p className="font-medium mb-2">{deleteError}</p>
              {affectedIssues.length > 0 && (
                <div>
                  <p className="text-sm mb-2">The following issues are using this priority:</p>
                  <ul className="text-sm space-y-1">
                    {affectedIssues.map((issue) => (
                      <li key={issue.id} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        <a 
                          href={`/issues/${issue.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {issue.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={closeDeleteDialog}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePriority}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : (deleteError ? "Retry Delete" : "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 