import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Ask the backend to reclaim an image from Cloudflare R2.
 *
 * Intended for fire-and-forget cleanup, so it never throws and never surfaces
 * an error to the user - a failed cleanup is a storage-cost problem, not a
 * reason to interrupt their workflow.
 *
 * Safe to call speculatively: the endpoint refuses (409) while a project still
 * references the URL, and no-ops for legacy local image paths.
 *
 * @returns {Promise<boolean>} true if the object was actually deleted
 */
export async function deleteUploadedImage(imageUrl, token) {
  if (!imageUrl || !token) return false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      console.warn(`[images] Skipped cleanup of ${imageUrl}:`, await response.text());
      return false;
    }

    const data = await response.json();
    return Boolean(data?.deleted);
  } catch (error) {
    console.warn(`[images] Cleanup failed for ${imageUrl}:`, error);
    return false;
  }
}

/**
 * Best-effort cleanup of a batch of image URLs that are known to be unreferenced
 * - typically images that made it into R2 before a later step of the same
 * submission failed.
 */
export function cleanupUploadedImages(imageUrls, token) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
  imageUrls.forEach((url) => deleteUploadedImage(url, token));
}
