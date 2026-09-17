import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararRefinoAposMedicao } from '../src/medicao.js';
import { analisarPreLance } from '../src/prelance.js';
import { analisarRefino3M } from '../src/auction.js';

test('leva pesagem real e teor confirmado ao refino, sem copiar hipótese mínima', () => {
  const pre = { pesoTotal: '7,10', pesoMetalMinimo: '4', teor: '750', precoVendaOuro: '650', lance: '674', custos: '50', tarifaPercentual: '6' };
  const dados = prepararRefinoAposMedicao(pre, '6,7', '750');
  assert.equal(dados.peso, '6.7');
  assert.equal(dados.teor, '750');
  assert.equal(dados.lance, '674');
  assert.equal(dados.custos, '90.44');
  assert.ok(!('pesoMetalMinimo' in dados));
  assert.ok(!('kitco' in dados));
  assert.ok(!('taxaRefinoPercentual' in dados));
  assert.throws(() => prepararRefinoAposMedicao(pre, '', '750'), /peso medido/);
  assert.throws(() => prepararRefinoAposMedicao(pre, '7,11', '750'), /peso medido/);
});

test('compara o pré-lance sem refinadora e o refino percentual após medição', () => {
  const pre = { pesoTotal: '2,29', pesoMetalMinimo: '1,90', teor: '750', precoVendaOuro: '500', lance: '148', custos: '0', tarifaPercentual: '6' };
  const negociacao = analisarPreLance(pre);
  const medicao = prepararRefinoAposMedicao(pre, '1,90', '750');
  const refino = analisarRefino3M({ ...medicao, amostra: '0', kitco: '650', desconto: '0',
    taxaRefinoPercentual: '3', pesoPrata: '0', precoPrata: '0' });
  assert.equal(negociacao.lucro, 555.62);
  assert.equal(negociacao.refino, undefined);
  assert.equal(medicao.custos, '8.88');
  assert.equal(refino.gramasTaxaOuro, 0.04);
  assert.equal(refino.custoRefinoOuro, 26);
  assert.equal(refino.lucro, 532.12);
});
