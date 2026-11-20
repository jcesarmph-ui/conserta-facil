// Simula uma conversa de WhatsApp pelo webhook, sem chamar a API da Meta.
// Cada mensagem é enviada como o WhatsApp enviaria: JSON assinado com HMAC-SHA256.
// Rode com: node simulacao.mjs
import { createHmac } from 'node:crypto';
import { criarServidor } from './whatsapp.mjs';

const segredo = 'segredo-de-simulacao';
const verificacao = 'verificacao-de-simulacao';
const numeroId = '100000000000001';
const versao = 'v25.0';
const cliente = '5511900000001';

const respostasDoBot = [];
async function enviarSimulado(url, opcoes) {
  const corpo = JSON.parse(opcoes.body);
  respostasDoBot.push(corpo.text.body);
  return { ok: true, status: 200 };
}

const servidor = criarServidor({ token: 'token-simulado', segredo, verificacao, numeroId, versao, enviar: enviarSimulado });

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

async function enviarEvento(id, texto) {
  const corpo = montarEvento(id, texto);
  const assinatura = 'sha256=' + createHmac('sha256', segredo).update(corpo).digest('hex');
  const resposta = await fetch(`http://localhost:${servidor.address().port}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': assinatura },
    body: corpo,
  });
  if (resposta.status !== 200) throw new Error(`Webhook recusou o evento (HTTP ${resposta.status})`);
}

await new Promise((resolver) => servidor.listen(0, resolver));
try {
  for (const [indice, modelo] of roteiro.entries()) {
    const antes = respostasDoBot.length;
    const protocolo = respostasDoBot.join('\n').match(/Protocolo: (\d+)/)?.[1];
    const texto = modelo === '{protocolo}' ? protocolo : modelo;
    console.log(`\nCliente: ${texto}`);
    await enviarEvento(`wamid.simulado.${indice}`, texto);
    const resposta = respostasDoBot[antes];
    console.log(`Bot:\n${resposta ?? '(sem resposta)'}`);
  }
} finally {
  servidor.close();
}
