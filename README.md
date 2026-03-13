# Nostr Media Gallery

A browser extension that generates a responsive media gallery from any Nostr user's posts.

Visit a Nostr profile page, click the extension icon, and browse their images and videos in a full-screen gallery with lightbox support — works in Firefox, Chrome, and Edge.

## Features

- Auto-detects `npub`/`nprofile` addresses from the current tab URL
- Queries multiple public Nostr relays in parallel
- Responsive grid gallery with lightbox (click image → full screen, Escape/arrows to navigate)
- Video playback with native controls
- Zero external dependencies at runtime — all processing is local
- Cross-browser: Firefox, Chrome, Edge

## Installation

### From the stores (recommended)

- **Firefox:** [Firefox Add-ons (AMO)](https://addons.mozilla.org) — search "Nostr Media Gallery"
- **Chrome:** [Chrome Web Store](https://chrome.google.com/webstore) — search "Nostr Media Gallery"
- **Edge:** [Edge Add-ons](https://microsoftedge.microsoft.com/addons) — search "Nostr Media Gallery"

### From a release zip

1. Download `firefox.zip` or `chromium.zip` from the [latest release](https://github.com/delirehberi/nostr-media-gallery/releases/latest)
2. **Firefox:** Go to `about:debugging` → "This Firefox" → "Load Temporary Add-on" → select the zip
3. **Chrome/Edge:** Unzip, go to `chrome://extensions` or `edge://extensions` → enable "Developer mode" → "Load unpacked" → select the unzipped folder

### From source

```bash
git clone https://github.com/delirehberi/nostr-media-gallery
cd nostr-gallery-ext
nvm use 22        # or: node >= 18
npm install
npm run build
# Artifacts: dist/firefox.zip  dist/chromium.zip
```

## Development

```bash
npm install
npm run typecheck   # TypeScript type check
npm run build       # Build both targets
```

Load `dist/firefox/` or `dist/chromium/` as an unpacked extension for local testing.

### Project structure

```
src/
  nip19.ts     NIP-19 Bech32 decoder (npub / nprofile)
  relay.ts     WebSocket Nostr relay queries
  gallery.ts   Gallery HTML + inline lightbox generator
  popup.ts     Extension popup entry point
scripts/
  build.ts     esbuild build script (produces Firefox + Chromium zips)
```

## Privacy

No data is collected or transmitted beyond the Nostr relay queries your browser makes directly. See [store/PRIVACY_POLICY.md](store/PRIVACY_POLICY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
