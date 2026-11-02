import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  coverImage?: string;
  tags: string[];
  content: string;
}

interface Frontmatter {
  title?: string;
  excerpt?: string;
  publishedAt?: string | Date;
  readTime?: string;
  coverImage?: string;
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

const normalizePublishedAt = (publishedAt: Frontmatter['publishedAt']) => {
  if (!publishedAt) return '';
  if (publishedAt instanceof Date) {
    return publishedAt.toISOString().slice(0, 10);
  }
  return String(publishedAt).trim();
};

const getPostFromFile = (fileName: string): BlogPost | null => {
  const filePath = path.join(BLOG_DIR, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  const frontmatter = data as Frontmatter;

  if (!frontmatter.title || !frontmatter.publishedAt) {
    return null;
  }

  return {
    slug: fileName.replace(/\.(md|mdx)$/i, ''),
    title: frontmatter.title,
    excerpt: frontmatter.excerpt || '',
    publishedAt: normalizePublishedAt(frontmatter.publishedAt),
    readTime: frontmatter.readTime || '5 min read',
    coverImage: frontmatter.coverImage || undefined,
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
