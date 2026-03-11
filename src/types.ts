/**
 * peasy-image types — interfaces for image processing operations.
 */

/** Basic image metadata returned by `info()`. */
export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  channels: number;
  size: number;
  hasAlpha: boolean;
  space: string;
}

/** Result of an image processing operation. */
export interface ImageResult {
  data: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/** Supported output image formats. */
export type ImageFormat = "png" | "jpeg" | "webp" | "avif" | "tiff" | "gif";

/** Resize fit mode — how the image should fit within the target dimensions. */
export type FitMode = "cover" | "contain" | "fill" | "inside" | "outside";

/** Options for resizing an image. */
export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: FitMode;
}

/** Options for cropping a region from an image. */
export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Options for compressing an image. */
export interface CompressOptions {
  quality?: number;
  format?: ImageFormat;
}
