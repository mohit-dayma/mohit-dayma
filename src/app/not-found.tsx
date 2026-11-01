import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell flex min-h-screen flex-col items-start justify-center">
      <p className="font-mono text-xs text-faint">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-9 items-center rounded-md border border-line px-4 text-sm text-foreground transition-colors hover:bg-surface-hover"
      >
        Back home
      </Link>
    </div>
  );
}
