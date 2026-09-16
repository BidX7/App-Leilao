import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararRefinoAposMedicao } from '../src/medicao.js';

test('leva pesagem real e teor confirmado ao refino, sem copiar hipótese mínima', () => {
  const pre = { pesoTotal: '7,10', pesoMetalMinimo: '4', teor: '750', kitco: '650', desconto: '0', precoVendaOuro: '650', lance: '674', custos: '50', tarifaPercentual: '6' };
  const dados = prepararRefinoAposMedicao(pre, '6,7', '750');
  assert.equal(dados.peso, '6.7');
  assert.equal(dados.teor, '750');
  assert.equal(dados.lance, '674');
  assert.equal(dados.custos, '90.44');
  assert.ok(!('pesoMetalMinimo' in dados));
  assert.throws(() => prepararRefinoAposMedicao(pre, '', '750'), /peso medido/);
  assert.throws(() => prepararRefinoAposMedicao(pre, '7,11', '750'), /peso medido/);
});
