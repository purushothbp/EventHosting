import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  authorId: Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    content: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const BlogPost = models.BlogPost || model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
