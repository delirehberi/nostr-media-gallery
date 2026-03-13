// Gallery HTML generation with inline lightbox

export function buildGalleryHtml(authorHex: string, urls: Set<string>): string {
  const items = [...urls];
  const itemsJson = JSON.stringify(items);

  const mediaItems = items.map((url, i) => {
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
    if (isVideo) {
      return `<div class="item"><video controls src="${escapeHtml(url)}"></video><div class="label">${escapeHtml(url)}</div></div>`;
    }
    return `<div class="item"><img src="${escapeHtml(url)}" alt="" loading="lazy" data-index="${i}" onclick="openLightbox(${i})"><div class="label">${escapeHtml(url)}</div></div>`;
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
    img, video {
      width: 100%;
      display: block;
      border-bottom: 1px solid #333;
    }
    img { cursor: zoom-in; }
    .label {
      font-size: 11px;
      padding: 10px;
      color: #666;
      word-break: break-all;
    }

    /* Lightbox */
    #lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    #lightbox.open { display: flex; }
    #lightbox img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 4px;
      cursor: default;
    }
    #lb-close {
      position: fixed;
      top: 16px;
      right: 20px;
      font-size: 36px;
      color: #fff;
      cursor: pointer;
      line-height: 1;
      user-select: none;
    }
    #lb-prev, #lb-next {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      font-size: 48px;
      color: #fff;
      cursor: pointer;
      user-select: none;
      padding: 0 16px;
      opacity: 0.7;
    }
    #lb-prev:hover, #lb-next:hover { opacity: 1; }
    #lb-prev { left: 0; }
    #lb-next { right: 0; }
  </style>
</head>
<body>
  <div class="grid">
${mediaItems}
  </div>

  <div id="lightbox" role="dialog" aria-modal="true">
    <span id="lb-close" onclick="closeLightbox()" title="Close">&#x2715;</span>
    <span id="lb-prev" onclick="moveLightbox(-1)" title="Previous">&#x2039;</span>
    <img id="lb-img" src="" alt="">
    <span id="lb-next" onclick="moveLightbox(1)" title="Next">&#x203A;</span>
  </div>

  <script>
    const allUrls = ${itemsJson};
    const imageUrls = allUrls.filter(u => !/\\.(mp4|webm|ogg|mov)$/i.test(u));
    let currentIndex = 0;

    function openLightbox(gridIndex) {
      const url = allUrls[gridIndex];
      currentIndex = imageUrls.indexOf(url);
      document.getElementById('lb-img').src = url;
      document.getElementById('lightbox').classList.add('open');
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('open');
      document.getElementById('lb-img').src = '';
    }

    function moveLightbox(dir) {
      currentIndex = (currentIndex + dir + imageUrls.length) % imageUrls.length;
      document.getElementById('lb-img').src = imageUrls[currentIndex];
    }

    document.getElementById('lightbox').addEventListener('click', function(e) {
      if (e.target === this) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
      const lb = document.getElementById('lightbox');
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') moveLightbox(-1);
      if (e.key === 'ArrowRight') moveLightbox(1);
    });
  </script>
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
