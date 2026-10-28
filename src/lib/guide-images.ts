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

/** Every guide image, as paths relative to src/assets/guides/ ("islandia/gullfoss.jpg"). */
export function guideImagePaths(): string[] {
  return Object.keys(images).map((key) => key.slice('/src/assets/guides/'.length))
}
