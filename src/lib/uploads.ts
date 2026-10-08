import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/** Absolute path of an uploaded file. Kept out of Turbopack's file tracing — uploads are runtime data. */
export function uploadPath(name: string) {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads", path.basename(name));
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const IMAGE_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]),
);

/** True when the form actually contained a chosen file (browsers send an empty File otherwise). */
export function hasFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function validateImage(file: File): string | null {
  if (!EXTENSIONS[file.type]) return "Please upload a JPG, PNG, WebP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}

/** Store an uploaded image and return the public URL it is served from. */
export async function saveImage(file: File): Promise<string> {
  const name = `${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  await fs.writeFile(uploadPath(name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const name = path.basename(url);
  await fs.rm(uploadPath(name), { force: true });
}
