import { getAllPosts } from '@/utils/blogs';
import { absoluteUrl, siteConfig } from '@/utils/site';

export const dynamic = 'force-static';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function GET() {
  const posts = getAllPosts();
  const feedUrl = absoluteUrl('/blog/rss.xml');

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} – Blog`)}</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>${escapeXml(siteConfig.blogDescription)}</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].publishedAt).toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
