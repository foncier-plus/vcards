import './style.css';
import { decodeCard, buildVCard } from './codec.js';
import { renderQrSvg } from './qr.js';

const app = document.getElementById('app');
const params = new URLSearchParams(window.location.search);
const rawQuery = params.get('q') || '';

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
    <div class="flex min-h-screen items-center justify-center bg-white p-6">
      <img src="/logo.png" alt="Logo" class="w-72 max-w-[80%]" />
    </div>
  `;
}

function renderCard(data) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Nom Prénom';
  const subtitle = [data.role, data.org].filter(Boolean).join(' · ');
  const editHref = '/edit' + (rawQuery ? `?q=${rawQuery}` : '');

  return `
    <div class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 p-4">
      <article
        id="card"
        class="vcard relative grid aspect-[9/16] w-full max-w-sm grid-rows-[auto_minmax(0,1fr)_auto] items-center overflow-hidden rounded-[28px] px-6 py-8 shadow-xl"
      >
        <div class="vcard__accent pointer-events-none absolute inset-x-0 top-0 h-1.5"></div>

        <header class="flex w-full items-center justify-center">
          <img src="/logo.png" alt="Logo" class="h-auto w-48 max-w-[65%] object-contain" />
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
          ${data.email ? `<p class="break-all">${escapeHtml(data.email)}</p>` : ''}
            ${data.phone ? `<p>${escapeHtml(data.phone)}</p>` : ''}
          </div>
        </footer>
      </article>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <a href="${escapeHtml(editHref)}" class="btn btn-ghost">Éditer</a>
        <button id="install" type="button" hidden class="btn btn-primary">Installer l'application</button>
      </div>
    </div>
  `;
}

function setupInstall() {
  const installBtn = document.getElementById('install');
  if (!installBtn) return;
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
  });
}

function init() {
  let data = null;
  if (rawQuery) {
    try {
      data = decodeCard(rawQuery);
    } catch (error) {
      console.warn('Paramètre ?q= invalide', error);
    }
  }

  if (!data) {
    app.innerHTML = emptyState();
    return;
  }

  app.innerHTML = renderCard(data);
  const holder = document.getElementById('qr');
  holder.innerHTML = renderQrSvg(buildVCard(data), { margin: 1 });

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
  document.title = fullName ? `${fullName} · Carte de visite` : 'Carte de visite';

  setupInstall();
}

init();
