// Escapes `<` so content can't close the script tag early.
// https://nextjs.org/docs/app/guides/json-ld
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    }}
  />
);
