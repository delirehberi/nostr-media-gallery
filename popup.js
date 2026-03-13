// --- ROBUST NOSTR DECODER (NIP-19 COMPLIANT) ---
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) ALPHABET_MAP[ALPHABET[z]] = z;

function decodeNostrToHex(bechString) {
    if (/^[0-9a-fA-F]{64}$/.test(bechString)) return bechString; // Already Hex

    const p = bechString.lastIndexOf('1');
    const prefix = bechString.substring(0, p);
    const data = bechString.substring(p + 1);

    let words = [];
    for (let i = 0; i < data.length; i++) {
        if (ALPHABET_MAP[data[i]] === undefined) throw new Error("Invalid character");
        words.push(ALPHABET_MAP[data[i]]);
    }

    // Convert 5-bit words to 8-bit bytes
    let bits = 0, buffer = 0, bytes = [];
    for (const value of words) {
        buffer = (buffer << 5) | value;
        bits += 5;
        while (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >> bits) & 255);
        }
    }

    if (prefix === 'npub') {
        return bytes.slice(0, 32).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (prefix === 'nprofile') {
        // TLV Decoding for nprofile: Type 0 is the pubkey
        let i = 0;
        while (i < bytes.length) {
            const type = bytes[i++];
            const length = bytes[i++];
            const value = bytes.slice(i, i + length);
            if (type === 0) { // Type 0 = Public Key
                return value.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            i += length;
        }
    }
    throw new Error("Could not find pubkey in string");
}
// --- END DECODER ---

document.addEventListener('DOMContentLoaded', async () => {
    const inputField = document.getElementById('address');
    const status = document.getElementById('status');

    // 1. Get active tab URL and extract nprofile/npub
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        // Regex to find any bech32 starting with nprofile or npub
        const match = tab.url.match(/(nprofile1|npub1)[a-z0-9]+/);
        if (match) {
            inputField.value = match[0];
            status.innerText = "Found address in URL!";
        }
    }

    document.getElementById('fetchBtn').addEventListener('click', async () => {
        const input = inputField.value.trim();
        if (!input) return;

        let authorHex;
        try {
            authorHex = decodeNostrToHex(input);
            console.log("Fetching for Hex:", authorHex); // Verify in Inspect > Console
        } catch (e) {
            status.innerText = "Error: Invalid Nostr address.";
            return;
        }

        status.innerText = "Querying Relays...";
        const relays = ["wss://nos.lol", "wss://nostr.mom", "wss://relay.damus.io"];
        const mediaPattern = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|ogg)/gi;
        const matrixPattern = /https:\/\/matrix\.org\/[^\s"']+/g;
        let foundUrls = new Set();

        const promises = relays.map(url => {
            return new Promise((resolve) => {
                const socket = new WebSocket(url);
                const t = setTimeout(() => { socket.close(); resolve(); }, 8000);

                socket.onopen = () => {
                    socket.send(JSON.stringify(["REQ", "sub", { authors: [authorHex], kinds: [1], limit: 100 }]));
                };

                socket.onmessage = (msg) => {
                    const data = JSON.parse(msg.data);
                    if (data[0] === "EVENT" && data[2].content) {
                        const content = data[2].content;
                        const m1 = content.match(mediaPattern) || [];
                        const m2 = content.match(matrixPattern) || [];
                        [...m1, ...m2].forEach(url => foundUrls.add(url));
                    }
                    if (data[0] === "EOSE") { socket.close(); resolve(); }
                };
                socket.onerror = () => resolve();
            });
        });

        await Promise.all(promises);

        if (foundUrls.size === 0) {
            status.innerText = "No media found for this Hex.";
            return;
        }

        // Build the Gallery Page
        let galleryHtml = `<html><head><title>Nostr Gallery: ${authorHex.substring(0,8)}</title><style>
            body { background: #000; color: #fff; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; padding: 20px; font-family: sans-serif; }
            .item { border: 1px solid #333; background: #111; border-radius: 12px; overflow: hidden; }
            img, video { width: 100%; display: block; border-bottom: 1px solid #333; }
            .label { font-size: 11px; padding: 10px; color: #666; word-break: break-all; }
        </style></head><body>`;

        foundUrls.forEach(url => {
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
            galleryHtml += `<div class="item">${isVideo ? `<video controls src="${url}"></video>` : `<img src="${url}">`}<div class="label">${url}</div></div>`;
        });
        galleryHtml += `</body></html>`;

        const blob = new Blob([galleryHtml], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
        status.innerText = `Found ${foundUrls.size} items!`;
    });
});
