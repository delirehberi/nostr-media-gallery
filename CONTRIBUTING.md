# Contributing

Contributions are welcome! Here's how to get started.

## Setup

```bash
git clone https://github.com/delirehberi/nostr-media-gallery
cd nostr-gallery-ext
nvm use 22
npm install
```

## Development workflow

```bash
npm run typecheck   # Run TypeScript type checker
npm run build       # Build extension for Firefox and Chromium
```

Load the extension locally:
- **Firefox:** `about:debugging` → "This Firefox" → "Load Temporary Add-on" → select `dist/firefox/manifest.json`
- **Chrome/Edge:** `chrome://extensions` → enable Developer mode → "Load unpacked" → select `dist/chromium/`

## Project layout

| Path | Purpose |
|------|---------|
| `src/nip19.ts` | NIP-19 Bech32 decoder |
| `src/relay.ts` | WebSocket relay querying |
| `src/gallery.ts` | Gallery HTML + lightbox generator |
| `src/popup.ts` | Popup entry point |
| `scripts/build.ts` | esbuild build script |
| `manifest.firefox.json` | Firefox manifest |
| `manifest.chromium.json` | Chromium manifest |

## Submitting a PR

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm run typecheck && npm run build` and verify there are no errors
4. Open a pull request with a clear description of the change

## Reporting issues

Please open a GitHub issue with steps to reproduce.
