async function loadContent() {
  const response = await fetch('/api/content', { cache: 'no-store' });
  const data = await response.json();
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };
  document.title = `${data.title} | Ebook`;
  setText('highlight', data.highlight);
  setText('title', data.title);
  setText('subtitle', data.subtitle);
  setText('description', data.description);
  setText('version', data.version);
  setText('pages', data.pages);
  setText('downloadButton', data.downloadButton);
  setText('author', data.author);
  setText('role', data.role);
  setText('footerNote', data.footerNote);
  const instagramButton = document.getElementById('instagramButton');
  const instagramFooter = document.getElementById('instagramFooter');
  if (instagramButton) {
    instagramButton.href = data.instagramUrl;
    instagramButton.textContent = data.secondaryButton || 'Ver Instagram';
  }
  if (instagramFooter) {
    instagramFooter.href = data.instagramUrl;
    instagramFooter.textContent = data.instagram;
  }
}
loadContent().catch(console.error);
