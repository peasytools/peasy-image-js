/**
 * peasy-image engine — image processing functions powered by sharp.
 *
 * 15 operations: info, resize, crop, convert, compress, rotate, flip, flop,
 * grayscale, blur, sharpen, negate, tint, composite, thumbnail.
 */

import sharp from "sharp";
import type {
  CompressOptions,
  CropOptions,
  ImageFormat,
  ImageInfo,
  ImageResult,
  ResizeOptions,
} from "./types.js";

// ── Internal helper ────────────────────────────────────────────────

/** Convert a sharp pipeline result to a standardized ImageResult. */
async function toResult(
  pipeline: sharp.Sharp,
  format?: string,
): Promise<ImageResult> {
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    width: info.width,
    height: info.height,
    format: info.format || format || "unknown",
    size: data.length,
  };
}

// ── Image operations ───────────────────────────────────────────────

/**
 * Get image metadata — dimensions, format, channels, color space.
 *
 * @param source - Image data as a Buffer
 * @returns Image metadata
 */
export async function info(source: Buffer): Promise<ImageInfo> {
  const meta = await sharp(source).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? "unknown",
    channels: meta.channels ?? 0,
    size: source.length,
    hasAlpha: meta.hasAlpha ?? false,
    space: meta.space ?? "unknown",
  };
}

/**
 * Resize an image to the given dimensions.
 *
 * If only width or height is provided, the other dimension is
 * calculated to maintain aspect ratio (default fit: "cover").
 *
 * @param source - Image data as a Buffer
 * @param options - Resize options (width, height, fit)
 * @returns Resized image result
 */
export async function resize(
  source: Buffer,
  options: ResizeOptions,
): Promise<ImageResult> {
  const pipeline = sharp(source).resize({
    width: options.width,
    height: options.height,
    fit: options.fit ?? "cover",
  });
  return toResult(pipeline);
}

/**
 * Crop a rectangular region from an image.
 *
 * @param source - Image data as a Buffer
 * @param options - Crop region (left, top, width, height)
 * @returns Cropped image result
 */
export async function crop(
  source: Buffer,
  options: CropOptions,
): Promise<ImageResult> {
  const pipeline = sharp(source).extract({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
  });
  return toResult(pipeline);
}

/**
 * Convert an image to a different format.
 *
 * @param source - Image data as a Buffer
 * @param format - Target format (png, jpeg, webp, avif, tiff, gif)
 * @returns Converted image result
 */
export async function convert(
  source: Buffer,
  format: ImageFormat,
): Promise<ImageResult> {
  const pipeline = sharp(source).toFormat(format);
  return toResult(pipeline, format);
}

/**
 * Compress an image by reducing quality.
 *
 * Defaults to JPEG format at quality 60 for maximum compression.
 *
 * @param source - Image data as a Buffer
 * @param options - Compression options (quality, format)
 * @returns Compressed image result
 */
export async function compress(
  source: Buffer,
  options?: CompressOptions,
): Promise<ImageResult> {
  const quality = options?.quality ?? 60;
  const format = options?.format ?? "jpeg";
  const pipeline = sharp(source).toFormat(format, { quality });
  return toResult(pipeline, format);
}

/**
 * Rotate an image by the given angle in degrees.
 *
 * Common angles (90, 180, 270) produce lossless rotation.
 * Arbitrary angles expand the canvas to fit the rotated image.
 *
 * @param source - Image data as a Buffer
 * @param angle - Rotation angle in degrees (clockwise)
 * @returns Rotated image result
 */
export async function rotate(
  source: Buffer,
  angle: number,
): Promise<ImageResult> {
  const pipeline = sharp(source).rotate(angle);
  return toResult(pipeline);
}

/**
 * Flip an image vertically (top to bottom).
 *
 * @param source - Image data as a Buffer
 * @returns Flipped image result
 */
export async function flip(source: Buffer): Promise<ImageResult> {
  const pipeline = sharp(source).flip();
  return toResult(pipeline);
}

/**
 * Flop an image horizontally (mirror, left to right).
 *
 * @param source - Image data as a Buffer
 * @returns Flopped image result
 */
export async function flop(source: Buffer): Promise<ImageResult> {
  const pipeline = sharp(source).flop();
  return toResult(pipeline);
}

/**
 * Convert an image to grayscale.
 *
 * @param source - Image data as a Buffer
 * @returns Grayscale image result
 */
export async function grayscale(source: Buffer): Promise<ImageResult> {
  const pipeline = sharp(source).grayscale();
  return toResult(pipeline);
}

/**
 * Apply Gaussian blur to an image.
 *
 * @param source - Image data as a Buffer
 * @param sigma - Blur intensity (0.3 to 1000, default 2.0)
 * @returns Blurred image result
 */
export async function blur(
  source: Buffer,
  sigma: number = 2.0,
): Promise<ImageResult> {
  const pipeline = sharp(source).blur(sigma);
  return toResult(pipeline);
}

/**
 * Sharpen an image using Laplacian sharpening.
 *
 * @param source - Image data as a Buffer
 * @param sigma - Sharpening intensity (default 1.0)
 * @returns Sharpened image result
 */
export async function sharpen(
  source: Buffer,
  sigma: number = 1.0,
): Promise<ImageResult> {
  const pipeline = sharp(source).sharpen(sigma);
  return toResult(pipeline);
}

/**
 * Negate (invert) the colors of an image.
 *
 * @param source - Image data as a Buffer
 * @returns Negated image result
 */
export async function negate(source: Buffer): Promise<ImageResult> {
  const pipeline = sharp(source).negate();
  return toResult(pipeline);
}

/**
 * Apply a color tint to an image.
 *
 * @param source - Image data as a Buffer
 * @param color - RGB color to tint with
 * @returns Tinted image result
 */
export async function tint(
  source: Buffer,
  color: { r: number; g: number; b: number },
): Promise<ImageResult> {
  const pipeline = sharp(source).tint(color);
  return toResult(pipeline);
}

/**
 * Overlay one image on top of another (composite).
 *
 * @param base - Base image data as a Buffer
 * @param overlay - Overlay image data as a Buffer
 * @param options - Position and opacity options
 * @returns Composited image result
 */
export async function composite(
  base: Buffer,
  overlay: Buffer,
  options?: { left?: number; top?: number; opacity?: number },
): Promise<ImageResult> {
  let overlayInput: Buffer = overlay;

  // Apply opacity by adjusting the overlay's alpha channel
  if (options?.opacity !== undefined && options.opacity < 1) {
    overlayInput = await sharp(overlay)
      .ensureAlpha(options.opacity)
      .toBuffer();
  }

  const pipeline = sharp(base).composite([
    {
      input: overlayInput,
      left: options?.left ?? 0,
      top: options?.top ?? 0,
    },
  ]);
  return toResult(pipeline);
}

/**
 * Create a square thumbnail by center-cropping and resizing.
 *
 * The image is resized to cover the target size, then center-cropped
 * to produce a square output.
 *
 * @param source - Image data as a Buffer
 * @param size - Target thumbnail size in pixels (width = height)
 * @returns Square thumbnail image result
 */
export async function thumbnail(
  source: Buffer,
  size: number,
): Promise<ImageResult> {
  const pipeline = sharp(source).resize(size, size, {
    fit: "cover",
    position: "centre",
  });
  return toResult(pipeline);
}
