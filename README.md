# Carte de visite QR (PWA)

Carte de visite numérique verticale avec QR Code SVG, installable en PWA. Les données sont
stockées dans le **localStorage** du navigateur (pas de paramètre d'URL).

## URLs

| URL | Rôle |
| --- | --- |
| `/` | Affiche la carte enregistrée. Sans données : logo + bouton « Créer la carte de visite ». Double-clic sur la carte pour l'éditer. |
| `/edit` | Formulaire d'édition (pré-rempli depuis le localStorage). Enregistre puis revient sur `/`. |

## Stack

- Vite 7 + JavaScript (pas de TypeScript)
- Tailwind CSS (configuration classique `tailwind.config.js` / `postcss.config.js`)
- `qrcode` pour générer le QR en SVG
- `vite-plugin-pwa` pour le manifest + service worker (installation PWA)

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

La route `/edit` fonctionne aussi en dev et en preview (réécriture vers `edit.html`).

## Déploiement sur Vercel

Le plus simple :

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

Vercel détecte Vite automatiquement (`npm run build`, dossier `dist`).
`vercel.json` ajoute la réécriture `/edit` -> `/edit.html` et les bons en-têtes de cache.

Sinon : importez le repo sur https://vercel.com/new, framework « Vite », tout est déjà configuré.

## Personnalisation

### Images (à remplacer dans `public/`)
- `favicon.png` — favicon
- `apple-touch-icon.png` — icône iOS (180x180)
- `app-icon-192.png`, `app-icon-512.png` — icônes PWA
- `app-icon-maskable-512.png` — icône PWA « maskable » (Android)
- `logo.png` — logo **horizontal** affiché en haut de la carte

Des placeholders sont générés par `npm run gen:images` (`scripts/gen-placeholders.mjs`).
Remplacez-les par vos propres fichiers PNG (mêmes noms).

### Couleurs (dans le CSS)
Tout est piloté par variables CSS dans `src/style.css` (`:root`) :

```css
--qr-fg: #0f172a; /* modules du QR */
--qr-bg: #ffffff; /* fond du QR */
--qr-tl: #2563eb; /* carré haut-gauche */
--qr-tr: #10b981; /* carré haut-droit */
--qr-bl: #ef4444; /* carré bas-gauche */

--card-bg: #ffffff;
--card-text: #0f172a;
--card-muted: #64748b;
--card-accent: #0f172a;
```

Les classes `.vcard`, `.vcard__accent` et `.vcard__muted` les appliquent.

### CSS des pages
- Styles Tailwind + variables : `src/style.css`
- Carte (page `/`): `src/main.js` (fonction `renderCard`)
- Page d'édition : `src/edit.js` (fonction `render`)

## Contenu du QR Code
Le QR encode une fiche contact **vCard** (nom, prénom, tél, email, entité, rôle, URL).
