import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairDadosLote, normalizarNumeroLote } from '../src/caixa.js';

test('importa peso TOTAL e lance do lote publicado sem inventar teor ou liga', () => {
  const texto = 'Descrição: QUATRO BRINCOS, UM COLAR, DE: OURO; CONTÉM: pedras; PESO LOTE: 3,80G\nValor do lance mínimo: R$1.129,00\nNúmero do lote: 0041.000257-7';
  assert.deepEqual(extrairDadosLote(texto, '0041.000257-7'), {
    numero: '0041.000257-7', pesoTotal: 3.8, lanceMinimo: 1129,
    descricao: 'QUATRO BRINCOS, UM COLAR, DE: OURO; CONTÉM: pedras; PESO LOTE: 3,80G'
  });
});
test('recusa lote diferente, formato inválido e ausência de peso', () => {
  assert.throws(() => normalizarNumeroLote('123'), /número completo/);
  assert.throws(() => extrairDadosLote('Número do lote: 0041.000020-5', '0041.000257-7'), /não contém/);
  assert.throws(() => extrairDadosLote('Número do lote: 0041.000257-7\nValor do lance mínimo: R$100,00', '0041.000257-7'), /não foram encontrados/);
});
