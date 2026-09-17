import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairLotePublico } from '../src/caixa.js';
import { urlPublica } from '../src/vitrine.js';

test('importa apenas dados publicados no modal de um lote atual, sem inferir ouro ou teor', () => {
  const dados = extrairLotePublico({
    url: 'https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx?leilao=227%2F2026',
    numero: '0041.000001-9',
    descricao: 'UMA ALIANÇA, TRES ANÉIS, DE: OURO BRANCO, OURO; CONTÉM: diamantes, pedras; PESO LOTE: 44,00G (QUARENTA E QUATRO GRAMAS)',
    lanceMinimo: 'R$15.967,00', fotos: ['https://vitrinedejoias.caixa.gov.br/joia.jpg', 'https://outro.exemplo/joia.jpg']
  });
  assert.equal(dados.pesoTotal, 44);
  assert.equal(dados.lanceMinimo, 15967);
  assert.deepEqual(dados.fotos, ['https://vitrinedejoias.caixa.gov.br/joia.jpg']);
  assert.equal('pesoMetalMinimo' in dados, false);
  assert.equal('teor' in dados, false);
});

test('recusa origem falsa, dados incompletos e navegação para login', () => {
  assert.throws(() => extrairLotePublico({ url: 'https://vitrinedejoias.caixa.gov.br.evil.test/Paginas/vitrine-leilao.aspx', numero: '0041.000001-9' }), /oficial/);
  assert.throws(() => extrairLotePublico({ url: 'https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx', numero: '0041.000001-9', descricao: 'OURO' }), /não foram encontrados/);
  assert.equal(urlPublica('https://login.caixa.gov.br/'), false);
});
