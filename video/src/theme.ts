import { loadFont as loadSans } from '@remotion/google-fonts/Geist';
import { loadFont as loadMono } from '@remotion/google-fonts/GeistMono';

// Same tokens as the blog's globals.css, so the video matches the site.
export const color = {
  background: '#000000',
  foreground: '#ededed',
  muted: '#a1a1a1',
  faint: '#6f6f6f',
  line: '#333333',
  lineSubtle: '#262626',
  surface: '#0a0a0a',
  amber: '#f59e0b',
  hit: '#22c55e',
  miss: '#ef4444',
};

export const sans = loadSans('normal', {
  weights: ['400', '600', '700'],
  subsets: ['latin'],
}).fontFamily;
export const mono = loadMono('normal', {
  weights: ['400', '600'],
  subsets: ['latin'],
}).fontFamily;
