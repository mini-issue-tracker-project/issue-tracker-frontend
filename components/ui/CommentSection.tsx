import { useState } from "react";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Image } from "@/lib/types";

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
  attachedFiles,
  setAttachedFiles,
}: {
  comments: Array<{ id: number; author: string; content: string; images: Image[] }>;
  setComments: (comments: Array<{ id: number; author: string; content: string; images: Image[] }>) => void;
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
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    // Sadece görselleri alalım
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setAttachedFiles([...attachedFiles, ...imageFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

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
          <div
            className="border-2 border-dashed rounded-md p-4 text-center text-sm text-gray-500"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            Drag & drop images here
            {attachedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>{file.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  <p className="text-sm text-gray-700 w-full whitespace-pre-wrap break-words break-all overflow-hidden"> {comment.content} </p>
                  {comment.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {comment.images.map((image) => (
                        <img
                          key={image.id} // Use the unique id as the key
                          src={image.url}
                          alt={image.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
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