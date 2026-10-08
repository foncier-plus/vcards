import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
mkdirSync(PUBLIC_DIR, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, pixel) {
  const bpp = 4;
  const raw = Buffer.alloc((width * bpp + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = pixel(x, y, width, height);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a ?? 255;
      offset += bpp;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function inRoundRect(x, y, rx, ry, w, h, r) {
  if (x < rx || y < ry || x >= rx + w || y >= ry + h) return false;
  const cx = Math.min(Math.max(x, rx + r), rx + w - r);
  const cy = Math.min(Math.max(y, ry + r), ry + h - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

const DARK = [15, 23, 42, 255];
const TL = [37, 99, 235, 255];
const TR = [16, 185, 129, 255];
const BL = [239, 68, 68, 255];
const WHITE = [255, 255, 255, 255];

/** Icone : tuile sombre arrondie avec les 3 carres de detection colores. */
function iconPixel(safeInset) {
  return (x, y, w) => {
    const radius = w * 0.22;
    const inset = w * safeInset;
    if (!inRoundRect(x, y, inset, inset, w - 2 * inset, w - 2 * inset, radius)) {
      return [0, 0, 0, 0];
    }
    const bg = safeInset > 0.01 ? DARK : WHITE;
    const square = w * 0.19;
    const margin = w * 0.24;
    const gap = w - margin * 2 - square;
    const points = [
      [margin, margin, TL],
      [margin + gap, margin, TR],
      [margin, margin + gap, BL],
    ];
    for (const [px, py, color] of points) {
      if (inRoundRect(x, y, px, py, square, square, square * 0.28)) return color;
    }
    return bg;
  };
}

/** Logo horizontal : marque + barres representant le nom. */
function logoPixel(x, y, w, h) {
  const mark = h * 0.5;
  const mx = h * 0.2;
  const my = (h - mark) / 2;
  const square = mark * 0.42;
  const points = [
    [mx, my, TL],
    [mx + square * 1.15, my, TR],
    [mx, my + square * 1.15, BL],
  ];
  for (const [px, py, color] of points) {
    if (inRoundRect(x, y, px, py, square, square, square * 0.3)) return color;
  }
  const barsX = mx + mark + h * 0.25;
  if (x > barsX) {
    const barH = h * 0.13;
    const gap = h * 0.12;
    const startY = (h - (barH * 2 + gap)) / 2;
    const widths = [w - barsX - h * 0.4, (w - barsX - h * 0.4) * 0.66];
    for (let i = 0; i < 2; i += 1) {
      const by = startY + i * (barH + gap);
      if (y >= by && y < by + barH && x < barsX + widths[i]) return DARK;
    }
  }
  return [0, 0, 0, 0];
}

function write(name, buffer) {
  const out = join(PUBLIC_DIR, name);
  writeFileSync(out, buffer);
  console.log('écrit', out);
}

write('favicon.png', encodePng(64, 64, iconPixel(0.04)));
write('apple-touch-icon.png', encodePng(180, 180, iconPixel(0.06)));
write('app-icon-192.png', encodePng(192, 192, iconPixel(0.06)));
write('app-icon-512.png', encodePng(512, 512, iconPixel(0.06)));
write('app-icon-maskable-512.png', encodePng(512, 512, iconPixel(0.18)));
write('logo.png', encodePng(640, 160, logoPixel));

console.log('Placeholders générés dans /public.');
