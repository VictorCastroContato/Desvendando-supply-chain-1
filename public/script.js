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
const emailDownloadButton = document.getElementById('downloadButton');
const closeEmailModal = document.getElementById('closeEmailModal');
const emailModal = document.getElementById('emailModal');
const downloadForm = document.getElementById('downloadForm');

if (emailDownloadButton && emailModal) {
  emailDownloadButton.addEventListener('click', () => {
    emailModal.classList.add('active');
  });
}

if (closeEmailModal && emailModal) {
  closeEmailModal.addEventListener('click', () => {
    emailModal.classList.remove('active');
  });
}

if (emailModal) {
  emailModal.addEventListener('click', (event) => {
    if (event.target === emailModal) {
      emailModal.classList.remove('active');
    }
  });
}

if (downloadForm) {
  downloadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('leadEmail').value.trim();
    const consent = document.getElementById('leadConsent').checked;

    if (!email || !consent) {
      alert('Informe seu e-mail e aceite a autorização para continuar.');
      return;
    }

    try {
      const response = await fetch('/api/register-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, consent })
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar e-mail.');
      }

      window.location.href = '/download';
    } catch (error) {
      alert('Não foi possível registrar seu e-mail. Tente novamente.');
    }
  });
}
