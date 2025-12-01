import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongo';
import BlogPost from '@/models/blogPost';
import { serializeBlogPost } from '@/lib/blog';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }
    await connectToDatabase();
    const post = await BlogPost.findById(params.id).lean().exec();
    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }
    return NextResponse.json({ post: serializeBlogPost(post) });
  } catch (error) {
    console.error(`[GET /api/blogs/${params.id}] Error:`, error);
    return NextResponse.json(
      { message: 'Failed to load blog post.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    await connectToDatabase();
    const post = await BlogPost.findById(params.id).exec();
    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission.' },
        { status: 403 }
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

    const preparedTags = Array.isArray(tags)
      ? tags
          .map((tag: string) => tag?.trim())
          .filter((tag: string | undefined): tag is string => Boolean(tag))
      : [];

    post.title = normalizedTitle;
    post.content = normalizedContent;
    post.coverImageUrl = normalizedCover || undefined;
    post.tags = preparedTags;
    await post.save();

    return NextResponse.json({
      success: true,
      message: 'Changes saved.',
      post: serializeBlogPost(post),
    });
  } catch (error) {
    console.error(`[PUT /api/blogs/${params.id}] Error:`, error);
    return NextResponse.json(
      { message: 'Failed to update blog post.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    await connectToDatabase();
    const post = await BlogPost.findById(params.id).exec();
    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission.' },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted.',
    });
  } catch (error) {
    console.error(`[DELETE /api/blogs/${params.id}] Error:`, error);
    return NextResponse.json(
      { message: 'Failed to delete blog post.' },
      { status: 500 }
    );
  }
}
