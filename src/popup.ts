import browser from 'webextension-polyfill';
import { decodeNostrToHex } from './nip19';
import { extractNip05FromUrl, isNip05, resolveNip05 } from './nip05';
import { fetchMediaUrls } from './relay';
import { buildGalleryHtml } from './gallery';

document.addEventListener('DOMContentLoaded', async () => {
  const inputField = document.getElementById('address') as HTMLInputElement;
  const statusEl = document.getElementById('status') as HTMLDivElement;
  const fetchBtn = document.getElementById('fetchBtn') as HTMLButtonElement;
  const settingsLink = document.getElementById('settings-link') as HTMLSpanElement;

  settingsLink.addEventListener('click', () => browser.runtime.openOptionsPage());

  // Auto-detect npub/nprofile or NIP-05 identifier from active tab URL
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    const nostrMatch = tab.url.match(/(nprofile1|npub1)[a-z0-9]+/);
    if (nostrMatch) {
      inputField.value = nostrMatch[0];
      statusEl.innerText = 'Found address in URL!';
    } else {
      const nip05 = extractNip05FromUrl(tab.url);
      if (nip05) {
        inputField.value = nip05;
        statusEl.innerText = 'Found NIP-05 address in URL!';
      }
    }
  }

  fetchBtn.addEventListener('click', async () => {
    const input = inputField.value.trim();
    if (!input) return;

    fetchBtn.disabled = true;

    let authorHex: string;
    try {
      if (isNip05(input)) {
        statusEl.innerText = 'Resolving NIP-05…';
        authorHex = await resolveNip05(input);
      } else {
        authorHex = decodeNostrToHex(input);
      }
    } catch (e) {
      statusEl.innerText = `Error: ${e instanceof Error ? e.message : 'Invalid address.'}`;
      fetchBtn.disabled = false;
      return;
    }

    statusEl.innerText = 'Querying relays…';

    const urls = await fetchMediaUrls(authorHex);

    fetchBtn.disabled = false;

    if (urls.size === 0) {
      statusEl.innerText = 'No media found for this address.';
      return;
    }

    const html = buildGalleryHtml(authorHex, urls); // urls is Map<string, string>
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
    statusEl.innerText = `Found ${urls.size} items!`;
  });
});
