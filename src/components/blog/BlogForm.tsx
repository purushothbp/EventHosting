'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import type { BlogPost } from '@/types/blog';

type BlogFormProps = {
  mode: 'create' | 'edit';
  initialValues?: BlogPost;
  postId?: string;
};

type FormState = {
  title: string;
  content: string;
  coverImageUrl: string;
  tags: string;
};

const defaultFormState: FormState = {
  title: '',
  content: '',
  coverImageUrl: '',
  tags: '',
};

export default function BlogForm({
  mode,
  initialValues,
  postId,
}: BlogFormProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    title: initialValues?.title ?? '',
    content: initialValues?.content ?? '',
    coverImageUrl: initialValues?.coverImageUrl ?? '',
    tags: initialValues?.tags?.join(', ') ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const canEdit =
    mode === 'create' ||
    (initialValues && session?.user?.id === initialValues.authorId);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formState.title.trim(),
        content: formState.content.trim(),
        coverImageUrl: formState.coverImageUrl.trim() || undefined,
        tags: formState.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      const response = await fetch(
        mode === 'create' ? '/api/blogs' : `/api/blogs/${postId}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save blog post.');
      }

      const toastMessage =
        mode === 'create' ? 'Blog post published!' : 'Changes saved.';
      toast.success(toastMessage);

      const targetId = data.post?.id ?? postId;
      if (targetId) {
        router.push(`/blog/${targetId}`);
      } else {
        router.push('/blog');
      }
      router.refresh();
      if (mode === 'create') {
        setFormState(defaultFormState);
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to save blog post.';
      if (message.includes('permission')) {
        toast.error('You do not have permission.');
      } else {
        toast.error(message, { title: 'Unable to save post' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Sign in to share updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Blogging is available to authenticated members only.
          </p>
          <Button onClick={() => router.push('/login')}>Go to sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (!canEdit) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            You do not have permission to edit this post.
          </p>
          <Button variant="outline" onClick={() => router.push('/blog')}>
            Back to blog
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Write a new post' : 'Update your post'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Give your post a clear title"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share your update."
              className="min-h-[240px]"
              value={formState.content}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover image URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              placeholder="https://example.com/photo.jpg"
              value={formState.coverImageUrl}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">
              Uploads are not available yet—paste an existing image URL if you
              want a cover image.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="events, updates, recap"
              value={formState.tags}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">
              Separate tags with commas to help readers discover similar posts.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? mode === 'create'
              ? 'Publishing…'
              : 'Saving…'
            : mode === 'create'
            ? 'Publish post'
            : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
