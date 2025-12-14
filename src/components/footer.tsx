import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/20 bg-white/70 py-6 text-sm text-slate-600 shadow-inner backdrop-blur dark:bg-slate-900/80 dark:text-slate-300">
      <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <p className="text-center md:text-left">
          © {year} Grook.in. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
          <Link href="/legal" className="hover:text-primary underline-offset-4 hover:underline">
            Policies & Agreements
          </Link>
          <a
            href="mailto:teamgrook@gmail.com"
            className="hover:text-primary underline-offset-4 hover:underline"
          >
            teamgrook@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
