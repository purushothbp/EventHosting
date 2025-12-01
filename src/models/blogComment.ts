import { Schema, model, models, Types, Document } from 'mongoose';

export interface IBlogComment extends Document {
  blogId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorName: string;
  content: string;
  status: 'visible' | 'hidden';
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCommentSchema = new Schema<IBlogComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: true,
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BlogComment =
  models.BlogComment || model<IBlogComment>('BlogComment', BlogCommentSchema);

export default BlogComment;
