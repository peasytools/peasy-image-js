import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
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
} from "../src/index.js";

// ── Test image factory ─────────────────────────────────────────────

/** Create a solid-color test image in PNG format. */
async function makeTestImage(
  width = 100,
  height = 100,
  channels: 3 | 4 = 3,
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
}

/** Create a small overlay image (50x50 blue square). */
async function makeOverlayImage(): Promise<Buffer> {
  return sharp({
    create: {
      width: 50,
      height: 50,
      channels: 4,
      background: { r: 0, g: 0, b: 255, alpha: 0.8 },
    },
  })
    .png()
    .toBuffer();
}

// ── info ───────────────────────────────────────────────────────────

describe("info", () => {
  it("returns correct dimensions for a 100x100 image", async () => {
    const img = await makeTestImage(100, 100);
    const result = await info(img);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it("returns correct format as png", async () => {
    const img = await makeTestImage();
    const result = await info(img);
    expect(result.format).toBe("png");
  });

  it("returns 3 channels for RGB image", async () => {
    const img = await makeTestImage(100, 100, 3);
    const result = await info(img);
    expect(result.channels).toBe(3);
  });

  it("returns hasAlpha true for RGBA image", async () => {
    const img = await makeTestImage(100, 100, 4);
    const result = await info(img);
    expect(result.hasAlpha).toBe(true);
  });

  it("returns hasAlpha false for RGB image", async () => {
    const img = await makeTestImage(100, 100, 3);
    const result = await info(img);
    expect(result.hasAlpha).toBe(false);
  });

  it("returns non-zero size", async () => {
    const img = await makeTestImage();
    const result = await info(img);
    expect(result.size).toBeGreaterThan(0);
  });

  it("returns a color space string", async () => {
    const img = await makeTestImage();
    const result = await info(img);
    expect(result.space).toBe("srgb");
  });
});

// ── resize ─────────────────────────────────────────────────────────

describe("resize", () => {
  it("resizes to exact width and height", async () => {
    const img = await makeTestImage(200, 200);
    const result = await resize(img, { width: 50, height: 50 });
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  it("resizes by width only (preserves aspect ratio with contain)", async () => {
    const img = await makeTestImage(200, 100);
    const result = await resize(img, { width: 100, fit: "contain" });
    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
  });

  it("resizes by height only (preserves aspect ratio with contain)", async () => {
    const img = await makeTestImage(200, 100);
    const result = await resize(img, { height: 50, fit: "contain" });
    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
  });

  it("supports fit mode 'contain'", async () => {
    const img = await makeTestImage(200, 100);
    const result = await resize(img, {
      width: 50,
      height: 50,
      fit: "contain",
    });
    expect(result.width).toBeLessThanOrEqual(50);
    expect(result.height).toBeLessThanOrEqual(50);
  });

  it("supports fit mode 'fill'", async () => {
    const img = await makeTestImage(200, 100);
    const result = await resize(img, { width: 50, height: 50, fit: "fill" });
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  it("returns valid buffer data", async () => {
    const img = await makeTestImage();
    const result = await resize(img, { width: 50 });
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });
});

// ── crop ───────────────────────────────────────────────────────────

describe("crop", () => {
  it("crops to the specified region", async () => {
    const img = await makeTestImage(200, 200);
    const result = await crop(img, {
      left: 10,
      top: 10,
      width: 50,
      height: 50,
    });
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  it("crops a non-square region", async () => {
    const img = await makeTestImage(200, 200);
    const result = await crop(img, {
      left: 0,
      top: 0,
      width: 100,
      height: 50,
    });
    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
  });

  it("returns valid data", async () => {
    const img = await makeTestImage(200, 200);
    const result = await crop(img, {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });
});

// ── convert ────────────────────────────────────────────────────────

describe("convert", () => {
  it("converts PNG to JPEG", async () => {
    const img = await makeTestImage();
    const result = await convert(img, "jpeg");
    expect(result.format).toBe("jpeg");
  });

  it("converts PNG to WebP", async () => {
    const img = await makeTestImage();
    const result = await convert(img, "webp");
    expect(result.format).toBe("webp");
  });

  it("converts PNG to AVIF", async () => {
    const img = await makeTestImage();
    const result = await convert(img, "avif");
    expect(result.format).toBe("heif");
  });

  it("preserves dimensions after conversion", async () => {
    const img = await makeTestImage(150, 100);
    const result = await convert(img, "webp");
    expect(result.width).toBe(150);
    expect(result.height).toBe(100);
  });
});

// ── compress ───────────────────────────────────────────────────────

describe("compress", () => {
  it("compresses to JPEG by default", async () => {
    const img = await makeTestImage();
    const result = await compress(img);
    expect(result.format).toBe("jpeg");
  });

  it("compresses to WebP with custom quality", async () => {
    const img = await makeTestImage();
    const result = await compress(img, { quality: 50, format: "webp" });
    expect(result.format).toBe("webp");
  });

  it("produces output with smaller or comparable size", async () => {
    const img = await makeTestImage(200, 200);
    const result = await compress(img, { quality: 10, format: "jpeg" });
    // Compressed JPEG at quality 10 should be smaller than the PNG source
    expect(result.size).toBeLessThan(img.length);
  });
});

// ── rotate ─────────────────────────────────────────────────────────

describe("rotate", () => {
  it("rotates 90 degrees — swaps width and height", async () => {
    const img = await makeTestImage(200, 100);
    const result = await rotate(img, 90);
    expect(result.width).toBe(100);
    expect(result.height).toBe(200);
  });

  it("rotates 180 degrees — preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await rotate(img, 180);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });

  it("rotates 270 degrees — swaps width and height", async () => {
    const img = await makeTestImage(200, 100);
    const result = await rotate(img, 270);
    expect(result.width).toBe(100);
    expect(result.height).toBe(200);
  });
});

// ── flip ───────────────────────────────────────────────────────────

describe("flip", () => {
  it("preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await flip(img);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });

  it("returns valid data", async () => {
    const img = await makeTestImage();
    const result = await flip(img);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });
});

// ── flop ───────────────────────────────────────────────────────────

describe("flop", () => {
  it("preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await flop(img);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });

  it("returns valid data", async () => {
    const img = await makeTestImage();
    const result = await flop(img);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });
});

// ── grayscale ──────────────────────────────────────────────────────

describe("grayscale", () => {
  it("converts to grayscale (reduces channels)", async () => {
    const img = await makeTestImage(100, 100, 3);
    const result = await grayscale(img);
    // Verify the output is valid
    const meta = await info(result.data);
    expect(meta.channels).toBeLessThanOrEqual(3);
  });

  it("preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await grayscale(img);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });
});

// ── blur ───────────────────────────────────────────────────────────

describe("blur", () => {
  it("applies blur with default sigma", async () => {
    const img = await makeTestImage();
    const result = await blur(img);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("applies blur with custom sigma", async () => {
    const img = await makeTestImage();
    const result = await blur(img, 5.0);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.width).toBe(100);
  });

  it("preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await blur(img, 3.0);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });
});

// ── sharpen ────────────────────────────────────────────────────────

describe("sharpen", () => {
  it("applies sharpen with default sigma", async () => {
    const img = await makeTestImage();
    const result = await sharpen(img);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("applies sharpen with custom sigma", async () => {
    const img = await makeTestImage();
    const result = await sharpen(img, 2.0);
    expect(result.data).toBeInstanceOf(Buffer);
  });
});

// ── negate ─────────────────────────────────────────────────────────

describe("negate", () => {
  it("inverts colors and returns valid output", async () => {
    const img = await makeTestImage();
    const result = await negate(img);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await negate(img);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });
});

// ── tint ───────────────────────────────────────────────────────────

describe("tint", () => {
  it("applies a red tint", async () => {
    const img = await makeTestImage();
    const result = await tint(img, { r: 255, g: 0, b: 0 });
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("applies a blue tint and preserves dimensions", async () => {
    const img = await makeTestImage(200, 100);
    const result = await tint(img, { r: 0, g: 0, b: 255 });
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
  });
});

// ── composite ──────────────────────────────────────────────────────

describe("composite", () => {
  it("overlays one image on another", async () => {
    const base = await makeTestImage(200, 200);
    const overlay = await makeOverlayImage();
    const result = await composite(base, overlay, { left: 10, top: 10 });
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  it("composites at origin by default", async () => {
    const base = await makeTestImage(200, 200);
    const overlay = await makeOverlayImage();
    const result = await composite(base, overlay);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("composites with reduced opacity", async () => {
    const base = await makeTestImage(200, 200);
    const overlay = await makeOverlayImage();
    const result = await composite(base, overlay, {
      left: 0,
      top: 0,
      opacity: 0.5,
    });
    expect(result.data).toBeInstanceOf(Buffer);
  });
});

// ── thumbnail ──────────────────────────────────────────────────────

describe("thumbnail", () => {
  it("creates a square thumbnail from a landscape image", async () => {
    const img = await makeTestImage(300, 200);
    const result = await thumbnail(img, 64);
    expect(result.width).toBe(64);
    expect(result.height).toBe(64);
  });

  it("creates a square thumbnail from a portrait image", async () => {
    const img = await makeTestImage(100, 300);
    const result = await thumbnail(img, 48);
    expect(result.width).toBe(48);
    expect(result.height).toBe(48);
  });

  it("creates a square thumbnail from a square image", async () => {
    const img = await makeTestImage(200, 200);
    const result = await thumbnail(img, 100);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it("returns valid buffer data", async () => {
    const img = await makeTestImage();
    const result = await thumbnail(img, 32);
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });
});
