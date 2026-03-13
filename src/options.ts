import browser from 'webextension-polyfill';
import { DEFAULT_RELAYS, STORAGE_KEY } from './relay';

const listEl = document.getElementById('relay-list') as HTMLUListElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

function renderRelays(relays: string[]) {
  listEl.innerHTML = '';
  for (const relay of relays) {
    addRelayRow(relay);
  }
}

function addRelayRow(value = '') {
  const li = document.createElement('li');
  const input = document.createElement('input');
  input.type = 'url';
  input.placeholder = 'wss://relay.example.com';
  input.value = value;

  const btn = document.createElement('button');
  btn.className = 'btn-remove';
  btn.textContent = 'Remove';
  btn.addEventListener('click', () => li.remove());

  li.appendChild(input);
  li.appendChild(btn);
  listEl.appendChild(li);
  input.focus();
}

function getCurrentRelays(): string[] {
  return Array.from(listEl.querySelectorAll<HTMLInputElement>('input'))
    .map(i => i.value.trim())
    .filter(v => v.length > 0);
}

document.getElementById('btn-add')!.addEventListener('click', () => addRelayRow());

document.getElementById('btn-reset')!.addEventListener('click', () => {
  renderRelays(DEFAULT_RELAYS);
  statusEl.textContent = '';
});

document.getElementById('btn-save')!.addEventListener('click', async () => {
  const relays = getCurrentRelays();
  if (relays.length === 0) {
    statusEl.style.color = '#e25555';
    statusEl.textContent = 'Add at least one relay.';
    return;
  }
  await browser.storage.sync.set({ [STORAGE_KEY]: relays });
  statusEl.style.color = '#6abf6a';
  statusEl.textContent = 'Saved!';
  setTimeout(() => { statusEl.textContent = ''; }, 2000);
});

// Load saved relays on open
browser.storage.sync.get(STORAGE_KEY).then(result => {
  const saved = result[STORAGE_KEY] as string[] | undefined;
  renderRelays(saved && saved.length > 0 ? saved : DEFAULT_RELAYS);
});
