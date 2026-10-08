/**
 * Données de la carte de visite.
 * Stockage local (localStorage) : plus fiable qu'un paramètre d'URL.
 * Les couleurs ne sont pas stockées : elles se règlent dans le CSS.
 */

const STORAGE_KEY = 'vcard';

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

export function loadCard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeCard(JSON.parse(raw));
  } catch (error) {
    console.warn('Carte locale illisible', error);
    return null;
  }
}

export function saveCard(data) {
  const clean = mergeCard(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

export function clearCard() {
  localStorage.removeItem(STORAGE_KEY);
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
