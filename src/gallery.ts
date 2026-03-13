// Gallery HTML generation — images open full-size in a new tab on click

export function buildGalleryHtml(authorHex: string, mediaMap: Map<string, string>): string {
  const mediaItems = [...mediaMap.entries()].map(([url, caption]) => {
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
    const captionHtml = caption
      ? `<div class="caption">${escapeHtml(caption)}</div>`
      : '';
    if (isVideo) {
      return `<div class="item"><video controls src="${escapeHtml(url)}"></video>${captionHtml}</div>`;
    }
    return `<div class="item"><a href="${escapeHtml(url)}" target="_blank" rel="noopener"><img src="${escapeHtml(url)}" alt="" loading="lazy"></a>${captionHtml}</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nostr Gallery: ${escapeHtml(authorHex.substring(0, 8))}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      color: #fff;
      font-family: sans-serif;
      padding: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    .item {
      border: 1px solid #333;
      background: #111;
      border-radius: 12px;
      overflow: hidden;
    }
    a { display: block; }
    img, video {
      width: 100%;
      display: block;
      border-bottom: 1px solid #222;
    }
    a img { cursor: zoom-in; transition: opacity 0.15s; }
    a:hover img { opacity: 0.85; }
    .caption {
      font-size: 13px;
      padding: 10px 12px;
      color: #ccc;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="grid">
${mediaItems}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
