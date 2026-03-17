# peasy-image

[![npm version](https://agentgif.com/badge/npm/peasy-image/version.svg)](https://www.npmjs.com/package/peasy-image)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://agentgif.com/badge/github/peasytools/peasy-image-js/stars.svg)](https://github.com/peasytools/peasy-image-js)

Image processing library for Node.js powered by [sharp](https://sharp.pixelplumbing.com/) -- resize, crop, convert, compress, rotate, blur, sharpen, and 8 more operations. TypeScript-first with full type definitions.

All functions accept a `Buffer` and return a `Promise<ImageResult>` with the processed image data, dimensions, format, and byte size.

> **Try the interactive tools at [peasyimage.com](https://peasyimage.com)** -- image resizing, format conversion, compression, and more

<p align="center">
  <img src="demo.gif" alt="peasy-image demo — image resize, crop, convert operations in terminal" width="800">
</p>

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [What You Can Do](#what-you-can-do)
  - [Resize and Crop](#resize-and-crop)
  - [Format Conversion](#format-conversion)
  - [Compression](#compression)
  - [Rotation and Flipping](#rotation-and-flipping)
  - [Filters and Effects](#filters-and-effects)
  - [Compositing](#compositing)
  - [Thumbnails](#thumbnails)
- [API Reference](#api-reference)
- [TypeScript Types](#typescript-types)
- [REST API Client](#rest-api-client)
- [Learn More](#learn-more)
- [Also Available](#also-available)
- [Peasy Developer Tools](#peasy-developer-tools)
- [License](#license)

## Install

```bash
npm install peasy-image
```

Requires Node.js 18+ and includes [sharp](https://sharp.pixelplumbing.com/) as a dependency for high-performance, native image processing.

## Quick Start

```typescript
import { readFileSync, writeFileSync } from "fs";
import { info, resize, compress, convert } from "peasy-image";

const source = readFileSync("photo.jpg");

// Get image metadata
const meta = await info(source);
console.log(`${meta.width}x${meta.height} ${meta.format} (${meta.size} bytes)`);

// Resize to 800px wide, maintaining aspect ratio
const resized = await resize(source, { width: 800, fit: "contain" });
writeFileSync("resized.jpg", resized.data);

// Compress to WebP at quality 60
const compressed = await compress(source, { quality: 60, format: "webp" });
writeFileSync("compressed.webp", compressed.data);

// Convert PNG to AVIF
const avif = await convert(readFileSync("image.png"), "avif");
writeFileSync("image.avif", avif.data);
```

## What You Can Do

### Resize and Crop

Resize images to exact dimensions or proportionally by width/height. Sharp supports 5 fit modes that control how the image fills the target area: `cover` (crop to fill), `contain` (letterbox), `fill` (stretch), `inside`, and `outside`.

| Fit Mode | Behavior |
|----------|----------|
| `cover` | Crop to fill the target dimensions (default) |
| `contain` | Resize to fit within bounds, preserving aspect ratio |
| `fill` | Stretch to exact dimensions, ignoring aspect ratio |
| `inside` | Resize to fit inside, never enlarging |
| `outside` | Resize to cover, never shrinking |

```typescript
import { resize, crop } from "peasy-image";

// Resize to fit within 800x600, preserving aspect ratio
const fitted = await resize(source, { width: 800, height: 600, fit: "contain" });

// Resize by width only — height calculated automatically
const wide = await resize(source, { width: 1200, fit: "contain" });

// Crop a 300x300 region starting at (50, 100)
const cropped = await crop(source, { left: 50, top: 100, width: 300, height: 300 });
```

Learn more: [Resize Image Tool](https://peasyimage.com/image/resize-image/) · [Crop Image Tool](https://peasyimage.com/image/crop-image/) · [What is Aspect Ratio?](https://peasyimage.com/glossary/aspect-ratio/)

### Format Conversion

Convert between 6 image formats. Modern formats like WebP and AVIF provide significantly better compression than JPEG and PNG while maintaining visual quality.

| Format | Best For | Alpha Support |
|--------|----------|---------------|
| `png` | Lossless graphics, screenshots | Yes |
| `jpeg` | Photos, continuous tones | No |
| `webp` | Web images (25-35% smaller than JPEG) | Yes |
| `avif` | Next-gen web (50% smaller than JPEG) | Yes |
| `tiff` | Print, archival | Yes |
| `gif` | Simple animations | Limited |

```typescript
import { convert } from "peasy-image";

// Convert to WebP for smaller web assets
const webp = await convert(source, "webp");

// Convert to AVIF for maximum compression
const avif = await convert(source, "avif");
```

Learn more: [Convert Image Tool](https://peasyimage.com/image/convert-image/) · [Image Format Comparison](https://peasyimage.com/guides/image-format-comparison/) · [What is AVIF?](https://peasyimage.com/glossary/avif/)

### Compression

Reduce file size by adjusting quality. The `compress` function defaults to JPEG at quality 60, which typically reduces file size by 70-80% with acceptable visual quality.

```typescript
import { compress } from "peasy-image";

// Compress to JPEG at quality 60 (default)
const small = await compress(source);

// Compress to WebP at quality 80 for higher fidelity
const webp = await compress(source, { quality: 80, format: "webp" });
```

Learn more: [Compress Image Tool](https://peasyimage.com/image/compress-image/) · [How to Compress Images for Web](https://peasyimage.com/guides/how-to-compress-images-for-web/) · [What is Lossy Compression?](https://peasyimage.com/glossary/lossy-compression/)

### Rotation and Flipping

Rotate images by any angle (90, 180, 270 for lossless, or arbitrary degrees). Flip vertically or mirror horizontally.

```typescript
import { rotate, flip, flop } from "peasy-image";

// Rotate 90 degrees clockwise
const rotated = await rotate(source, 90);

// Flip vertically (top to bottom)
const flipped = await flip(source);

// Mirror horizontally (left to right)
const mirrored = await flop(source);
```

### Filters and Effects

Apply visual effects: grayscale conversion, Gaussian blur, Laplacian sharpening, color inversion, and color tinting.

| Filter | Description | Key Parameter |
|--------|-------------|---------------|
| `grayscale` | Convert to grayscale | -- |
| `blur` | Gaussian blur | `sigma` (0.3-1000, default 2.0) |
| `sharpen` | Laplacian sharpening | `sigma` (default 1.0) |
| `negate` | Invert all colors | -- |
| `tint` | Apply RGB color tint | `{ r, g, b }` values |

```typescript
import { grayscale, blur, sharpen, negate, tint } from "peasy-image";

// Convert to black and white
const bw = await grayscale(source);

// Apply soft Gaussian blur (sigma 3.0)
const blurred = await blur(source, 3.0);

// Sharpen a slightly out-of-focus image
const sharp = await sharpen(source, 1.5);

// Invert colors for a negative effect
const inverted = await negate(source);

// Apply a warm sepia-like tint
const warm = await tint(source, { r: 180, g: 130, b: 80 });
```

### Compositing

Overlay one image on top of another with position control and opacity. Useful for watermarks, badges, and image collages.

```typescript
import { composite } from "peasy-image";

// Place a watermark at position (10, 10)
const watermarked = await composite(photo, watermarkPng, { left: 10, top: 10 });

// Overlay with 50% opacity
const blended = await composite(background, foreground, {
  left: 100,
  top: 50,
  opacity: 0.5,
});
```

### Thumbnails

Create square thumbnails by center-cropping and resizing in a single operation. Ideal for profile pictures, gallery previews, and social media icons.

```typescript
import { thumbnail } from "peasy-image";

// 64x64 square thumbnail for avatars
const avatar = await thumbnail(source, 64);

// 256x256 thumbnail for gallery grid
const preview = await thumbnail(source, 256);
```

## API Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `info` | `(source: Buffer) => Promise<ImageInfo>` | Get image metadata (dimensions, format, channels) |
| `resize` | `(source: Buffer, options: ResizeOptions) => Promise<ImageResult>` | Resize with fit mode control |
| `crop` | `(source: Buffer, options: CropOptions) => Promise<ImageResult>` | Extract a rectangular region |
| `convert` | `(source: Buffer, format: ImageFormat) => Promise<ImageResult>` | Convert between 6 formats |
| `compress` | `(source: Buffer, options?: CompressOptions) => Promise<ImageResult>` | Reduce file size via quality |
| `rotate` | `(source: Buffer, angle: number) => Promise<ImageResult>` | Rotate by degrees |
| `flip` | `(source: Buffer) => Promise<ImageResult>` | Flip vertically |
| `flop` | `(source: Buffer) => Promise<ImageResult>` | Mirror horizontally |
| `grayscale` | `(source: Buffer) => Promise<ImageResult>` | Convert to grayscale |
| `blur` | `(source: Buffer, sigma?: number) => Promise<ImageResult>` | Gaussian blur |
| `sharpen` | `(source: Buffer, sigma?: number) => Promise<ImageResult>` | Laplacian sharpening |
| `negate` | `(source: Buffer) => Promise<ImageResult>` | Invert colors |
| `tint` | `(source: Buffer, color: {r,g,b}) => Promise<ImageResult>` | Apply color tint |
| `composite` | `(base: Buffer, overlay: Buffer, options?) => Promise<ImageResult>` | Overlay images |
| `thumbnail` | `(source: Buffer, size: number) => Promise<ImageResult>` | Square center-crop thumbnail |

## TypeScript Types

```typescript
interface ImageInfo {
  width: number;
  height: number;
  format: string;
  channels: number;
  size: number;
  hasAlpha: boolean;
  space: string;
}

interface ImageResult {
  data: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

type ImageFormat = "png" | "jpeg" | "webp" | "avif" | "tiff" | "gif";
type FitMode = "cover" | "contain" | "fill" | "inside" | "outside";

interface ResizeOptions { width?: number; height?: number; fit?: FitMode; }
interface CropOptions { left: number; top: number; width: number; height: number; }
interface CompressOptions { quality?: number; format?: ImageFormat; }
```

## REST API Client

The API client connects to the [PeasyImage developer API](https://peasyimage.com/developers/) for tool discovery and content.

```typescript
import { PeasyImageClient } from "peasy-image";

const client = new PeasyImageClient();

// List available tools
const tools = await client.listTools();
console.log(tools.results);

// Search across all content
const results = await client.search("resize");
console.log(results);

// Browse the glossary
const glossary = await client.listGlossary({ search: "format" });
for (const term of glossary.results) {
  console.log(`${term.term}: ${term.definition}`);
}

// Discover guides
const guides = await client.listGuides({ category: "image" });
for (const guide of guides.results) {
  console.log(`${guide.title} (${guide.audience_level})`);
}
```

Full API documentation at [peasyimage.com/developers/](https://peasyimage.com/developers/).

## Learn More

- **Tools**: [Resize Image](https://peasyimage.com/image/resize-image/) · [Compress Image](https://peasyimage.com/image/compress-image/) · [Convert Image](https://peasyimage.com/image/convert-image/) · [Crop Image](https://peasyimage.com/image/crop-image/) · [Rotate Image](https://peasyimage.com/image/rotate-image/) · [Watermark Image](https://peasyimage.com/image/watermark-image/) · [All Image Tools](https://peasyimage.com/)
- **Guides**: [Image Format Comparison](https://peasyimage.com/guides/image-format-comparison/) · [How to Compress Images for Web](https://peasyimage.com/guides/how-to-compress-images-for-web/) · [JPG vs PNG](https://peasyimage.com/guides/jpg-vs-png-which-format-to-use/) · [WebP vs JPG](https://peasyimage.com/guides/webp-vs-jpg-modern-image-formats/) · [How to Optimize Images for SEO](https://peasyimage.com/guides/how-to-optimize-images-for-seo/) · [All Guides](https://peasyimage.com/guides/)
- **Glossary**: [AVIF](https://peasyimage.com/glossary/avif/) · [WebP](https://peasyimage.com/glossary/webp/) · [Alpha Channel](https://peasyimage.com/glossary/alpha-channel/) · [EXIF](https://peasyimage.com/glossary/exif/) · [Color Grading](https://peasyimage.com/glossary/color-grading-image/) · [Chroma Subsampling](https://peasyimage.com/glossary/chroma-subsampling/) · [All Terms](https://peasyimage.com/glossary/)
- **Formats**: [PNG](https://peasyimage.com/formats/png/) · [JPEG](https://peasyimage.com/formats/jpeg/) · [WebP](https://peasyimage.com/formats/webp/) · [AVIF](https://peasyimage.com/formats/avif/) · [All Formats](https://peasyimage.com/formats/)
- **API**: [REST API Docs](https://peasyimage.com/developers/) · [OpenAPI Spec](https://peasyimage.com/api/openapi.json)

## Also Available

| Language | Package | Install |
|----------|---------|---------|
| **Python** | [peasy-image](https://pypi.org/project/peasy-image/) | `pip install "peasy-image[all]"` |
| **Go** | [peasy-image-go](https://pkg.go.dev/github.com/peasytools/peasy-image-go) | `go get github.com/peasytools/peasy-image-go` |
| **Rust** | [peasy-image](https://crates.io/crates/peasy-image) | `cargo add peasy-image` |
| **Ruby** | [peasy-image](https://rubygems.org/gems/peasy-image) | `gem install peasy-image` |

## Peasy Developer Tools

Part of the [Peasy Tools](https://peasytools.com) open-source developer ecosystem.

| Package | PyPI | npm | Description |
|---------|------|-----|-------------|
| peasy-pdf | [PyPI](https://pypi.org/project/peasy-pdf/) | [npm](https://www.npmjs.com/package/peasy-pdf) | PDF merge, split, rotate, compress, 21 operations — [peasypdf.com](https://peasypdf.com) |
| **peasy-image** | **[PyPI](https://pypi.org/project/peasy-image/)** | **[npm](https://www.npmjs.com/package/peasy-image)** | **Image resize, crop, convert, compress — [peasyimage.com](https://peasyimage.com)** |
| peasy-audio | [PyPI](https://pypi.org/project/peasy-audio/) | [npm](https://www.npmjs.com/package/peasy-audio) | Audio trim, merge, convert, normalize — [peasyaudio.com](https://peasyaudio.com) |
| peasy-video | [PyPI](https://pypi.org/project/peasy-video/) | [npm](https://www.npmjs.com/package/peasy-video) | Video trim, resize, thumbnails, GIF — [peasyvideo.com](https://peasyvideo.com) |
| peasy-css | [PyPI](https://pypi.org/project/peasy-css/) | [npm](https://www.npmjs.com/package/peasy-css) | CSS minify, format, analyze — [peasycss.com](https://peasycss.com) |
| peasy-compress | [PyPI](https://pypi.org/project/peasy-compress/) | [npm](https://www.npmjs.com/package/peasy-compress) | ZIP, TAR, gzip compression — [peasytools.com](https://peasytools.com) |
| peasy-document | [PyPI](https://pypi.org/project/peasy-document/) | [npm](https://www.npmjs.com/package/peasy-document) | Markdown, HTML, CSV, JSON conversion — [peasyformats.com](https://peasyformats.com) |
| peasytext | [PyPI](https://pypi.org/project/peasytext/) | [npm](https://www.npmjs.com/package/peasytext) | Text case conversion, slugify, word count — [peasytext.com](https://peasytext.com) |

## License

MIT
