import Link from 'next/link';

export const Header = () => (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-line-subtle bg-background/80 backdrop-blur">
    <div className="shell flex h-14 items-center justify-between">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        Mohit Dayma
      </Link>
      <nav className="flex items-center gap-5 text-sm text-muted">
        <Link href="/blog" className="transition-colors hover:text-foreground">
          Blogs
        </Link>
      </nav>
    </div>
  </header>
);
