import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

type BlogFeedProps = {
  posts: BlogPost[];
  canCreate: boolean;
};

export default function BlogFeed({ posts, canCreate }: BlogFeedProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              Community Stories
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Blog & Updates
            </h1>
            <p className="text-muted-foreground">
              Read updates from event organizers and share your own wins.
            </p>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/blog/new">Create new post</Link>
            </Button>
          )}
        </div>
        <p className="rounded-md border border-amber-200/70 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Cover images are optional—paste an existing image URL if you have one.
          In-app uploads will arrive soon.
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <h3 className="text-lg font-semibold">No posts yet</h3>
          <p className="mt-2 text-muted-foreground">
            Once organizers start publishing, their stories will appear here.
          </p>
          {canCreate && (
            <Button asChild className="mt-4">
              <Link href="/blog/new">Be the first to write</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
