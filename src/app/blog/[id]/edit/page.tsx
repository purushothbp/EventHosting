import { notFound } from 'next/navigation';
import BlogForm from '@/components/blog/BlogForm';
import { getBlogPostById } from '@/lib/blog';

type Props = {
  params: {
    id: string;
  };
};

export default async function EditBlogPostPage({ params }: Props) {
  const post = await getBlogPostById(params.id);
  if (!post) {
    notFound();
  }

  return <BlogForm mode="edit" initialValues={post} postId={post.id} />;
}
