import { access, mkdir, writeFile } from 'node:fs/promises';

export const infoLoja = 'Conserta Fácil — demonstração\nReferência no mapa: Rua Vergueiro, 1000, São Paulo – SP (Centro Cultural São Paulo).\nHorário fictício da assistência: segunda a sexta, das 9h às 18h.';

const agenda = new URL('./agenda-demo/', import.meta.url);
const fuso = 'America/Sao_Paulo';
const horas = ['10:00', '14:00', '16:00'];
const dataLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: fuso });
const diaSemana = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' });

function arquivo(horario) {
  return new URL(horario.replace(':', '-') + '.json', agenda);
}

export function exibirHorario(horario) {
  const [dia, hora] = horario.split('T');
  return `${dia.split('-').reverse().join('/')} às ${hora}`;
}

export async function listarHorarios() {
  const hoje = Date.parse(dataLocal.format(new Date()) + 'T00:00:00Z');
  const livres = [];
  for (let dias = 1; dias <= 7 && livres.length < 3; dias++) {
    const data = new Date(hoje + dias * 86_400_000);
    if (['Sat', 'Sun'].includes(diaSemana.format(data))) continue;
    for (const hora of horas) {
      const horario = data.toISOString().slice(0, 10) + 'T' + hora;
      try {
        await access(arquivo(horario));
      } catch (erro) {
        if (erro.code !== 'ENOENT') throw erro;
        livres.push(horario);
        if (livres.length === 3) break;
      }
    }
  }
  return livres;
}

export async function reservar(horario, protocolo) {
  if (Date.parse(horario + ':00-03:00') <= Date.now()) return false;
  await mkdir(agenda, { recursive: true });
  try {
    await writeFile(arquivo(horario), JSON.stringify({ horario, protocolo }) + '\n', { flag: 'wx' });
    return true;
  } catch (erro) {
    if (erro.code === 'EEXIST') return false;
    throw erro;
  }
}
