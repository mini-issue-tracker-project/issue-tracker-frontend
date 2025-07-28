export type Issue = {
    id: number;
    title: string;
    description: string;
    status: "open" | "in_progress" | "closed";
    priority: "low" | "medium" | "high";
    author: { id: number; name: string } | null;
    created_at: string; // Assuming the date is returned as a string
    updated_at: string; // Assuming the date is returned as a string
    tags: Tag[];
    comments: Comment[];
    assignee_id?: number; // Optional as it can be null
};

export type Tag = {
    id: number;
    name: string;
    color?: string; // Optional as it can be null
};

  export type Image = {
    id: number;
    name: string;
    url: string;
  };

  export type Comment = {
    id: number;
    author: string;
    content: string;
    images: Image[];
  };
  