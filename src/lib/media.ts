export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function imageFileError(file: { size: number; type: string } | null): string | null {
  if (!file || file.size === 0) return "Choose a photo for your meme.";
  if (!IMAGE_TYPES.includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Choose an image smaller than 3 MB.";
  return null;
}
