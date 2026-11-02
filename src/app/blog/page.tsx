import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';
import { JsonLd } from '@/components/json-ld';
import { Header } from '@/sections/header';
import { getAllPosts } from '@/utils/blogs';
import { absoluteUrl, buildPageMetadata, siteConfig } from '@/utils/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description: siteConfig.blogDescription,
  path: '/blog',
});

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

export default function BlogPage() {
  const posts = getAllPosts();
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} – Blog`,
    description: siteConfig.blogDescription,
    url: absoluteUrl('/blog'),
    author: { '@id': `${siteConfig.url}/#person` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
    })),
  };

  return (
    <main className="shell min-h-screen pb-20 pt-28 md:pt-32">
      <JsonLd data={blogJsonLd} />
      <Header />
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-muted">
          Interactive deep dives on JavaScript internals, system design and
          frontend engineering.
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
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>{' '}
              · {post.readTime}
            </p>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-foreground transition-colors group-hover:text-white">
                {post.title}
              </h2>
              <ArrowUpRightIcon
                className="size-4 shrink-0 text-faint transition-colors group-hover:text-white"
                aria-hidden="true"
              />
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
