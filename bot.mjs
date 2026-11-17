import { appendFile, readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomInt } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { interpretarOrcamento } from './triagem.mjs';
import { exibirHorario, infoLoja, listarHorarios, reservar } from './operacao.mjs';

const pedidos = new URL('./pedidos.jsonl', import.meta.url);
const voltar = 'Digite menu para voltar ao menu inicial.';
const inicio = { etapa: 'menu' };
const menu = [
  '1. Solicitar orçamento',
  '2. Acompanhar reparo',
  '3. Agendar entrega do aparelho',
  '4. Endereço e horário',
  '5. Falar com a equipe',
  '0. Sair',
  'Digite uma opção ou conte o problema do celular.',
  voltar,
].join('\n');
const statusPedido = {
  aguardando_avaliacao: 'Aguardando avaliação',
  em_diagnostico: 'Em diagnóstico',
  aguardando_peca: 'Aguardando peça',
  pronto: 'Pronto para retirada',
};

async function lerPedidos() {
  try {
    const conteudo = await readFile(pedidos, 'utf8');
    return conteudo.split('\n').filter((linha) => linha.trim()).map((linha) => JSON.parse(linha));
  } catch (erro) {
    if (erro.code === 'ENOENT') return [];
    throw erro;
  }
}

function gerarProtocolo() {
  return String(randomInt(10_000_000, 100_000_000));
}

let gravacao = Promise.resolve();
function registrarPedido(dados, cliente) {
  const operacao = gravacao.then(async () => {
    const existentes = new Set((await lerPedidos()).map((pedido) => String(pedido.protocolo)));
    let protocolo;
    do {
      protocolo = gerarProtocolo();
    } while (existentes.has(protocolo));
    const registro = { protocolo, criadoEm: new Date().toISOString(), status: 'aguardando_avaliacao', ...dados };
    if (cliente) registro.cliente = cliente;
    await appendFile(pedidos, JSON.stringify(registro) + '\n', 'utf8');
    return protocolo;
  });
  gravacao = operacao.catch(() => {});
  return operacao;
}
const defeitos = {
  1: 'Tela ou toque',
  2: 'Bateria ou carregamento',
  3: 'Contato com líquido',
  4: 'Outro problema',
};

