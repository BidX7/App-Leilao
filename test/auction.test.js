import test from 'node:test';
import assert from 'node:assert/strict';
import { analisarLote, analisarRefino3M, formatarReal, parseNumero } from '../src/auction.js';

const simulacao3M = {
  peso: '235', amostra: '1,1', teor: '750', kitco: '742,60', desconto: '100', taxaRefinoPercentual: '3',
  pesoPrata: '10', precoPrata: '12,68', precoVendaOuro: '680', lance: '100000', custos: '0'
};

test('aceita vírgula decimal e formato brasileiro', () => {
  assert.equal(parseNumero('10,5'), 10.5);
  assert.equal(parseNumero('1.234,56'), 1234.56);
  assert.equal(parseNumero('100.000'), 100000);
  assert.equal(parseNumero('742.60'), 742.6);
});

test('rejeita notação científica e formato estrangeiro ambíguo', () => {
  assert.ok(Number.isNaN(parseNumero('1e3')));
  assert.ok(Number.isNaN(parseNumero('1,234.56')));
  assert.ok(Number.isNaN(parseNumero('1,2,3')));
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

test('rejeita resultados que excedem a capacidade numérica', () => {
  assert.throws(
    () => analisarLote({ peso: '9'.repeat(308), teor: 1000, cotacao: '9'.repeat(308), lance: 0, custos: 0 }),
    /grandes demais/
  );
});

test('preserva os limites de teor e o cálculo da margem mínima de 15%', () => {
  assert.doesNotThrow(() => analisarLote({ peso: 10, teor: 1, cotacao: 650, lance: 1, custos: 0 }));
  assert.doesNotThrow(() => analisarLote({ peso: 10, teor: 1000, cotacao: 650, lance: 1, custos: 0 }));

  const base = analisarLote({ peso: 10, teor: 750, cotacao: 650, lance: 0, custos: 200 });
  const noLimite = analisarLote({ peso: 10, teor: 750, cotacao: 650, lance: base.lanceMax, custos: 200 });
  assert.ok(Math.abs(noLimite.roi - 15) < 1e-9);
});

test('formata valores em reais', () => assert.match(formatarReal(1234.56), /1\.234,56/));

test('reproduz a cobrança de refino e o lucro da simulação 3M', () => {
  const r = analisarRefino3M(simulacao3M);
  assert.equal(r.pesoAposAmostra, 233.9);
  assert.equal(r.ouroFino, 175.43);
  assert.equal(r.gramasTaxaOuro, 5.26);
  assert.equal(r.custoRefinoOuro, 3380.08);
  assert.equal(r.custoRefinoPrata, 126.8);
  assert.equal(r.custoRefino, 3506.88);
  assert.equal(r.valorVendaOuro, 119292.4);
  assert.equal(r.lucro, 15785.52);
  assert.equal(r.decisao, 'COMPRAR');
});

test('refino classifica cuidado e não comprar ao variar somente o preço de compra', () => {
  assert.equal(analisarRefino3M({ ...simulacao3M, lance: '100.000' }).lucro, 15785.52);
  assert.equal(analisarRefino3M({ ...simulacao3M, lance: '105000' }).decisao, 'CUIDADO');
  assert.equal(analisarRefino3M({ ...simulacao3M, lance: '116000' }).decisao, 'NÃO COMPRAR');
});

test('refino exige os dados financeiros e rejeita amostra maior que o peso', () => {
  assert.throws(() => analisarRefino3M({ ...simulacao3M, taxaRefinoPercentual: '' }), /Preencha/);
  assert.throws(() => analisarRefino3M({ ...simulacao3M, taxaRefinoPercentual: '101' }), /taxa de refino/);
  assert.throws(() => analisarRefino3M({ ...simulacao3M, precoVendaOuro: '' }), /Preencha/);
  assert.throws(() => analisarRefino3M({ ...simulacao3M, amostra: '235' }), /amostra/);
  assert.throws(() => analisarRefino3M({ ...simulacao3M, kitco: '50' }), /Kitco/);
  assert.throws(() => analisarRefino3M({ ...simulacao3M, precoPrata: '0' }), /prata/);
});

test('taxa de refino informada como porcentagem modifica gramas e reais', () => {
  const semTaxa = analisarRefino3M({ ...simulacao3M, taxaRefinoPercentual: '0', pesoPrata: '0' });
  const taxaCinco = analisarRefino3M({ ...simulacao3M, taxaRefinoPercentual: '5', pesoPrata: '0' });
  assert.equal(semTaxa.gramasTaxaOuro, 0);
  assert.equal(semTaxa.custoRefinoOuro, 0);
  assert.equal(taxaCinco.gramasTaxaOuro, 8.77);
  assert.ok(Math.abs(taxaCinco.custoRefinoOuro - 5635.6) < 0.001);
  assert.ok(Math.abs(semTaxa.lucro - taxaCinco.lucro - taxaCinco.custoRefinoOuro) < 0.001);
});

test('refino desconta a taxa ao calcular o lance máximo para 15% de margem', () => {
  const r = analisarRefino3M(simulacao3M);
  assert.ok(Math.abs((r.lanceMax + r.custoRefino) * 1.15 - r.valorVendaOuro) < 0.02);
});
