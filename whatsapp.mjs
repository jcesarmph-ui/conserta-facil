import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { processarMensagem } from './bot.mjs';

export function criarServidor({ token, segredo, verificacao, numeroId, versao, enviar = fetch }) {
  const conversas = new Map();
  const entregas = new Map();
  const filas = new Map();

  async function responderMensagem(mensagem) {
    const cliente = mensagem.from_user_id || mensagem.from;
    const destino = mensagem.from || mensagem.from_user_id;
    if (!cliente || !mensagem.id) return;

    const anterior = filas.get(cliente) ?? Promise.resolve();
    const atual = anterior.catch(() => {}).then(async () => {
      let entrega = entregas.get(mensagem.id);
      if (entrega?.enviada) return;
      if (!entrega) {
        const texto = mensagem.type === 'text' ? mensagem.text?.body : null;
        if (typeof texto === 'string') {
          const resultado = await processarMensagem(conversas.get(cliente), texto, cliente);
          conversas.set(cliente, resultado.estado);
          entrega = { texto: resultado.resposta };
        } else {
          entrega = { texto: 'Envie uma mensagem de texto. Digite menu para voltar ao menu inicial.' };
        }
        entregas.set(mensagem.id, entrega);
        if (entregas.size > 5000) entregas.delete(entregas.keys().next().value);
      }

      const corpo = { messaging_product: 'whatsapp', type: 'text', text: { body: entrega.texto } };
      if (mensagem.from) corpo.to = destino;
      else corpo.recipient = destino;
      const resposta = await enviar(`https://graph.facebook.com/${versao}/${numeroId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(8000),
      });
      if (!resposta.ok) throw new Error(`Falha de envio da Meta (HTTP ${resposta.status})`);
      entrega.enviada = true;
    });
    filas.set(cliente, atual);
    try {
      await atual;
    } finally {
      if (filas.get(cliente) === atual) filas.delete(cliente);
    }
  }

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const finalizar = (status, texto = '') => res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(texto);
    if (url.pathname !== '/webhook') return finalizar(404);
    if (req.method === 'GET') {
      const { searchParams } = url;
      const desafio = searchParams.get('hub.challenge');
      if (searchParams.get('hub.mode') !== 'subscribe' || searchParams.get('hub.verify_token') !== verificacao || !desafio) {
        return finalizar(403);
      }
      return finalizar(200, desafio);
    }
    if (req.method !== 'POST') return finalizar(405);

    try {
      const partes = [];
      let tamanho = 0;
      for await (const parte of req) {
        tamanho += parte.length;
        if (tamanho > 1024 * 1024) return finalizar(413);
        partes.push(parte);
      }
      const corpo = Buffer.concat(partes);
      const assinatura = req.headers['x-hub-signature-256'];
      if (typeof assinatura !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(assinatura)) return finalizar(403);
      const esperada = createHmac('sha256', segredo).update(corpo).digest();
      if (!timingSafeEqual(esperada, Buffer.from(assinatura.slice(7), 'hex'))) return finalizar(403);

      let evento;
      try {
        evento = JSON.parse(corpo);
      } catch {
        return finalizar(400);
      }
      for (const entrada of evento?.entry ?? []) {
        for (const { field, value } of entrada.changes ?? []) {
          if (field !== 'messages' || value?.metadata?.phone_number_id !== numeroId) continue;
          for (const mensagem of value.messages ?? []) await responderMensagem(mensagem);
        }
      }
      return finalizar(200);
    } catch (erro) {
      console.error(erro.message);
      return finalizar(500);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { META_ACCESS_TOKEN, META_APP_SECRET, META_VERIFY_TOKEN, META_PHONE_NUMBER_ID, META_GRAPH_VERSION, PORT = '3000' } = process.env;
  if (!META_ACCESS_TOKEN || !META_APP_SECRET || !META_VERIFY_TOKEN ||
      !/^\d+$/.test(META_PHONE_NUMBER_ID ?? '') || !/^v\d+\.\d+$/.test(META_GRAPH_VERSION ?? '')) {
    console.error('Preencha as configurações da Meta conforme o guia WHATSAPP.md.');
    process.exitCode = 1;
  } else {
    criarServidor({
      token: META_ACCESS_TOKEN, segredo: META_APP_SECRET, verificacao: META_VERIFY_TOKEN,
      numeroId: META_PHONE_NUMBER_ID, versao: META_GRAPH_VERSION,
    }).listen(Number(PORT), '0.0.0.0', () => console.log(`Webhook pronto em /webhook na porta ${PORT}.`));
  }
}
