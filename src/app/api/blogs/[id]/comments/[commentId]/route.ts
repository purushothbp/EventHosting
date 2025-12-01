import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import BlogComment from '@/models/blogComment';
import BlogPost from '@/models/blogPost';

const serializeComment = (comment: any) => ({
  id: comment._id.toString(),
  blogId: comment.blogId.toString(),
  authorId: comment.authorId.toString(),
  authorName: comment.authorName,
  content: comment.content,
  status: comment.status,
  isPinned: Boolean(comment.isPinned),
  createdAt: comment.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: comment.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

type Params = {
  params: {
    id: string;
    commentId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    if (
      !Types.ObjectId.isValid(params.id) ||
      !Types.ObjectId.isValid(params.commentId)
    ) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }

    const body = await request.json();
    const hasContent = typeof body.content === 'string';
    const hasStatus = body.status === 'visible' || body.status === 'hidden';
    const hasPinned = typeof body.isPinned === 'boolean';

    if (!hasContent && !hasStatus && !hasPinned) {
      return NextResponse.json(
        { message: 'Nothing to update.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const [comment, post] = await Promise.all([
      BlogComment.findOne({
        _id: params.commentId,
        blogId: params.id,
      }).exec(),
      BlogPost.findById(params.id).select('authorId').lean().exec(),
    ]);

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }

    const isPostOwner = Boolean(
      post && post.authorId && post.authorId.toString() === session.user.id
    );
    const isCommentAuthor = comment.authorId.toString() === session.user.id;

    if (hasContent) {
      if (!isCommentAuthor) {
        return NextResponse.json(
          { message: 'You do not have permission to edit this comment.' },
          { status: 403 }
        );
      }
      const trimmed = body.content.trim();
      if (!trimmed) {
        return NextResponse.json(
          { message: 'Comment cannot be empty.' },
          { status: 400 }
        );
      }
      comment.content = trimmed.slice(0, 1000);
    }

    if (hasStatus || hasPinned) {
      if (!isPostOwner) {
        return NextResponse.json(
          { message: 'Only the post owner can manage comment visibility.' },
          { status: 403 }
        );
      }
      if (hasStatus) {
        comment.status = body.status;
      }
      if (hasPinned) {
        comment.isPinned = body.isPinned;
      }
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      message: 'Comment updated.',
      comment: serializeComment(comment),
    });
  } catch (error) {
    console.error(
      `[PATCH /api/blogs/${params.id}/comments/${params.commentId}]`,
      error
    );
    return NextResponse.json(
      { message: 'Failed to update comment.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    if (
      !Types.ObjectId.isValid(params.id) ||
      !Types.ObjectId.isValid(params.commentId)
    ) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }

    await connectToDatabase();
    const [comment, post] = await Promise.all([
      BlogComment.findOne({
        _id: params.commentId,
        blogId: params.id,
      }).exec(),
      BlogPost.findById(params.id).select('authorId').lean().exec(),
    ]);

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }

    const isPostOwner = Boolean(
      post && post.authorId && post.authorId.toString() === session.user.id
    );

    if (!isPostOwner) {
      return NextResponse.json(
        { message: 'Only the post owner can delete comments.' },
        { status: 403 }
      );
    }

    await comment.deleteOne();

    return NextResponse.json({ success: true, message: 'Comment removed.' });
  } catch (error) {
    console.error(
      `[DELETE /api/blogs/${params.id}/comments/${params.commentId}]`,
      error
    );
    return NextResponse.json(
      { message: 'Failed to delete comment.' },
      { status: 500 }
    );
  }
}
