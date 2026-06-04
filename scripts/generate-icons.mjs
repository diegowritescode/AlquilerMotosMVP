// Dependency-free PWA icon generator. Draws a brand "wheel" (gold on dark) and
// writes PNGs to public/icons. Re-run with: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const DARK = [10, 10, 11]; // #0a0a0b
const GOLD = [245, 197, 24]; // #f5c518

// --- minimal PNG encoder (RGBA, color type 6) ---
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // rows with filter byte 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawIcon(size, { maskable }) {
  const buf = Buffer.alloc(size * size * 4);
  const c = (size - 1) / 2;
  const R = size / 2;
  // Scale wheel smaller for maskable (safe zone ~ central 80%).
  const ringOuter = maskable ? 0.66 : 0.92;
  const ringInner = maskable ? 0.54 : 0.78;
  const hub = maskable ? 0.13 : 0.16;
  const spokeHalf = size * 0.017;
  const angles = [0, Math.PI / 3, (2 * Math.PI) / 3]; // 3 diameters -> 6 spokes

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const r = Math.sqrt(dx * dx + dy * dy);
      const rn = r / R;
      let col = DARK;
      if (rn >= ringInner && rn <= ringOuter) {
        col = GOLD; // tire ring
      } else if (rn <= hub) {
        col = GOLD; // hub
      } else if (rn > hub && rn < ringInner) {
        for (const a of angles) {
          const perp = Math.abs(dx * Math.sin(a) - dy * Math.cos(a));
          if (perp <= spokeHalf) {
            col = GOLD;
            break;
          }
        }
      }
      const i = (y * size + x) * 4;
      buf[i] = col[0];
      buf[i + 1] = col[1];
      buf[i + 2] = col[2];
      buf[i + 3] = 255;
    }
  }
  return encodePng(size, buf);
}

mkdirSync("public/icons", { recursive: true });
const targets = [
  ["public/icons/icon-192x192.png", 192, false],
  ["public/icons/icon-512x512.png", 512, false],
  ["public/icons/maskable-192x192.png", 192, true],
  ["public/icons/maskable-512x512.png", 512, true],
  ["public/icons/apple-touch-icon.png", 180, false],
];
for (const [path, size, maskable] of targets) {
  writeFileSync(path, drawIcon(size, { maskable }));
  console.log("wrote", path);
}
