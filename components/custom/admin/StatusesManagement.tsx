"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";

interface Status {
  id: number;
  name: string;
}

interface AffectedIssue {
  id: number;
  title: string;
}

interface StatusesManagementProps {
  isAdmin: boolean;
}

export default function StatusesManagement({ isAdmin }: StatusesManagementProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({ name: "" });
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Status | null>(null);
  const [affectedIssues, setAffectedIssues] = useState<AffectedIssue[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch statuses on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetchStatuses();
  }, [isAdmin]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/statuses");
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      } else {
        setError("Failed to fetch statuses");
      }
    } catch (err) {
      setError("Error fetching statuses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatus.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth("/api/statuses", {
        method: "POST",
        body: JSON.stringify(newStatus),
      });

      if (response.ok) {
        const createdStatus = await response.json();
        setStatuses(prev => [...prev, createdStatus]);
        setNewStatus({ name: "" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create status");
      }
    } catch (err) {
      setError("Error creating status");
    }
  };

  const handleUpdateStatus = async (id: number) => {
    if (!editForm.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/statuses/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedStatus = await response.json();
        setStatuses(prev => prev.map(status => status.id === id ? updatedStatus : status));
        setEditingStatus(null);
        setEditForm({ name: "" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update status");
      }
    } catch (err) {
      setError("Error updating status");
    }
  };

  const handleDeleteStatus = async (status: Status) => {
    setDeleteTarget(status);
    setDeleteError(null);
    setAffectedIssues([]);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStatus = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const response = await fetchWithAuth(`/api/statuses/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatuses(prev => prev.filter(status => status.id !== deleteTarget.id));
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        setAffectedIssues([]);
        setDeleteError(null);
      } else {
        const errorData = await response.json();
        if (errorData.error === "Cannot delete, in use") {
          setAffectedIssues(errorData.affected_issues || []);
          setDeleteError(errorData.message || "Cannot delete status that is in use");
        } else {
          setDeleteError(errorData.error || "Failed to delete status");
        }
      }
    } catch (err) {
      setDeleteError("Error deleting status");
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

  const startEditing = (status: Status) => {
    setEditingStatus(status.id);
    setEditForm({ name: status.name });
  };

  const cancelEditing = () => {
    setEditingStatus(null);
    setEditForm({ name: "" });
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Statuses Management</h3>
        <div className="text-center text-gray-500">Loading statuses...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Statuses Management</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {/* Add New Status Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add New Status</h4>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="new-status-name">Name</Label>
            <Input
              id="new-status-name"
              value={newStatus.name}
              onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter status name"
            />
          </div>
          <Button
            onClick={handleCreateStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Status
          </Button>
        </div>
      </div>

      {/* Statuses List */}
      <div className="space-y-3">
        {statuses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No statuses found</p>
        ) : (
          statuses.map((status) => (
            <div key={status.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              {editingStatus === status.id ? (
                // Edit Mode
                <div className="flex-1 flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Status name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStatus(status.id)}
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
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium">{status.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEditing(status)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteStatus(status)}
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
            <DialogTitle>Delete Status</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `Are you sure you want to delete the status "${deleteTarget.name}"?` : ""}
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 mb-4">
              <p className="font-medium mb-2">{deleteError}</p>
              {affectedIssues.length > 0 && (
                <div>
                  <p className="text-sm mb-2">The following issues are using this status:</p>
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
              onClick={confirmDeleteStatus}
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