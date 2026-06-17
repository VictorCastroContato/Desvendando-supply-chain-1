# Desvendando a Supply Chain - Web App

Página web profissional e minimalista para divulgação do ebook **Desvendando a Supply Chain**, com botão de download, contato do Instagram e uma rota oculta de edição protegida por senha.

## Como rodar localmente

1. Instale o Node.js 18 ou superior.
2. Abra a pasta do projeto.
3. Rode:

```bash
npm install
ADMIN_PASSWORD="sua-senha-forte" SESSION_SECRET="um-segredo-longo" npm start
```

Acesse:

- Página pública: `http://localhost:3000`
- Página oculta de edição: `http://localhost:3000/admin-victor-supply`

## Como publicar e ter um URL curto

Hospede este projeto em uma plataforma que rode Node.js, como Render, Railway, Fly.io ou similar. Ao publicar, escolha um nome curto para o projeto, por exemplo:

`desvendando-sc`

Assim a página pode ficar com uma URL curta parecida com:

`https://desvendando-sc.onrender.com`

Depois, coloque esse link na bio do Instagram ou encurte em uma ferramenta como Bitly, TinyURL ou outro encurtador de sua preferência.

## Segurança da edição

A página pública não mostra link para edição. A edição fica na rota oculta:

`/admin-victor-supply`

A alteração dos dados exige senha no servidor. Antes de publicar, configure as variáveis de ambiente:

- `ADMIN_PASSWORD`: sua senha forte de administrador.
- `SESSION_SECRET`: uma frase longa e aleatória para assinar o acesso.
- `NODE_ENV=production`

Não use a senha padrão em ambiente publicado.

## Trocar ebook ou capa

Substitua os arquivos mantendo os nomes:

- PDF: `public/assets/EBOOK-DESVENDANDO-A-SUPPLY-CHAIN-1.0.pdf`
- Capa: `public/assets/cover.webp`

## Observação importante

Em hospedagens sem banco de dados, as alterações feitas pelo painel podem não persistir após reinicializações ou novo deploy. Para uso profissional permanente, o ideal é conectar o painel a um banco simples, como Firebase, Supabase ou outro serviço de dados.
