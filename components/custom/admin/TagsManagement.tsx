"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/app/utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagsManagementProps {
  isAdmin: boolean;
}

export default function TagsManagement({ isAdmin }: TagsManagementProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: "", color: "#3B82F6" });
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", color: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  // Fetch tags on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetchTags();
  }, [isAdmin]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        setError("Failed to fetch tags");
      }
    } catch (err) {
      setError("Error fetching tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim() || !newTag.color.trim()) {
      setError("Name and color are required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth("/api/tags", {
        method: "POST",
        body: JSON.stringify(newTag),
      });

      if (response.ok) {
        const createdTag = await response.json();
        setTags(prev => [...prev, createdTag]);
        setNewTag({ name: "", color: "#3B82F6" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create tag");
      }
    } catch (err) {
      setError("Error creating tag");
    }
  };

  const handleUpdateTag = async (id: number) => {
    if (!editForm.name.trim() || !editForm.color.trim()) {
      setError("Name and color are required");
      return;
    }

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedTag = await response.json();
        setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
        setEditingTag(null);
        setEditForm({ name: "", color: "" });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update tag");
      }
    } catch (err) {
      setError("Error updating tag");
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    setDeleteTarget(tag);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTag = async () => {
    if (!deleteTarget) return;

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/tags/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== deleteTarget.id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete tag");
      }
    } catch (err) {
      setError("Error deleting tag");
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditForm({ name: tag.name, color: tag.color });
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditForm({ name: "", color: "" });
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500">Loading tags...</div>
    );
  }

  return (
    <div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {/* Add New Tag Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add New Tag</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0">
            <Label htmlFor="new-tag-name">Name</Label>
            <Input
              id="new-tag-name"
              value={newTag.name}
              onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tag name"
            />
          </div>
          <Button
            onClick={handleCreateTag}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
          >
            Add Tag
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end mt-4">
          <div className="flex-1 min-w-0">
              <Label htmlFor="new-tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="new-tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10 p-1 flex-shrink-0"
                />
                <Input
                  value={newTag.color}
                  onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
          </div>
      </div>

      {/* Tags List */}
      <div className="space-y-3">
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tags found</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              {editingTag === tag.id ? (
                // Edit Mode
                <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center min-w-0">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tag name"
                    />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Input
                      type="color"
                      value={editForm.color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={editForm.color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                      className="w-24"
                    />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleUpdateTag(tag.id)}
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
                    <div
                      className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium truncate">{tag.name}</span>
                    <span className="text-sm text-gray-500 flex-shrink-0">#{tag.color}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => startEditing(tag)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteTag(tag)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Tag"
        description={deleteTarget ? `Are you sure you want to delete the tag "${deleteTarget.name}"?` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTag}
        variant="destructive"
      />
    </div>
  );
} 