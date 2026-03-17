/**
 * peasy-image — Image processing library for Node.js.
 *
 * 15 operations powered by sharp: resize, crop, convert, compress,
 * rotate, flip, flop, grayscale, blur, sharpen, negate, tint,
 * composite, thumbnail, and info.
 *
 * @packageDocumentation
 */

export type {
  CompressOptions,
  CropOptions,
  FitMode,
  ImageFormat,
  ImageInfo,
  ImageResult,
  ResizeOptions,
} from "./types.js";

export {
  blur,
  composite,
  compress,
  convert,
  crop,
  flip,
  flop,
  grayscale,
  info,
  negate,
  resize,
  rotate,
  sharpen,
  thumbnail,
  tint,
} from "./engine.js";

// API Client
export { PeasyImage } from "./client.js";
export type {
  ListOptions,
  ListGuidesOptions,
  ListConversionsOptions,
  PaginatedResponse,
  Tool,
  Category,
  Format,
  Conversion,
  GlossaryTerm,
  Guide,
  UseCase,
  Site,
  SearchResult,
} from "./api-types.js";
