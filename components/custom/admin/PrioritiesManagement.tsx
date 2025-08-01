"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Priority {
  id: number;
  name: string;
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

  const handleDeletePriority = async (id: number) => {
    if (!confirm("Are you sure you want to delete this priority?")) {
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/priorities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPriorities(prev => prev.filter(priority => priority.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete priority");
      }
    } catch (err) {
      setError("Error deleting priority");
    }
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Priorities Management</h3>
        <div className="text-center text-gray-500">Loading priorities...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Priorities Management</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {/* Add New Priority Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add New Priority</h4>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                <div className="flex-1 flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Priority name"
                    />
                  </div>
                  <div className="flex gap-2">
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
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium">{priority.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEditing(priority)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeletePriority(priority.id)}
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
    </div>
  );
} 