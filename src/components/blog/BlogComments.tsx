"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import type { BlogComment } from '@/types/blog';

type BlogCommentsProps = {
  blogId: string;
  blogAuthorId: string;
};

export function BlogComments({ blogId, blogAuthorId }: BlogCommentsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [updating, setUpdating] = useState(false);

  const sessionUserId = session?.user?.id ?? null;
  const isPostOwner = sessionUserId === blogAuthorId;

  const sortComments = (list: BlogComment[]) =>
    [...list].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return Number(b.isPinned) - Number(a.isPinned);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${blogId}/comments`);
        if (!res.ok) throw new Error('Failed to load comments.');
        const data = await res.json();
        if (mounted) {
          setComments(sortComments(data.comments ?? []));
        }
      } catch (error) {
        console.error('Error loading comments', error);
        toast.error('Unable to load comments.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      mounted = false;
    };
  }, [blogId, toast]);

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      if (comment.status === 'visible') return true;
      if (isPostOwner) return true;
      if (sessionUserId && comment.authorId === sessionUserId) return true;
      return false;
    });
  }, [comments, isPostOwner, sessionUserId]);

  const updateCommentInState = (updated: BlogComment) => {
    setComments((prev) =>
      sortComments(
        prev.map((comment) => (comment.id === updated.id ? updated : comment))
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) {
      toast.warning('Comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post comment.');

      toast.success('Comment posted.');
      setComments((prev) => sortComments([...prev, data.comment]));
      setNewComment('');
    } catch (error: any) {
      const message =
        error?.message || 'Failed to post comment. Please try again.';
      if (message.includes('authenticate')) {
        toast.error('Please sign in to comment.');
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment: BlogComment) => {
    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${comment.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete comment.');

      toast.info('Comment removed.');
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (error: any) {
      toast.error(error?.message || 'Could not delete this comment right now.');
    }
  };

  const startEditing = (comment: BlogComment) => {
    setEditingId(comment.id);
    setEditingValue(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    if (!trimmed) {
      toast.warning('Comment cannot be empty.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update comment.');

      updateCommentInState(data.comment);
      toast.success('Comment updated.');
      cancelEditing();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to update comment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePin = async (comment: BlogComment) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !comment.isPinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update comment.');

      updateCommentInState(data.comment);
      toast.success(data.comment.isPinned ? 'Comment pinned.' : 'Comment unpinned.');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to update comment.');
    }
  };

  const handleToggleVisibility = async (comment: BlogComment) => {
    const nextStatus = comment.status === 'visible' ? 'hidden' : 'visible';
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update comment.');

      updateCommentInState(data.comment);
      toast.info(
        nextStatus === 'hidden'
          ? 'Comment hidden from attendees.'
          : 'Comment is visible again.'
      );
    } catch (error: any) {
      toast.error(error?.message || 'Unable to update comment visibility.');
    }
  };

  const renderComment = (comment: BlogComment) => {
    const isAuthor = sessionUserId === comment.authorId;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        className="rounded-md border border-slate-200 p-4 text-sm shadow-sm dark:border-slate-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p className="font-semibold text-foreground">{comment.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:mt-0 mt-1">
            {isAuthor && !isEditing && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEditing(comment)}
                aria-label="Edit comment"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isPostOwner && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTogglePin(comment)}
                  className="text-xs"
                >
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleVisibility(comment)}
                  className="text-xs"
                >
                  {comment.status === 'visible' ? 'Hide' : 'Show'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(comment)}
                  className="text-xs"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {comment.isPinned && <Badge variant="secondary">Pinned</Badge>}
          {comment.status === 'hidden' && (
            <Badge variant="outline">Hidden</Badge>
          )}
        </div>
        {isEditing ? (
          <div className="mt-3 space-y-2">
            <Textarea
              value={editingValue}
              onChange={(event) => setEditingValue(event.target.value)}
              disabled={updating}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSubmit} disabled={updating}>
                {updating ? 'Saving…' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEditing}
                disabled={updating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-foreground">
            {comment.content}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Comments</h2>
        <p className="text-sm text-muted-foreground">
          Join the discussion. Be respectful and stay on topic.
        </p>
      </div>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post comment'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-900/40">
          Sign in to leave a comment.
        </p>
      )}

      <Separator />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : filteredComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
}
