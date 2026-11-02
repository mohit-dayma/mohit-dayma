import { ImageResponse } from 'next/og';
import { siteConfig } from '@/utils/site';

// Rendered once at build time; used as the default social share image.
export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: '#0a0a0a',
        color: '#fafafa',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, color: '#a1a1aa', letterSpacing: 4 }}>
        {siteConfig.url.replace('https://', '').toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 40, color: '#a1a1aa', marginTop: 16 }}>
          {`${siteConfig.jobTitle} · React · Next.js · Node.js`}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
