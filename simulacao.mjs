// Simula uma conversa de WhatsApp pelo webhook, sem chamar a API da Meta.
// Cada mensagem é enviada como o WhatsApp enviaria: JSON assinado com HMAC-SHA256.
// Gera docs/conversa-whatsapp.svg com a conversa desenhada em estilo WhatsApp.
// Rode com: node simulacao.mjs
import { createHmac } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { criarServidor } from './whatsapp.mjs';

const segredo = 'segredo-de-simulacao';
const verificacao = 'verificacao-de-simulacao';
const numeroId = '100000000000001';
const versao = 'v25.0';
const cliente = '5511900000001';
const saida = new URL('./docs/conversa-whatsapp.svg', import.meta.url);

const conversa = [];
const respostasDoBot = [];
async function enviarSimulado(url, opcoes) {
  const corpo = JSON.parse(opcoes.body);
  respostasDoBot.push(corpo.text.body);
  conversa.push({ de: 'bot', texto: corpo.text.body });
  return { ok: true, status: 200 };
}

const roteiro = [
  'Oi',
  '1',
  'Galaxy A54',
  '1',
  'A tela trincou depois que o celular caiu no chão',
  '1',
  '2',
  '{protocolo}',
];

function montarEvento(id, texto) {
  return JSON.stringify({
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: numeroId },
          messages: [{ id, from: cliente, type: 'text', text: { body: texto } }],
        },
      }],
    }],
  });
}

async function enviarEvento(servidor, id, texto) {
  const corpo = montarEvento(id, texto);
  const assinatura = 'sha256=' + createHmac('sha256', segredo).update(corpo).digest('hex');
  const resposta = await fetch(`http://localhost:${servidor.address().port}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': assinatura },
    body: corpo,
  });
  if (resposta.status !== 200) throw new Error(`Webhook recusou o evento (HTTP ${resposta.status})`);
}

// Desenha a conversa em SVG, com balões no estilo do WhatsApp.
const escapar = (texto) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function quebrarLinhas(texto, limite = 42) {
  const linhas = [];
  for (const paragrafo of texto.split('\n')) {
    let atual = '';
    for (const palavra of paragrafo.split(' ')) {
      if ((atual + ' ' + palavra).trim().length > limite) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = (atual + ' ' + palavra).trim();
      }
    }
    linhas.push(atual);
  }
  return linhas;
}

function renderizarSvg(mensagens) {
  const largura = 460;
  const alturaLinha = 20;
  const cabecalho = 64;
  let y = cabecalho + 16;
  const blocos = [];

  for (const { de, texto } of mensagens) {
    const linhas = quebrarLinhas(texto);
    const altura = linhas.length * alturaLinha + 22;
    const doCliente = de === 'cliente';
    const x = doCliente ? largura - 16 - 340 : 16;
    const cor = doCliente ? '#DCF8C6' : '#FFFFFF';
    const textos = linhas
      .map((linha, i) => `<tspan x="${x + 12}" dy="${i === 0 ? 0 : alturaLinha}">${escapar(linha)}</tspan>`)
      .join('');
    blocos.push(
      `<rect x="${x}" y="${y}" width="340" height="${altura}" rx="10" fill="${cor}"/>` +
      `<text y="${y + 20}" font-size="14" fill="#111B21">${textos}</text>`,
    );
    y += altura + 10;
  }

  const alturaTotal = y + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${alturaTotal}" viewBox="0 0 ${largura} ${alturaTotal}" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect width="${largura}" height="${alturaTotal}" fill="#ECE5DD"/>
  <rect width="${largura}" height="${cabecalho}" fill="#075E54"/>
  <circle cx="36" cy="32" r="20" fill="#25D366"/>
  <text x="36" y="38" text-anchor="middle" font-size="16" font-weight="700" fill="#FFFFFF">CF</text>
  <text x="66" y="28" font-size="16" font-weight="700" fill="#FFFFFF">Conserta Fácil</text>
  <text x="66" y="46" font-size="12" fill="#B2DFDB">online</text>
  ${blocos.join('\n  ')}
</svg>
`;
}

const servidor = criarServidor({ token: 'token-simulado', segredo, verificacao, numeroId, versao, enviar: enviarSimulado });
await new Promise((resolver) => servidor.listen(0, resolver));
try {
  for (const [indice, modelo] of roteiro.entries()) {
    const antes = respostasDoBot.length;
    const protocolo = respostasDoBot.join('\n').match(/Protocolo: (\d+)/)?.[1];
    const texto = modelo === '{protocolo}' ? protocolo : modelo;
    conversa.push({ de: 'cliente', texto });
    console.log(`\nCliente: ${texto}`);
    await enviarEvento(servidor, `wamid.simulado.${indice}`, texto);
    const resposta = respostasDoBot[antes];
    console.log(`Bot:\n${resposta ?? '(sem resposta)'}`);
  }
} finally {
  servidor.close();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeFile(saida, renderizarSvg(conversa), 'utf8');
  console.log(`\nImagem gerada em docs/conversa-whatsapp.svg`);
}
