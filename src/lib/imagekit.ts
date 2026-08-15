/**
 * All property photography lives on ImageKit, not in the repo/build —
 * see docs/decisions/0009-media-hosting-imagekit-youtube.md. This helper
 * builds transformation URLs so every <img> requests exactly the size it
 * renders at (no shipping a 4000px developer render to a 400px card).
 *
 * PUBLIC_IMAGEKIT_URL_ENDPOINT is a build-time public env var — see
 * .env.example — safe to expose, it's just ImageKit's public CDN host.
 */
const ENDPOINT = import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/akrealtors";

export interface ImageKitOptions {
  width?: number;
  height?: number;
  quality?: number;
  focus?: "auto" | "face" | "center";
}

export function imagekitUrl(path: string, opts: ImageKitOptions = {}): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path; // already absolute (e.g. placeholder)
  const clean = path.replace(/^\/+/, "");
  const tr: string[] = [];
  if (opts.width) tr.push(`w-${opts.width}`);
  if (opts.height) tr.push(`h-${opts.height}`);
  tr.push(`q-${opts.quality ?? 75}`);
  tr.push("f-auto"); // serve AVIF/WebP automatically
  if (opts.focus) tr.push(`fo-${opts.focus}`);
  return `${ENDPOINT}/${clean}?tr=${tr.join(",")}`;
}

/** A comma-separated srcset for responsive <img>. */
export function imagekitSrcSet(path: string, widths: number[], opts: Omit<ImageKitOptions, "width"> = {}): string {
  return widths.map((w) => `${imagekitUrl(path, { ...opts, width: w })} ${w}w`).join(", ");
}
