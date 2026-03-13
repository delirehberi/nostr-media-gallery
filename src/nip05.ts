// NIP-05 identifier resolution
// Spec: https://github.com/nostr-protocol/nips/blob/master/05.md
//
// Fetches https://<domain>/.well-known/nostr.json?name=<name>
// and returns the hex pubkey for that name.

interface Nip05Response {
  names?: Record<string, string>;
}

export function extractNip05FromUrl(url: string): string | null {
  // Match /name@domain.tld anywhere in the path, not preceded by @
  // Avoids matching things like email= query params
  const match = url.match(/(?:^|\/)([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:[/?#]|$)/);
  return match ? match[1] : null;
}

export function isNip05(value: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

export async function resolveNip05(identifier: string): Promise<string> {
  const atIdx = identifier.indexOf('@');
  if (atIdx === -1) throw new Error('Not a NIP-05 identifier');

  const name = identifier.substring(0, atIdx).toLowerCase();
  const domain = identifier.substring(atIdx + 1).toLowerCase();

  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`NIP-05 lookup failed (${response.status})`);

  const data = await response.json() as Nip05Response;
  const pubkey = data.names?.[name];
  if (!pubkey) throw new Error(`NIP-05 name "${name}" not found at ${domain}`);

  if (!/^[0-9a-fA-F]{64}$/.test(pubkey)) throw new Error('Invalid pubkey in NIP-05 response');

  return pubkey;
}
