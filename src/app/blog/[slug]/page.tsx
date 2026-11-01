import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import rehypeHighlight from 'rehype-highlight';
import { blogMdxComponents } from '@/components/mdx/blog-mdx-components';
import { Header } from '@/sections/header';
import { getAllPosts, getPostBySlug } from '@/utils/blogs';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

  return {
    title: `${post.title} | Mohit Dayma`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      ...(post.coverImage && {
        images: [
          {
            url: post.coverImage,
            width: 1672,
            height: 941,
            alt: post.title,
          },
        ],
      }),
    },
  };
}

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
          {[formatDate(post.publishedAt), post.readTime, ...post.tags].join(
            ' · ',
          )}
        </p>

        {post.coverImage && (
          <div className="mt-10 overflow-hidden rounded-lg border border-line-subtle">
            <Image
              src={post.coverImage}
              alt="Abstract directed social graph with a highlighted recommendation path"
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

        {(previousPost || nextPost) && (
          <nav className="mt-14 grid gap-6 border-t border-line-subtle pt-6 md:grid-cols-2">
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
