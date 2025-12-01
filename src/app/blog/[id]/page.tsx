import { notFound } from 'next/navigation';
import BlogPostDetail from '@/components/blog/BlogPostDetail';
import { getBlogPostById } from '@/lib/blog';

type Props = {
  params: {
    id: string;
  };
};

export default async function BlogDetailPage({ params }: Props) {
  const post = await getBlogPostById(params.id);
  if (!post) {
    notFound();
  }

  return <BlogPostDetail post={post} />;
}
