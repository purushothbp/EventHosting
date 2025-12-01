import { connectToDatabase } from '@/app/lib/mongo';
import BlogPostModel, { IBlogPost } from '@/models/blogPost';
import type { BlogPost } from '@/types/blog';
import { Types, Document } from 'mongoose';

type BlogPostSource =
  | (IBlogPost & { _id: Types.ObjectId })
  | (Omit<IBlogPost, keyof Document> & { _id: Types.ObjectId });

export function serializeBlogPost(post: BlogPostSource): BlogPost {
  const plain =
    typeof (post as any).toObject === 'function'
      ? (post as any).toObject()
      : post;

  return {
    id: plain._id.toString(),
    title: plain.title,
    content: plain.content,
    coverImageUrl: plain.coverImageUrl || null,
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    authorId: plain.authorId?.toString?.() ?? '',
    authorName: plain.authorName,
    createdAt: plain.createdAt
      ? new Date(plain.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: plain.updatedAt
      ? new Date(plain.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await connectToDatabase();
  const posts = await BlogPostModel.find()
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return posts.map(serializeBlogPost);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  await connectToDatabase();
  const post = await BlogPostModel.findById(id).lean().exec();
  return post ? serializeBlogPost(post) : null;
}
