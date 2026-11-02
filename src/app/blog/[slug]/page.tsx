import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import rehypeHighlight from 'rehype-highlight';
import { JsonLd } from '@/components/json-ld';
import { blogMdxComponents } from '@/components/mdx/blog-mdx-components';
import { Header } from '@/sections/header';
import { getAllPosts, getPostBySlug, type BlogPost } from '@/utils/blogs';
import { absoluteUrl, buildPageMetadata, siteConfig } from '@/utils/site';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Mohit Dayma',
    };
  }

  const fullTitle = `${post.title} | ${siteConfig.name}`;

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
    // Keep the <title> within ~60 chars so Google doesn't truncate it.
    absoluteTitle: fullTitle.length > 60,
    ...(post.coverImage && {
      image: {
        url: post.coverImage,
        width: 1672,
        height: 941,
        alt: post.coverAlt ?? post.title,
      },
    }),
  });
}

const blogPostingJsonLd = (post: BlogPost) => {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.tags.join(', '),
    image: absoluteUrl(post.coverImage ?? siteConfig.ogImage),
    author: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/#person`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/#person`,
      name: siteConfig.name,
    },
  };
};

const breadcrumbJsonLd = (post: BlogPost) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: absoluteUrl('/blog'),
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: absoluteUrl(`/blog/${post.slug}`),
    },
  ],
});

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const posts = getAllPosts();
  const postIndex = posts.findIndex((entry) => entry.slug === slug);
  const previousPost =
    postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null;

  if (!post) {
    notFound();
  }

  return (
    <main className="shell min-h-screen pb-20 pt-28 md:pt-32">
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(post)} />
      <Header />
      <article className="max-w-none">
        <Link
          href="/blog"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← All posts
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 font-mono text-xs text-faint">
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          {' · '}
          {[post.readTime, ...post.tags].join(' · ')}
        </p>

        {post.coverImage && (
          <div className="mt-10 overflow-hidden rounded-lg border border-line-subtle">
            <Image
              src={post.coverImage}
              alt={post.coverAlt ?? ''}
              width={1672}
              height={941}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full"
              priority
            />
          </div>
        )}

        <div className="prose mt-10 max-w-none space-y-5">
          <MDXRemote
            source={post.content}
            components={blogMdxComponents}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>

        <aside className="mt-14 border-t border-line-subtle pt-6 text-sm text-muted">
          Written by{' '}
          <Link href="/" className="link">
            {siteConfig.name}
          </Link>
          , a software developer working with React, Next.js, React Native and
          NestJS. More posts on the{' '}
          <Link href="/blog" className="link">
            blog
          </Link>
          .
        </aside>

        {(previousPost || nextPost) && (
          <nav className="mt-10 grid gap-6 border-t border-line-subtle pt-6 md:grid-cols-2">
            {previousPost ? (
              <Link href={`/blog/${previousPost.slug}`} className="group">
                <p className="font-mono text-xs text-faint">Previous</p>
                <p className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-white">
                  {previousPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group md:text-right"
              >
                <p className="font-mono text-xs text-faint">Next</p>
                <p className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-white">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}
      </article>
    </main>
  );
}
