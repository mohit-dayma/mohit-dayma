import type { Metadata } from 'next';
import { footerLinks } from './constants';

export const siteConfig = {
  url: 'https://mohitd.com',
  name: 'Mohit Dayma',
  jobTitle: 'Software Developer',
  title: 'Mohit Dayma - Software Developer (React, Next.js, Node.js)',
  description:
    'Mohit Dayma is a software developer building web and mobile apps with React, Next.js, React Native and NestJS. Projects, interactive deep dives and notes.',
  blogDescription:
    'Interactive deep dives on JavaScript internals, system design and frontend engineering by Mohit Dayma.',
  twitterHandle: '@mohitt_dayma',
  ogImage: '/og',
  rssPath: '/rss.xml',
  locale: 'en_US',
} as const;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).href;

export const socialProfiles = footerLinks.map((link) => link.href);

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Skip the "| Mohit Dayma" title template (for already-long titles). */
  absoluteTitle?: boolean;
}

/**
 * Child metadata is shallow-merged in Next.js, so a page that sets
 * `openGraph` or `twitter` replaces the root values entirely. This builds
 * the complete set for a page so nothing (image, url, site name) is lost.
 */
export const buildPageMetadata = ({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  absoluteTitle = false,
}: PageMetadataInput): Metadata => {
  const ogImage = image ?? {
    url: siteConfig.ogImage,
    width: 1200,
    height: 630,
    alt: siteConfig.title,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      types: {
        'application/rss+xml': [
          { url: siteConfig.rssPath, title: `${siteConfig.name} – Blog` },
        ],
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [ogImage],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime: modifiedTime ?? publishedTime,
        authors: [siteConfig.url],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: siteConfig.twitterHandle,
      images: [ogImage],
    },
  };
};
