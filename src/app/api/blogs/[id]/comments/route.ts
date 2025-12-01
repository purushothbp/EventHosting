import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import BlogComment from '@/models/blogComment';

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ comments: [] });
    }

    await connectToDatabase();

    const comments = await BlogComment.find({ blogId: params.id })
      .sort({ isPinned: -1, createdAt: 1 })
      .lean()
      .exec();

    return NextResponse.json({
      comments: comments.map(serializeComment),
    });
  } catch (error) {
    console.error(`[GET /api/blogs/${params.id}/comments]`, error);
    return NextResponse.json(
      { message: 'Failed to load comments.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid blog post.' }, { status: 400 });
    }

    const { content } = await request.json();
    const normalizedContent =
      typeof content === 'string' ? content.trim() : '';

    if (!normalizedContent) {
      return NextResponse.json(
        { message: 'Comment cannot be empty.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const comment = await BlogComment.create({
      blogId: new Types.ObjectId(params.id),
      authorId: new Types.ObjectId(session.user.id),
      authorName: session.user.name || 'Anonymous',
      content: normalizedContent.slice(0, 1000),
      status: 'visible',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Comment posted.',
        comment: serializeComment(comment),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST /api/blogs/${params.id}/comments]`, error);
    return NextResponse.json(
      { message: 'Failed to post comment.' },
      { status: 500 }
    );
  }
}
