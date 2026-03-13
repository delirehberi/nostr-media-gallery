// NIP-19 Bech32 decoder — supports npub1 and nprofile1 formats

const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) ALPHABET_MAP[ALPHABET[i]] = i;

export function decodeNostrToHex(bechString: string): string {
  if (/^[0-9a-fA-F]{64}$/.test(bechString)) return bechString;

  const p = bechString.lastIndexOf('1');
  const prefix = bechString.substring(0, p);
  const data = bechString.substring(p + 1);

  const words: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const val = ALPHABET_MAP[data[i]];
    if (val === undefined) throw new Error(`Invalid character: ${data[i]}`);
    words.push(val);
  }

  // Convert 5-bit words to 8-bit bytes
  let bits = 0, buffer = 0;
  const bytes: number[] = [];
  for (const value of words) {
    buffer = (buffer << 5) | value;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  if (prefix === 'npub') {
    return bytes.slice(0, 32).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (prefix === 'nprofile') {
    // TLV decoding: type 0 = pubkey
    let i = 0;
    while (i < bytes.length) {
      const type = bytes[i++];
      const length = bytes[i++];
      const value = bytes.slice(i, i + length);
      if (type === 0) {
        return value.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      i += length;
    }
  }

  throw new Error('Could not find pubkey in string');
}
