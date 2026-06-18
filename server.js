const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const COOKIE_NAME = 'victor_admin_token';
const DATA_PATH = path.join(__dirname, 'data', 'content.json');

const sessions = new Set();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || '';
  const found = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`));

  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

function requireAdmin(req, res, next) {
  const token = getCookie(req, COOKIE_NAME);

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }

  next();
}

function readContent() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (error) {
    return {};
  }
}

function writeContent(content) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2));
}

function sanitizeContent(input) {
  const current = readContent();

  const allowed = [
    'title',
    'subtitle',
    'description',
    'highlight',
    'author',
    'role',
    'instagram',
    'instagramUrl',
    'downloadButton',
    'secondaryButton',
    'pages',
    'version',
    'footerNote',
    'downloadFileName'
  ];

  const out = { ...current };

  for (const key of allowed) {
    if (typeof input[key] === 'string') {
      out[key] = input[key].trim().slice(0, key === 'description' ? 800 : 220);
    }
  }

  return out;
}

// Arquivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página oculta de edição
app.get('/admin-victor-supply', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-victor-supply/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/download', (req, res) => {
  const filePath = path.join(
    __dirname,
    'public',
    'assets',
    'EBOOK-DESVENDANDO-A-SUPPLY-CHAIN-1.0.pdf'
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo PDF não encontrado.');
  }

  res.download(filePath, 'EBOOK DESVENDANDO A SUPPLY CHAIN 1.0.pdf');
});
app.post('/api/register-download', async (req, res) => {
  const { email, consent } = req.body;

  if (!email || !consent) {
    return res.status(400).json({
      error: 'E-mail e consentimento são obrigatórios.'
    });
  }

  try {
    const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        consent
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar e-mail na planilha.');
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao salvar e-mail.'
    });
  }
});
// APIs
app.get('/api/content', (req, res) => {
  res.json(readContent());
});

app.post('/api/login', (req, res) => {
  const password = String(req.body?.password || '');

  const a = Buffer.from(hash(password));
  const b = Buffer.from(hash(ADMIN_PASSWORD));

  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    return res.status(403).json({ error: 'Senha inválida.' });
  }

  const token = makeToken();
  sessions.add(token);

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}`
  );

  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const token = getCookie(req, COOKIE_NAME);

  if (token) sessions.delete(token);

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
  );

  res.json({ ok: true });
});

app.get('/api/admin/check', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.put('/api/content', requireAdmin, (req, res) => {
  const updated = sanitizeContent(req.body || {});
  writeContent(updated);
  res.json({ ok: true, content: updated });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
