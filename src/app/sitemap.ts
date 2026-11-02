import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/utils/blogs';
import { absoluteUrl } from '@/utils/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPost = posts[0];
  const latestPostDate = latestPost
    ? new Date(latestPost.updatedAt ?? latestPost.publishedAt)
    : undefined;

  return [
    {
      url: absoluteUrl('/'),
      lastModified: latestPostDate,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
