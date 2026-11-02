import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/sections/header";
import { PlaneFlyover } from "@/components/plane-flyover";
import { getAllPosts } from "@/utils/blogs";
import { footerLinks, portfolioProjects } from "@/utils/constants";
import {
  absoluteUrl,
  buildPageMetadata,
  siteConfig,
  socialProfiles,
} from "@/utils/site";

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.name,
      url: siteConfig.url,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      image: absoluteUrl(siteConfig.ogImage),
      sameAs: socialProfiles,
      knowsAbout: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Node.js",
        "Blender",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
  ],
};

// lucide-react v1 dropped brand icons, so these are inline Simple Icons paths.
const brandIcon = (path: string) => {
  const BrandIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
  return BrandIcon;
};

const socialIcons = {
  GitHub: brandIcon(
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  ),
  LinkedIn: brandIcon(
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.85 1.637-1.84 3.37-1.84 3.601 0 4.267 2.37 4.267 4.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  ),
  X: brandIcon(
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z",
  ),
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

export default function Home() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={homeJsonLd} />
      <script type="module" src="/vendor/model-viewer.min.js" async />
      <PlaneFlyover />
      <main className="relative z-10">
        <Header />
        <div className="shell flex min-h-screen flex-col pb-10 pt-20 backdrop-blur-md">
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Mohit Dayma
          </h1>
          <p className="mt-2 text-lg text-foreground/90">
            Software developer building web and mobile apps with React, Next.js,
            React Native and NestJS.
          </p>
          <p className="mt-3 leading-relaxed text-muted">
            I started as a frontend developer, but the more I built, the more I
            got fascinated by software as a whole: backend, databases and a
            little DevOps. These days I work across the stack with React,
            Next.js, Tailwind.
            <br />
            <br />
            During my initial programming days, I was not much interested in
            programming so instead I was learning{" "}
            <a href="https://www.blender.org/" className="link">
              Blender
            </a>
            . The aeroplane was the first big thing I built, following a{" "}
            <a
              href="https://youtube.com/playlist?list=PLgO2ChD7acqH5S3fCO1GbAJC55NeVaCCp&si=GoKOaathRV9gyYMM"
              className="link"
            >
              YouTube playlist.
            </a>
          </p>
          <div
            className="mt-5 flex items-center gap-2"
            aria-label="Social links"
          >
            {footerLinks.map((link) => {
              const Icon = socialIcons[link.title as keyof typeof socialIcons];

              return (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.title}
                  title={link.title}
                  className="rounded-md border border-line-subtle p-2.5 text-muted transition-colors hover:border-line hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
          {posts.length > 0 && (
            <section id="writing" className="mt-12 scroll-mt-20">
              <div className="flex items-baseline justify-between">
                <h2 className="font-mono text-xs uppercase tracking-widest text-faint">
                  Writing
                </h2>
                <Link
                  href="/blog"
                  className="text-xs text-muted transition-colors hover:text-foreground"
                >
                  All posts →
                </Link>
              </div>
              <div className="mt-2 divide-y divide-line-subtle">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group -mx-3 flex items-center justify-between gap-4 rounded-md px-3 py-4 transition-colors hover:bg-surface-hover"
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-medium text-foreground transition-colors group-hover:text-white md:text-lg">
                        {post.title}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {post.excerpt}
                      </span>
                    </span>
                    <time
                      dateTime={post.publishedAt}
                      className="shrink-0 font-mono text-xs text-faint"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section id="projects" className="mt-12 scroll-mt-20">
            <h2 className="font-mono text-xs uppercase tracking-widest text-faint">
              Projects
            </h2>
            <div className="mt-2 divide-y divide-line-subtle">
              {portfolioProjects.map((project) => (
                <a
                  key={project.title}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-3 flex items-center justify-between gap-4 rounded-md px-3 py-4 transition-colors hover:bg-surface-hover"
                >
                  <span className="min-w-0">
                    <span className="block text-base font-medium text-foreground transition-colors group-hover:text-white md:text-lg">
                      {project.title}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {project.description}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-xs text-faint">
                      {project.year}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-faint transition-colors group-hover:text-foreground"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
