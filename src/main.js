import './style.css';
import { loadCard, buildVCard } from './codec.js';
import { renderQrSvg } from './qr.js';

const app = document.getElementById('app');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function emptyState() {
  return `
    <div class="flex min-h-screen flex-col items-center justify-center gap-8 bg-white p-6">
      <img src="/logo.png" alt="Logo" class="w-72 max-w-[80%]" />
      <a href="/edit" class="btn btn-primary">Créer la carte de visite</a>
    </div>
  `;
}

function renderCard(data) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Nom Prénom';
  const subtitle = [data.role, data.org].filter(Boolean).join(' · ');

  return `
    <div class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-4">
      <article
        id="card"
        title="Double-cliquez pour éditer"
        class="vcard relative grid aspect-[9/16] w-full max-w-sm cursor-pointer select-none grid-rows-[auto_minmax(0,1fr)_auto] items-center overflow-hidden rounded-[28px] px-6 py-8 shadow-xl"
      >
        <div class="vcard__accent pointer-events-none absolute inset-x-0 top-0 h-1.5"></div>

        <header class="flex w-full items-center justify-center">
          <img src="/logo.png" alt="Logo" class="h-auto h-24 max-w-[80%] object-contain" />
        </header>

        <main class="flex min-h-0 w-full items-center justify-center py-4">
          <div id="qr" class="aspect-square h-full max-h-[280px] max-w-full"></div>
        </main>

        <footer class="w-full text-center leading-tight">
          <p class="text-lg font-semibold tracking-tight">${escapeHtml(fullName)}</p>
          ${
            subtitle
              ? `<p class="vcard__muted mt-0.5 text-xs">${escapeHtml(subtitle)}</p>`
              : ''
          }
          <div class="mt-3 space-y-1 text-sm">
            ${data.phone ? `<p>${escapeHtml(data.phone)}</p>` : ''}
            ${data.email ? `<p class="break-all">${escapeHtml(data.email)}</p>` : ''}
          </div>
        </footer>
      </article>
    </div>
  `;
}

function init() {
  const data = loadCard();

  if (!data) {
    app.innerHTML = emptyState();
    return;
  }

  app.innerHTML = renderCard(data);
  document.getElementById('qr').innerHTML = renderQrSvg(buildVCard(data), { margin: 1 });

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
  document.title = fullName ? `${fullName} · Carte de visite` : 'Carte de visite';

  document.getElementById('card').addEventListener('dblclick', () => {
    window.location.href = '/edit';
  });
}

init();
