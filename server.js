const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'troque-esta-senha';
const SESSION_SECRET = process.env.SESSION_SECRET || 'troque-este-segredo';
const COOKIE_NAME = 'dsc_admin';
const DATA_PATH = path.join(__dirname, 'data', 'content.json');
const PDF_PATH = path.join(__dirname, 'public', 'assets', 'EBOOK-DESVENDANDO-A-SUPPLY-CHAIN-1.0.pdf');

app.disable('x-powered-by');
app.use(express.json({ limit: '250kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

function readContent() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeContent(content) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2), 'utf8');
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const cookies = {};
  for (const part of header.split(';').filter(Boolean)) {
    const idx = part.indexOf('=');
    if (idx > -1) cookies[decodeURIComponent(part.slice(0, idx).trim())] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return cookies;
}

function makeToken() {
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(`admin:${ts}`).digest('hex');
  return `${ts}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return false;
  const [ts, sig] = token.split('.');
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > 24 * 60 * 60 * 1000) return false;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`admin:${ts}`).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  if (!verifyToken(cookies[COOKIE_NAME])) return res.status(401).json({ error: 'Acesso não autorizado.' });
  next();
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sanitizeContent(input) {
  const current = readContent();
  const allowed = [
    'title', 'subtitle', 'description', 'highlight', 'author', 'role', 'instagram',
    'instagramUrl', 'downloadButton', 'secondaryButton', 'pages', 'version',
    'footerNote', 'downloadFileName'
  ];
  const out = { ...current };
  for (const key of allowed) {
    if (typeof input[key] === 'string') out[key] = input[key].trim().slice(0, key === 'description' ? 800 : 220);
  }
  return out;
}

app.get('/api/content', (req, res) => res.json(readContent()));

app.post('/api/login', (req, res) => {
  const password = String(req.body?.password || '');
  const a = Buffer.from(hash(password));
  const b = Buffer.from(hash(ADMIN_PASSWORD));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(403).json({ error: 'Senha inválida.' });
  const token = makeToken();
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}`);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/admin/check', requireAdmin, (req, res) => res.json({ ok: true }));

app.put('/api/content', requireAdmin, (req, res) => {
  const updated = sanitizeContent(req.body || {});
  writeContent(updated);
  res.json({ ok: true, content: updated });
});

app.get('/download', (req, res) => {
  const content = readContent();
  const filename = content.downloadFileName || 'EBOOK-DESVENDANDO-A-SUPPLY-CHAIN-1.0.pdf';
  res.download(PDF_PATH, filename);
});

app.get('/admin-victor-supply', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App rodando em http://localhost:${PORT}`);
  if (ADMIN_PASSWORD === 'troque-esta-senha') console.warn('ATENÇÃO: defina ADMIN_PASSWORD no ambiente antes de publicar.');
});
