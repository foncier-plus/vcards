import QRCode from 'qrcode';

/**
 * Couleurs du QR Code pilotées par le CSS (variables personnalisables) :
 *   --qr-fg  : modules
 *   --qr-bg  : fond
 *   --qr-tl  : carré haut-gauche
 *   --qr-tr  : carré haut-droit
 *   --qr-bl  : carré bas-gauche
 * Définies dans src/style.css (:root).
 */
const FILLS = {
  dark: 'var(--qr-fg, #0f172a)',
  tl: 'var(--qr-tl, #2563eb)',
  tr: 'var(--qr-tr, #10b981)',
  bl: 'var(--qr-bl, #ef4444)',
};

function getMatrix(text, opts = {}) {
  const qr = QRCode.create(text, {
    errorCorrectionLevel: opts.errorCorrectionLevel || 'M',
  });
  return { size: qr.modules.size, data: qr.modules.data };
}

/**
 * Genere un QR Code en SVG.
 * Les trois carres de detection (finder patterns) peuvent avoir 3 couleurs differentes.
 */
export function renderQrSvg(text, opts = {}) {
  const { size, data } = getMatrix(text, opts);
  const margin = opts.margin ?? 2;
  const total = size + margin * 2;

  const inTL = (r, c) => r < 7 && c < 7;
  const inTR = (r, c) => r < 7 && c >= size - 7;
  const inBL = (r, c) => r >= size - 7 && c < 7;

  const paths = { dark: '', tl: '', tr: '', bl: '' };
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!data[r * size + c]) continue;
      let key = 'dark';
      if (inTL(r, c)) key = 'tl';
      else if (inTR(r, c)) key = 'tr';
      else if (inBL(r, c)) key = 'bl';
      paths[key] += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="QR Code">`,
    `<rect width="${total}" height="${total}" fill="var(--qr-bg, #ffffff)"/>`,
  ];
  for (const key of ['dark', 'tl', 'tr', 'bl']) {
    if (paths[key]) {
      parts.push(`<path class="qr-${key}" d="${paths[key]}" fill="${FILLS[key]}"/>`);
    }
  }
  parts.push('</svg>');
  return parts.join('');
}
