// Testa o envio de eventos ao FlowPilot com um servidor local falso.
// Uso (a partir da pasta do projeto): node --test test/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mascararTelefone, notificarFlowPilot } from '../notificador.mjs';

function servidorFalso(recebidos) {
  return new Promise((resolve) => {
    const servidor = createServer((req, res) => {
      let corpo = '';
      req.on('data', (parte) => (corpo += parte));
      req.on('end', () => {
        recebidos.push({ metodo: req.method, tipo: req.headers['content-type'], corpo: JSON.parse(corpo) });
        res.writeHead(200).end('ok');
      });
    });
    servidor.listen(0, '127.0.0.1', () => resolve(servidor));
  });
}

test('mascara telefone no mesmo formato dos exemplos', () => {
  assert.equal(mascararTelefone('5511987651234'), '5511*****1234');
  assert.equal(mascararTelefone(undefined), '*****');
});

test('envia evento em JSON por POST e devolve true', async () => {
  const recebidos = [];
  const servidor = await servidorFalso(recebidos);
  const url = `http://127.0.0.1:${servidor.address().port}/webhook`;
  try {
    const ok = await notificarFlowPilot('pedido_registrado', { protocolo: 'CF-1', modelo: 'X1' }, url);
    assert.equal(ok, true);
    assert.equal(recebidos.length, 1);
    assert.equal(recebidos[0].metodo, 'POST');
    assert.equal(recebidos[0].tipo, 'application/json');
    assert.deepEqual(recebidos[0].corpo, { evento: 'pedido_registrado', protocolo: 'CF-1', modelo: 'X1' });
  } finally {
    servidor.close();
  }
});

test('sem URL configurada, não envia nada', async () => {
  const ok = await notificarFlowPilot('horario_reservado', { protocolo: 'CF-2' }, null);
  assert.equal(ok, false);
});

test('falha de conexão não lança erro', async () => {
  const ok = await notificarFlowPilot('pedido_registrado', {}, 'http://127.0.0.1:9/webhook');
  assert.equal(ok, false);
});
