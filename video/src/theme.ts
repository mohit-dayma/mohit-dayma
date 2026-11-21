import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from 'remotion';

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

// Geist and Geist Mono (SIL Open Font License), the site's fonts, bundled in
// public/fonts so renders work offline. They are the same variable woff2 files
// that Google Fonts serves, split into its latin and latin-ext subsets.
const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';

const loadFont = (family: string, file: string, unicodeRange: string) => {
  if (typeof FontFace === 'undefined') return;
  const handle = delayRender(`Loading ${file}`);
  const face = new FontFace(
    family,
    `url(${staticFile(`fonts/${file}`)}) format('woff2')`,
    {
      weight: '100 900',
      unicodeRange,
    },
  );
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch((err) => cancelRender(err));
};

loadFont('Geist', 'geist-latin.woff2', LATIN);
loadFont('Geist', 'geist-latin-ext.woff2', LATIN_EXT);
loadFont('Geist Mono', 'geist-mono-latin.woff2', LATIN);
loadFont('Geist Mono', 'geist-mono-latin-ext.woff2', LATIN_EXT);

export const sans = "'Geist', system-ui, sans-serif";
export const mono = "'Geist Mono', ui-monospace, monospace";
