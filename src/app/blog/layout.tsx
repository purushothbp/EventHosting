import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">{children}</div>
    </div>
  );
}
