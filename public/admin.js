const loginCard = document.getElementById('loginCard');
const editCard = document.getElementById('editCard');
const loginForm = document.getElementById('loginForm');
const editForm = document.getElementById('editForm');
const loginMessage = document.getElementById('loginMessage');
const saveMessage = document.getElementById('saveMessage');
const logoutButton = document.getElementById('logoutButton');
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.');
  return data;
}
function showEditor(show) {
  loginCard.classList.toggle('hidden', show);
  editCard.classList.toggle('hidden', !show);
}
async function loadContentToForm() {
  const data = await api('/api/content');
  for (const [key, value] of Object.entries(data)) {
    const field = editForm.elements[key];
    if (field) field.value = value;
  }
}
async function checkSession() {
  try {
    await api('/api/admin/check');
    showEditor(true);
    await loadContentToForm();
  } catch { showEditor(false); }
}
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Verificando...';
  try {
    await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password: document.getElementById('password').value })
    });
    loginMessage.textContent = '';
    showEditor(true);
    await loadContentToForm();
  } catch (error) { loginMessage.textContent = error.message; }
});
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  saveMessage.textContent = 'Salvando...';
  const payload = Object.fromEntries(new FormData(editForm).entries());
  try {
    await api('/api/content', { method: 'PUT', body: JSON.stringify(payload) });
    saveMessage.textContent = 'Alterações salvas com sucesso.';
  } catch (error) { saveMessage.textContent = error.message; }
});
logoutButton.addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' });
  showEditor(false);
});
checkSession();