function normalizar(mensagem) {
  return mensagem.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function resumir(pedido) {
  return [
    `Modelo: ${pedido.modelo}`,
    `Tipo de problema: ${pedido.defeito}`,
    `Descrição: ${pedido.descricao}`,
    'A equipe precisa avaliar o aparelho para informar o valor.',
  ].join('\n');
}

function avancarOrcamento(pedido) {
  if (!pedido.modelo) {
    return { estado: { etapa: 'modelo', pedido }, resposta: 'QUAL O MODELO DO SEU CELULAR?' };
  }
  if (!pedido.defeito) {
    return {
      estado: { etapa: 'defeito', pedido },
      resposta: 'Qual é o tipo de problema?\n' +
        Object.entries(defeitos).map(([numero, nome]) => `${numero}. ${nome}`).join('\n'),
    };
  }
  if (!pedido.descricao) {
    return {
      estado: { etapa: 'descricao', pedido },
      resposta: pedido.defeito === defeitos[1]
        ? 'A tela ainda mostra imagem e responde ao toque?'
        : 'Conte brevemente o que aconteceu e o que o aparelho está fazendo agora.',
    };
  }
  return {
    estado: { etapa: 'confirmacao', pedido },
    resposta: `${resumir(pedido)}\nDigite 1 para registrar, 2 para corrigir ou 3 para cancelar.`,
  };
}

async function oferecerHorarios() {
  try {
    const horarios = await listarHorarios();
    if (horarios.length) {
      return {
        estado: { etapa: 'agenda', horarios },
        resposta: 'Escolha um horário da agenda de demonstração.\n' +
          horarios.map((horario, i) => `${i + 1}. ${exibirHorario(horario)}`).join('\n'),
      };
    }
    return { estado: inicio, resposta: `Sem horários livres nos próximos sete dias.\n${menu}` };
  } catch {
    return { estado: inicio, resposta: `Agenda indisponível. Tente novamente ou escolha 5 para falar com a equipe.\n${menu}` };
  }
}

async function responder(estado, mensagem, cliente) {
  const entrada = mensagem.trim();
  const texto = normalizar(entrada);
  if (texto === '0' || texto === 'sair') {
    return { estado: inicio, encerrar: true, resposta: 'Até logo!' };
  }
  if (texto === 'menu') {
    return { estado: { etapa: 'menu' }, resposta: menu };
  }
  if (!entrada) {
    return { estado, resposta: 'Envie uma resposta para continuar ou digite menu.' };
  }

  const pedido = estado.pedido;
  switch (estado.etapa) {
    case 'menu': {
      if (texto === '1') return avancarOrcamento({});
      if (texto === '2') {
        return { estado: { etapa: 'reparo' }, resposta: 'Digite somente o número do protocolo que você recebeu.' };
      }
      if (texto === '3') return oferecerHorarios();
      if (texto === '4') return { estado: inicio, resposta: `${infoLoja}\n\n${menu}` };
      if (texto === '5') {
        return { estado: { etapa: 'equipe' }, resposta: 'Conte brevemente o que você precisa. Vou registrar seu pedido para a equipe.' };
      }
      const dados = await interpretarOrcamento(entrada);
      if (dados) {
        return avancarOrcamento({
          modelo: dados.modelo,
          defeito: Object.hasOwn(defeitos, dados.defeito) ? defeitos[dados.defeito] : '',
          descricao: dados.descricao,
        });
      }
      if (/\b(orcamento|quanto custa|quanto fica)\b/.test(texto)) {
        return avancarOrcamento({});
      }
      return { estado, resposta: menu };
    }
    case 'reparo': {
      try {
        const pedidoEncontrado = (await lerPedidos()).find((item) =>
          String(item.protocolo) === entrada && item.cliente === cliente && item.tipo !== 'atendimento_humano');
        if (!pedidoEncontrado) {
          return { estado, resposta: 'Protocolo não encontrado. Confira o número e tente novamente.' };
        }
        const { modelo, defeito, descricao, status } = pedidoEncontrado;
        return {
          estado: inicio,
          resposta: `Protocolo: ${entrada}\nStatus: ${statusPedido[status] ?? 'Consulte a equipe'}\nModelo: ${modelo}\nTipo de problema: ${defeito}\nDescrição: ${descricao}\n\n${menu}`,
        };
      } catch {
        return { estado, resposta: 'Consulta indisponível. Tente novamente em instantes.' };
      }
    }
    case 'agenda': {
      const horario = /^[1-3]$/.test(entrada) && estado.horarios[Number(entrada) - 1];
      if (!horario) return { estado, resposta: 'Escolha um dos horários exibidos ou digite menu.' };
      return {
        estado: { etapa: 'confirmarAgenda', horario },
        resposta: `Reservar ${exibirHorario(horario)}? Digite 1 para confirmar ou 2 para cancelar.`,
      };
    }
    case 'confirmarAgenda': {
      if (entrada === '2') return { estado: inicio, resposta: `Agendamento cancelado.\n${menu}` };
      if (entrada !== '1') return { estado, resposta: 'Digite 1 para confirmar ou 2 para cancelar.' };
      const protocolo = gerarProtocolo();
      try {
        if (!(await reservar(estado.horario, protocolo))) return oferecerHorarios();
        return { estado: inicio, resposta: `Reserva confirmada para ${exibirHorario(estado.horario)}. Protocolo: ${protocolo}\n${menu}` };
      } catch {
        return { estado, resposta: 'Não consegui salvar a reserva. Digite 1 para tentar novamente ou 2 para cancelar.' };
      }
    }
    case 'equipe':
      return {
        estado: { etapa: 'confirmarEquipe', assunto: entrada },
        resposta: `Resumo para a equipe: ${entrada}\nDigite 1 para registrar ou 2 para cancelar.`,
      };
    case 'confirmarEquipe':
      if (entrada === '1') {
        return {
          estado: inicio,
          pedidoParaRegistrar: { tipo: 'atendimento_humano', status: 'aguardando_equipe', assunto: estado.assunto },
          mensagemRegistro: 'Solicitação de atendimento registrada',
        };
      }
      if (entrada === '2') return { estado: inicio, resposta: `Solicitação cancelada.\n${menu}` };
      return { estado, resposta: 'Digite 1 para registrar ou 2 para cancelar.' };
    case 'modelo':
      return avancarOrcamento({ ...pedido, modelo: entrada });
    case 'defeito': {
      const defeito = Object.hasOwn(defeitos, entrada) && defeitos[entrada];
      if (!defeito) {
        return { estado, resposta: 'Escolha uma opção de 1 a 4.' };
      }
      return avancarOrcamento({ ...pedido, defeito });
    }
    case 'descricao':
      return avancarOrcamento({ ...pedido, descricao: entrada });
    case 'confirmacao':
      if (entrada === '1') {
        return { estado: { etapa: 'menu' }, pedidoParaRegistrar: pedido };
      }
      if (entrada === '2') {
        return avancarOrcamento({});
      }
      if (entrada === '3') {
        return { estado: { etapa: 'menu' }, resposta: `Pedido cancelado. ${menu}` };
      }
      return { estado, resposta: 'Digite 1 para registrar, 2 para corrigir ou 3 para cancelar.' };
  }
}

export async function processarMensagem(estado = inicio, mensagem, cliente) {
  const resultado = await responder(estado, mensagem, cliente);
  if (resultado.pedidoParaRegistrar) {
    try {
      const protocolo = await registrarPedido(resultado.pedidoParaRegistrar, cliente);
      return {
        estado: resultado.estado,
        resposta: `${resultado.mensagemRegistro ?? 'Pedido registrado para avaliação'}. Protocolo: ${protocolo}\n${menu}`,
      };
    } catch {
      return { estado, resposta: `Não consegui salvar o pedido. Digite 1 para tentar novamente.\n${voltar}` };
    }
  }
  if (!resultado.resposta.endsWith(voltar)) resultado.resposta += '\n' + voltar;
  return resultado;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const terminal = createInterface({ input: stdin, output: stdout });
  let estado = inicio;
  stdout.write(`Olá! Sou o assistente da Conserta Fácil.\n${menu}\n`);
  try {
    for await (const mensagem of terminal) {
      const resultado = await processarMensagem(estado, mensagem);
      stdout.write(resultado.resposta + '\n');
      if (resultado.encerrar) break;
      estado = resultado.estado;
    }
  } finally {
    terminal.close();
  }
}
