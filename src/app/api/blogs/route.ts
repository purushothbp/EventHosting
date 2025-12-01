import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import BlogPost from '@/models/blogPost';
import { serializeBlogPost } from '@/lib/blog';
import { Types } from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await BlogPost.find().sort({ createdAt: -1 }).lean().exec();
    return NextResponse.json({ posts: posts.map(serializeBlogPost) });
  } catch (error) {
    console.error('[GET /api/blogs] Error:', error);
    return NextResponse.json(
      { message: 'Failed to load blog posts.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const { title, content, coverImageUrl, tags } = await request.json();
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedContent = typeof content === 'string' ? content.trim() : '';
    const normalizedCover =
      typeof coverImageUrl === 'string' ? coverImageUrl.trim() : '';

    if (!normalizedTitle || !normalizedContent) {
      return NextResponse.json(
        { message: 'Title and content are required.' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { message: 'Invalid user id.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const preparedTags = Array.isArray(tags)
      ? tags
          .map((tag: string) => tag?.trim())
          .filter((tag: string | undefined): tag is string => Boolean(tag))
      : [];

    const post = await BlogPost.create({
      title: normalizedTitle,
      content: normalizedContent,
      coverImageUrl: normalizedCover || undefined,
      tags: preparedTags,
      authorId: new Types.ObjectId(session.user.id),
      authorName: session.user.name || 'Unknown author',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post published!',
        post: serializeBlogPost(post),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/blogs] Error:', error);
    return NextResponse.json(
      { message: 'Failed to publish blog post.' },
      { status: 500 }
    );
  }
}
