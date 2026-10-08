/**
 * Encodage / decodage de la carte dans le parametre ?q=
 * JSON -> UTF-8 -> base64url (compatible URL / QR).
 * Les couleurs ne sont pas stockées : elles se règlent dans le CSS.
 */

const DEFAULTS = {
  v: 1,
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  url: '',
  org: '',
  role: '',
};

function toBase64Url(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  let base64 = String(value).replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const bin = atob(base64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return bytes;
}

export function mergeCard(input) {
  const src = input && typeof input === 'object' ? input : {};
  const merged = { ...DEFAULTS, ...src };
  return {
    v: merged.v,
    firstName: merged.firstName || '',
    lastName: merged.lastName || '',
    phone: merged.phone || '',
    email: merged.email || '',
    url: merged.url || '',
    org: merged.org || '',
    role: merged.role || '',
  };
}

export function encodeCard(data) {
  const clean = mergeCard(data);
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  return toBase64Url(bytes);
}

export function decodeCard(value) {
  if (!value) return null;
  const bytes = fromBase64Url(value);
  const json = new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json);
  return mergeCard(parsed);
}

export function buildVCard(d) {
  const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ').trim();
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${d.lastName || ''};${d.firstName || ''};;;`,
    `FN:${fullName}`,
    d.org ? `ORG:${d.org}` : '',
    d.role ? `TITLE:${d.role}` : '',
    d.phone ? `TEL;TYPE=CELL:${d.phone}` : '',
    d.email ? `EMAIL;TYPE=INTERNET:${d.email}` : '',
    d.url ? `URL:${d.url}` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\r\n');
}

export function buildCardUrl(data, base) {
  const origin = base || (typeof location !== 'undefined' ? location.origin : '');
  const code = encodeCard(data);
  return `${origin}/?q=${code}`;
}
