/**
 * Returns the full URL for an image
 * @param path - The path to the image relative to the public directory
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string): string => {
  // In development, the public directory is served from the root
  if (process.env.NODE_ENV === 'development') {
    return path.startsWith('/') ? path : `/${path}`;
  }
  // In production, the public directory is copied to the root of the build
  return path;
};
