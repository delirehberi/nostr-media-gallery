// Nostr relay querying via WebSocket
//
// Sources for media URLs:
//   - content field: plain URLs in kind 1 notes
//   - imeta tags (NIP-92): ["imeta", "url https://...", "m image/jpeg", ...]
//   - url tags (NIP-94): ["url", "https://..."] in kind 1063 file metadata events

import browser from 'webextension-polyfill';

export const DEFAULT_RELAYS = [
  'wss://nos.lol',
  'wss://nostr.mom',
  'wss://relay.damus.io',
];

export const STORAGE_KEY = 'relays';

const MEDIA_PATTERN = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|ogg)/gi;
const TIMEOUT_MS = 8000;

// kind 1 = short text note, kind 1063 = file metadata (NIP-94)
const QUERY_KINDS = [1, 1063];

type NostrTag = string[];

interface NostrEvent {
  content?: string;
  tags?: NostrTag[];
}

// Returns the note content with all media URLs stripped out (clean caption text)
function extractCaption(event: NostrEvent): string {
  const raw = (event.content ?? '').trim();
  return raw.replace(MEDIA_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
}

function extractUrlsFromEvent(event: NostrEvent): string[] {
  const urls: string[] = [];

  // 1. Scan content for media URLs
  const contentMatches = (event.content ?? '').match(MEDIA_PATTERN) ?? [];
  urls.push(...contentMatches);

  for (const tag of event.tags ?? []) {
    const [tagName, ...values] = tag;

    // 2. NIP-92 imeta tag: ["imeta", "url https://...", "m image/jpeg", ...]
    //    Each element after the tag name is a space-separated "key value" pair.
    if (tagName === 'imeta') {
      for (const part of values) {
        const spaceIdx = part.indexOf(' ');
        if (spaceIdx !== -1 && part.substring(0, spaceIdx) === 'url') {
          urls.push(part.substring(spaceIdx + 1).trim());
        }
      }
    }

    // 3. NIP-94 url tag: ["url", "https://..."]
    if (tagName === 'url' && values[0]) {
      urls.push(values[0].trim());
    }
  }

  return urls;
}

async function getRelays(): Promise<string[]> {
  try {
    const result = await browser.storage.sync.get(STORAGE_KEY);
    const saved = result[STORAGE_KEY] as string[] | undefined;
    return saved && saved.length > 0 ? saved : DEFAULT_RELAYS;
  } catch {
    return DEFAULT_RELAYS;
  }
}

// Returns Map<url, caption> — caption is the note text with media URLs stripped
export async function fetchMediaUrls(authorHex: string): Promise<Map<string, string>> {
  const foundUrls = new Map<string, string>();
  const relays = await getRelays();

  const promises = relays.map(relayUrl => {
    return new Promise<void>((resolve) => {
      const socket = new WebSocket(relayUrl);
      const timer = setTimeout(() => { socket.close(); resolve(); }, TIMEOUT_MS);

      socket.onopen = () => {
        socket.send(JSON.stringify(['REQ', 'sub', { authors: [authorHex], kinds: QUERY_KINDS, limit: 100 }]));
      };

      socket.onmessage = (msg: MessageEvent<string>) => {
        try {
          const data = JSON.parse(msg.data) as unknown[];
          if (data[0] === 'EVENT') {
            const event = data[2] as NostrEvent;
            const caption = extractCaption(event);
            for (const url of extractUrlsFromEvent(event)) {
              if (!foundUrls.has(url)) foundUrls.set(url, caption);
            }
          }
          if (data[0] === 'EOSE') {
            clearTimeout(timer);
            socket.close();
            resolve();
          }
        } catch {
          // ignore malformed messages
        }
      };

      socket.onerror = () => { clearTimeout(timer); resolve(); };
    });
  });

  await Promise.all(promises);
  return foundUrls;
}
