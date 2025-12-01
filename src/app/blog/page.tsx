import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import BlogFeed from '@/components/blog/BlogFeed';
import { getAllBlogPosts } from '@/lib/blog';

export default async function BlogPage() {
  const [posts, session] = await Promise.all([
    getAllBlogPosts(),
    getServerSession(authOptions),
  ]);

  return <BlogFeed posts={posts} canCreate={Boolean(session?.user)} />;
}
