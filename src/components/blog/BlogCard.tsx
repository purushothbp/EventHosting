import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/types/blog';

type BlogCardProps = {
  post: BlogPost;
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getExcerpt = (content: string, length = 180) => {
  if (content.length <= length) return content;
  return `${content.slice(0, length)}…`;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm transition hover:shadow-md dark:border-slate-800">
      {post.coverImageUrl ? (
        <div className="h-48 w-full overflow-hidden bg-muted">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
      )}
      <CardHeader>
        <CardTitle className="text-2xl">
          <Link
            href={`/blog/${post.id}`}
            className="transition hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {post.authorName} · {formatDate(post.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{getExcerpt(post.content)}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
