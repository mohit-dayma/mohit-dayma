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
 *
 * The server HTML only hides the logo visually (no aria-hidden / tabIndex),
 * and a <noscript> style reveals it, so it stays usable without JavaScript.
 * Accessibility hiding is applied once client code confirms the hero is in
 * view, and never while the link itself holds focus.
 */
export const HeaderLogo = () => {
  const isHome = usePathname() === '/';
  // null = not yet measured on the client.
  const [heroInView, setHeroInView] = useState<boolean | null>(null);
  const [focused, setFocused] = useState(false);
  const visuallyHidden = isHome && heroInView !== false && !focused;
  const hidden = isHome && heroInView === true && !focused;

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
    <>
      <Link
        href="/"
        id="header-logo"
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`font-mono text-sm font-semibold tracking-tight text-foreground transition-opacity duration-300 ${
          visuallyHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        mohit
      </Link>
      {isHome && (
        <noscript>
          <style>{`#header-logo{opacity:1!important;pointer-events:auto!important}`}</style>
        </noscript>
      )}
    </>
  );
};
