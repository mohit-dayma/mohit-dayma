import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';
import { Header } from '@/sections/header';
import { getAllPosts } from '@/utils/blogs';

export const metadata: Metadata = {
  title: 'Blog | Mohit Dayma',
  description: 'Notes on frontend engineering, design systems, and product UX.',
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="shell min-h-screen pb-20 pt-28 md:pt-32">
      <Header />
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-muted">
          Notes on frontend engineering and interface craft.
        </p>
      </section>
      <div className="mt-10 divide-y divide-line-subtle">
        {posts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className="-mx-3 group flex flex-col gap-1 rounded-md px-3 py-5 transition-colors hover:bg-surface-hover"
          >
            <p className="font-mono text-xs text-faint">
              {formatDate(post.publishedAt)} · {post.readTime}
            </p>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-foreground transition-colors group-hover:text-white">
                {post.title}
              </h2>
              <ArrowUpRightIcon className="size-4 shrink-0 text-faint transition-colors group-hover:text-white" />
            </div>
            <p className="line-clamp-2 text-sm text-muted">{post.excerpt}</p>
            <p className="font-mono text-xs text-faint">
              {post.tags.join(' · ')}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
