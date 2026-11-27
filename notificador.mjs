// Envia eventos do Conserta Fácil ao webhook do FlowPilot (n8n).
//
// Configuração: variável N8N_WEBHOOK_URL no .env (ex.: a URL do webhook do n8n).
// Se a variável não existir, nada é enviado.
//
// Nunca lança erro: uma falha no envio é registrada no console,
// mas não pode interromper a conversa com o cliente.

const tempoLimiteMs = 5_000;

// Mesmo formato dos exemplos do FlowPilot: 4 primeiros dígitos, asteriscos, 4 últimos.
export function mascararTelefone(numero) {
  const texto = String(numero ?? '');
  if (texto.length < 8) return '*****';
  return texto.slice(0, 4) + '*****' + texto.slice(-4);
}

export async function notificarFlowPilot(evento, dados, url = process.env.N8N_WEBHOOK_URL) {
  if (!url) return false;
  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento, ...dados }),
      signal: AbortSignal.timeout(tempoLimiteMs),
    });
    if (!resposta.ok) console.error(`FlowPilot recusou ${evento} (HTTP ${resposta.status}).`);
    return resposta.ok;
  } catch (erro) {
    console.error(`Não consegui enviar ${evento} ao FlowPilot: ${erro.message}`);
    return false;
  }
}
