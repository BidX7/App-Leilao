import test from 'node:test';
import assert from 'node:assert/strict';
import { analisarPreLance } from '../src/prelance.js';
import { LOTES_2018 } from '../src/historico.js';

test('lotes oficiais cruzados preservam valor mínimo, lance e tarifa distintos', () => {
  assert.equal(LOTES_2018.length, 3);
  for (const lote of LOTES_2018) {
    assert.match(lote.numero, /^\d{4}\.\d{6}-\d$/);
    assert.ok(lote.lanceVencedor >= lote.minimo);
    assert.ok(Math.abs(lote.tarifa / lote.lanceVencedor - 0.06) < 0.00001);
    assert.ok(!('pesoMetalMinimo' in lote));
  }
});
test('calcula teto com tarifa de 6%, 3% de refino e 15% de ROI, condicionado à hipótese', () => {
  const campos = { pesoTotal: '10', pesoMetalMinimo: '8', teor: '750', kitco: '650', desconto: '0', precoVendaOuro: '650', lance: '2900', custos: '100', tarifaPercentual: '6' };
  const resultado = analisarPreLance(campos);
  assert.equal(resultado.ouroFino, 6);
  assert.equal(resultado.refino, 117);
  assert.equal(resultado.tarifa, 174);
  assert.ok(Math.abs(resultado.lanceMaximo - (3900 / 1.15 - 217) / 1.06) < 0.001);
  assert.equal(resultado.viavelNaHipotese, true);
});
test('não permite inferir lance seguro sem hipótese mínima explícita', () => {
  const campos = { pesoTotal: '7,10', pesoMetalMinimo: '', teor: '750', kitco: '650', desconto: '0', precoVendaOuro: '650', lance: '674', custos: '0', tarifaPercentual: '6' };
  assert.throws(() => analisarPreLance(campos), /Preencha todos/);
  assert.throws(() => analisarPreLance({ ...campos, pesoMetalMinimo: '7,11' }), /não superar/);
  assert.equal(analisarPreLance({ ...campos, pesoMetalMinimo: '0,1' }).viavelNaHipotese, false);
});
