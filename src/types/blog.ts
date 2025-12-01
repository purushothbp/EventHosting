export type BlogPost = {
  id: string;
  title: string;
  content: string;
  coverImageUrl?: string | null;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostPayload = {
  title: string;
  content: string;
  coverImageUrl?: string | null;
  tags?: string[];
};

export type BlogComment = {
  id: string;
  blogId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: 'visible' | 'hidden';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};
