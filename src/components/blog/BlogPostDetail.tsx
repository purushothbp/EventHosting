"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { BlogPost } from '@/types/blog';
import { BlogComments } from '@/components/blog/BlogComments';

type BlogPostDetailProps = {
  post: BlogPost;
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function BlogPostDetail({ post }: BlogPostDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const isAuthor = session?.user?.id === post.authorId;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this blog post? This cannot be undone.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${post.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete blog post.');
      }

      toast.success('Blog post deleted.');
      router.push('/blog');
      router.refresh();
    } catch (error: any) {
      const message = error?.message?.includes('permission')
        ? 'You do not have permission.'
        : error?.message || 'Failed to delete blog post.';
      if (message === 'You do not have permission.') {
        toast.error(message);
      } else {
        toast.error(message, { title: 'Unable to delete' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="space-y-10">
      <div className="space-y-4 border-b pb-6">
        <p className="text-sm uppercase text-primary">Blog Post</p>
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span className="font-semibold text-foreground">
            {post.authorName}
          </span>
          <span aria-hidden="true">•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        {isAuthor && (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/blog/${post.id}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}
      </div>
      {post.coverImageUrl && (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="prose max-w-none whitespace-pre-wrap dark:prose-invert">
        {post.content}
      </div>
      <BlogComments blogId={post.id} blogAuthorId={post.authorId} />
    </article>
  );
}
