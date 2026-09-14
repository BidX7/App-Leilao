import test from 'node:test';
import assert from 'node:assert/strict';
import { analisarLote, formatarReal, parseNumero } from '../src/auction.js';

test('aceita vírgula decimal e formato brasileiro', () => {
  assert.equal(parseNumero('10,5'), 10.5);
  assert.equal(parseNumero('1.234,56'), 1234.56);
});

test('calcula o cenário padrão e recomenda comprar', () => {
  const r = analisarLote({ peso: '10', teor: '750', cotacao: '650', lance: '3500', custos: '200' });
  assert.equal(r.ouroFino, 7.5);
  assert.equal(r.valor, 4777.5);
  assert.equal(r.decisao, 'COMPRAR');
  assert.ok(r.roi >= 15);
});

test('classifica cuidado e não comprar', () => {
  assert.equal(analisarLote({ peso: 10, teor: 750, cotacao: 650, lance: 4300, custos: 200 }).decisao, 'CUIDADO');
  assert.equal(analisarLote({ peso: 10, teor: 750, cotacao: 650, lance: 4800, custos: 200 }).decisao, 'NÃO COMPRAR');
});

test('rejeita valores inválidos', () => {
  assert.throws(() => analisarLote({ peso: '', teor: 750, cotacao: 650, lance: 1, custos: 0 }), /números válidos/);
  assert.throws(() => analisarLote({ peso: 10, teor: 1200, cotacao: 650, lance: 1, custos: 0 }), /teor/);
  assert.throws(() => analisarLote({ peso: 10, teor: 750, cotacao: 650, lance: -1, custos: 0 }), /negativos/);
});

test('formata valores em reais', () => assert.match(formatarReal(1234.56), /1\.234,56/));
