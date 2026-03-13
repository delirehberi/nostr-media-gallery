# Privacy Policy — Nostr Media Gallery

**Last updated: 2026-03-12**

## Summary

Nostr Media Gallery does **not** collect, store, or transmit any personal data to any servers we control.

## What the extension does

1. Reads the URL of your active browser tab to detect a Nostr address (`npub` or `nprofile`).
2. Connects directly from your browser to public Nostr relays (WebSocket) to query posts.
3. Renders the retrieved media in a local browser tab generated entirely on your device.

## Data handling

| Data | Stored? | Sent to third parties? |
|------|---------|------------------------|
| Active tab URL | No — read once and discarded | No |
| Nostr public key | No | Only sent to the Nostr relays you query |
| Media URLs | No | No — loaded directly by your browser |
| Browsing history | No | No |

## Third-party services

The extension connects to public Nostr relays:
- `wss://nos.lol`
- `wss://nostr.mom`
- `wss://relay.damus.io`

These are open, decentralized Nostr relays. By querying them your IP address is visible to those relay operators, as with any WebSocket connection. We have no affiliation with and no control over these services.

## Permissions

- **`tabs` / `activeTab`**: Used solely to read the current tab URL for auto-detecting a Nostr address. No other tab data is accessed.

## Contact

Open an issue at https://github.com/delirehberi/nostr-media-gallery
