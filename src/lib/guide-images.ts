import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/guides/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** Resolves a guide's image path (relative to src/assets/guides/) so Astro can optimize it. A missing file fails the build. */
export function guideImage(path: string): ImageMetadata {
  const mod = images[`/src/assets/guides/${path}`];
  if (!mod) {
    throw new Error(`Imagen de guía inexistente: src/assets/guides/${path}`);
  }
  return mod.default;
}
