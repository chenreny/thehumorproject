import sharp from "sharp";
import { imageFileError } from "./media";

export async function normalizeMemeImage(file: File): Promise<Buffer> {
  const error = imageFileError(file);
  if (error) throw new Error(error);
  const bytes = Buffer.from(await file.arrayBuffer());
  const image = sharp(bytes, { limitInputPixels: 25_000_000, failOn: "warning" });
  const metadata = await image.metadata();
  const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[metadata.format as "jpeg" | "png" | "webp"];
  if (mime !== file.type || !mime || (metadata.pages ?? 1) > 1 || !metadata.width || !metadata.height || metadata.width < 64 || metadata.height < 64) {
    throw new Error("Choose a still JPEG, PNG, or WebP photo at least 64 pixels wide and tall.");
  }
  // Auto-orient, bound memory/provider costs, and strip EXIF/location metadata.
  return image.rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
}
