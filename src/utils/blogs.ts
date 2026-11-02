import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  coverImage?: string;
  coverAlt?: string;
  tags: string[];
  content: string;
}

interface Frontmatter {
  title?: string;
  excerpt?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  readTime?: string;
  coverImage?: string;
  coverAlt?: string;
  tags?: string[] | string;
}

const normalizeTags = (tags: Frontmatter['tags']): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const normalizeDate = (date: Frontmatter['publishedAt']) => {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  return String(date).trim();
};

const isValidDate = (date: string) =>
  date !== '' && !Number.isNaN(new Date(date).getTime());

/** Newest `updatedAt ?? publishedAt` across all posts, or undefined. */
export const getLatestPostDate = (posts: BlogPost[]): Date | undefined => {
  const timestamps = posts.map((post) =>
    new Date(post.updatedAt ?? post.publishedAt).getTime(),
  );
  return timestamps.length ? new Date(Math.max(...timestamps)) : undefined;
};

const getPostFromFile = (fileName: string): BlogPost | null => {
  const filePath = path.join(BLOG_DIR, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  const frontmatter = data as Frontmatter;

  if (!frontmatter.title || !frontmatter.publishedAt) {
    return null;
  }

  const publishedAt = normalizeDate(frontmatter.publishedAt);
  if (!isValidDate(publishedAt)) {
    return null;
  }
  const updatedAt = normalizeDate(frontmatter.updatedAt);

  return {
    slug: fileName.replace(/\.(md|mdx)$/i, ''),
    title: frontmatter.title,
    excerpt: frontmatter.excerpt || '',
    publishedAt,
    updatedAt: isValidDate(updatedAt) ? updatedAt : undefined,
    readTime: frontmatter.readTime || '5 min read',
    coverImage: frontmatter.coverImage || undefined,
    coverAlt: frontmatter.coverAlt || undefined,
    tags: normalizeTags(frontmatter.tags),
    content: content.trim(),
  };
};

export const getAllPosts = (): BlogPost[] => {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((fileName) => /\.(md|mdx)$/i.test(fileName))
    .map((fileName) => getPostFromFile(fileName))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
};

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  getAllPosts().find((post) => post.slug === slug);
