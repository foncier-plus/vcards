import './style.css';
import { loadCard, saveCard, mergeCard, buildVCard } from './codec.js';
import { renderQrSvg } from './qr.js';

const app = document.getElementById('app');
const current = loadCard() || mergeCard(null);

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

const TEXT_FIELDS = [
  { id: 'firstName', label: 'Prénom', type: 'text', placeholder: 'Ada' },
  { id: 'lastName', label: 'Nom', type: 'text', placeholder: 'Lovelace' },
  { id: 'phone', label: 'Téléphone', type: 'tel', placeholder: '+33 6 12 34 56 78' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'ada@example.com' },
  { id: 'url', label: 'Site / URL', type: 'url', placeholder: 'https://example.com' },
  { id: 'org', label: 'Entité', type: 'text', placeholder: 'ACME' },
  { id: 'role', label: 'Rôle', type: 'text', placeholder: 'Directrice' },
];

function textField(f) {
  return `
    <div>
      <label class="label" for="${f.id}">${f.label}</label>
      <input class="field" id="${f.id}" name="${f.id}" type="${f.type}"
        placeholder="${f.placeholder}" value="${escapeHtml(current[f.id])}" />
    </div>
  `;
}

function render() {
  app.innerHTML = `
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(320px,380px)] lg:py-12">
      <form id="form" class="space-y-6">
        <header>
          <a href="/" class="text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-600">← Carte de visite</a>
          <h1 class="mt-1 text-2xl font-bold">Éditer la carte</h1>
          <p class="text-sm text-slate-500">Renseignez les informations puis enregistrez la carte.</p>
        </header>

        <section class="card-surface p-5">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Identité</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            ${TEXT_FIELDS.map(textField).join('')}
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-xs text-slate-400">
            La carte est enregistrée dans ce navigateur. Le QR Code encode une fiche contact (vCard).
            Les couleurs se règlent dans le CSS (<code>src/style.css</code>).
          </p>
          <div class="flex flex-wrap gap-2 pt-1">
            <button type="submit" class="btn btn-primary">Enregistrer la carte</button>
            <a href="/" class="btn btn-ghost">Annuler</a>
          </div>
        </section>
      </form>

      <aside class="lg:sticky lg:top-12 lg:self-start">
        <div class="card-surface p-5">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Aperçu</h2>
          <article id="preview" class="vcard mx-auto flex aspect-[9/16] w-full max-w-[300px] flex-col items-center overflow-hidden rounded-[24px] px-5 py-6 shadow-lg">
            <img src="/logo.png" alt="Logo" class="h-auto w-40 max-w-[60%] object-contain" />
            <div id="previewQr" class="my-auto aspect-square w-full max-w-[210px]"></div>
            <div class="w-full text-center leading-tight">
              <p id="previewName" class="text-base font-semibold"></p>
              <p id="previewSub" class="vcard__muted mt-0.5 text-[11px]"></p>
              <div class="mt-2 space-y-0.5 text-[11px]">
                <p id="previewPhone"></p>
                <p id="previewEmail" class="break-all"></p>
              </div>
            </div>
          </article>
        </div>
      </aside>
    </div>
  `;

  bind();
  refresh();
}

function readForm() {
  const data = { ...current };
  for (const f of TEXT_FIELDS) {
    data[f.id] = document.getElementById(f.id).value.trim();
  }
  return mergeCard(data);
}

function refresh() {
  const data = readForm();

  document.getElementById('previewQr').innerHTML = renderQrSvg(buildVCard(data), { margin: 1 });

  document.getElementById('previewName').textContent =
    [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Nom Prénom';
  document.getElementById('previewSub').textContent =
    [data.role, data.org].filter(Boolean).join(' · ');
  document.getElementById('previewPhone').textContent = data.phone;
  document.getElementById('previewEmail').textContent = data.email;

  return data;
}

function bind() {
  const form = document.getElementById('form');
  form.addEventListener('input', refresh);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveCard(refresh());
    window.location.href = '/';
  });
}

render();
