import { useState } from "react";
import { Textarea } from "./Textarea";
import { Button } from "./Button";

function CommentSection({
  comments,
  setComments,
  editingId,
  setEditingId,
  editContent,
  setEditContent,
  showAddCommentForm,
  setShowAddCommentForm,
  newCommentText,
  setNewCommentText,
  handleAddComment,
  handleDeleteComment,
  startEdit,
  handleEditSave,
}: {
  comments: Array<{ id: number; author: string; content: string }>;
  setComments: (comments: Array<{ id: number; author: string; content: string }>) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  showAddCommentForm: boolean;
  setShowAddCommentForm: (show: boolean) => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  handleAddComment: () => void;
  handleDeleteComment: (id: number) => void;
  startEdit: (id: number, currentContent: string) => void;
  handleEditSave: () => void;
}) {
  return (
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
  );
};

export default CommentSection; 