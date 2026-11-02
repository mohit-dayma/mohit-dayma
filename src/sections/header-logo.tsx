'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Height of the fixed header (h-14); the hero name counts as "scrolled past"
// once it slides under it.
const HEADER_OFFSET = 56;

/**
 * On the homepage the hero <h1 id="hero-name"> already shows the full name,
 * so the header logo stays hidden until that heading scrolls out of view.
 * On every other page the logo is always visible.
 */
export const HeaderLogo = () => {
  const isHome = usePathname() === '/';
  const [heroInView, setHeroInView] = useState(true);
  const heroVisible = isHome && heroInView;

  useEffect(() => {
    const hero = isHome ? document.getElementById('hero-name') : null;
    if (!hero) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <Link
      href="/"
      aria-hidden={heroVisible || undefined}
      tabIndex={heroVisible ? -1 : undefined}
      className={`font-mono text-sm font-semibold tracking-tight text-foreground transition-opacity duration-300 ${
        heroVisible ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      mohit
    </Link>
  );
};
