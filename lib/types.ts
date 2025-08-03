export type Issue = {
    id: number;
    title: string;
    description: string;
    status: { id: number; name: string };
    priority: { id: number; name: string };
    author: { id: number; name: string } | null;
    created_at: string; // Assuming the date is returned as a string
    updated_at: string; // Assuming the date is returned as a string
    tags: Tag[];
    comments: Comment[];
    comment_count: number;
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
    content: string;
    created_at: string;
    updated_at: string;
    author: { id: number; name: string } | null;
    images?: Image[]; // Optional for backward compatibility
  };
  