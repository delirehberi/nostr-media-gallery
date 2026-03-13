import browser from 'webextension-polyfill';
import { decodeNostrToHex } from './nip19';
import { fetchMediaUrls } from './relay';
import { buildGalleryHtml } from './gallery';

document.addEventListener('DOMContentLoaded', async () => {
  const inputField = document.getElementById('address') as HTMLInputElement;
  const statusEl = document.getElementById('status') as HTMLDivElement;
  const fetchBtn = document.getElementById('fetchBtn') as HTMLButtonElement;
  const settingsLink = document.getElementById('settings-link') as HTMLSpanElement;

  settingsLink.addEventListener('click', () => browser.runtime.openOptionsPage());

  // Auto-detect npub/nprofile from active tab URL
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    const match = tab.url.match(/(nprofile1|npub1)[a-z0-9]+/);
    if (match) {
      inputField.value = match[0];
      statusEl.innerText = 'Found address in URL!';
    }
  }

  fetchBtn.addEventListener('click', async () => {
    const input = inputField.value.trim();
    if (!input) return;

    let authorHex: string;
    try {
      authorHex = decodeNostrToHex(input);
    } catch {
      statusEl.innerText = 'Error: Invalid Nostr address.';
      return;
    }

    fetchBtn.disabled = true;
    statusEl.innerText = 'Querying relays…';

    const urls = await fetchMediaUrls(authorHex);

    fetchBtn.disabled = false;

    if (urls.size === 0) {
      statusEl.innerText = 'No media found for this address.';
      return;
    }

    const html = buildGalleryHtml(authorHex, urls);
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
    statusEl.innerText = `Found ${urls.size} items!`;
  });
});
