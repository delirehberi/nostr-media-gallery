# Changelog

## [2.0.0] — 2026-03-12

### Added
- TypeScript rewrite: `src/nip19.ts`, `src/relay.ts`, `src/gallery.ts`, `src/popup.ts`
- Cross-browser support: Chrome and Edge (Chromium build via `manifest.chromium.json`)
- Lightbox for images: full-screen overlay, keyboard navigation (Escape, arrow keys), click-outside-to-close
- `esbuild`-based build system producing separate `firefox.zip` and `chromium.zip` artifacts
- GitHub Actions CI/CD: builds on push/PR, creates GitHub Release on version tags
- Extension icons (SVG, 48px and 128px)
- Store listing copy and privacy policy
- `webextension-polyfill` for unified `browser.*` API across browsers
- `README.md`, `LICENSE` (MIT), `CONTRIBUTING.md`

### Changed
- `popup.js` replaced by compiled TypeScript output in `dist/`
- `manifest.json` split into `manifest.firefox.json` and `manifest.chromium.json`

## [1.1.0] — initial release

- Firefox-only extension
- NIP-19 Bech32 decoder for `npub` and `nprofile`
- WebSocket relay queries (nos.lol, nostr.mom, relay.damus.io)
- Blob-URL gallery tab with image and video support
