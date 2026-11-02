import type { DetailedHTMLProps, HTMLAttributes } from 'react';

export type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  'camera-controls'?: boolean | string;
  'auto-rotate'?: boolean | string;
  autoplay?: boolean | string;
  'interpolation-decay'?: boolean | string;
  'rotation-per-second'?: string;
  'camera-orbit'?: string;
  orientation?: string;
  'field-of-view'?: string;
  'interaction-prompt'?: 'auto' | 'none' | 'when-hovered';
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  exposure?: string;
  'environment-image'?: string;
  'tone-mapping'?: string;
  'touch-action'?: string;
  'disable-zoom'?: boolean | string;
  'ar-modes'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}
