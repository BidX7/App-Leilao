import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { extrairLotePublico } from '../src/caixa.js';
import { extrairLeiloesPublicos, LER_LEILOES_PUBLICOS, urlPublica } from '../src/vitrine.js';

test('lê links públicos do cronograma renderizado e envia nomes curtos ao aplicativo', () => {
  const mensagens = [];
  const linha = { innerText: 'PB CAMPINA GRANDE Em exposição', querySelectorAll: () =>
    ['21/09', '16/09', '20/10', 'PB', 'CAMPINA GRANDE', '41', 'Em exposição'].map(innerText => ({ innerText })) };
  const documento = { querySelectorAll: () => [{ href: 'https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx?leilao=227%2F2026', closest: () => linha }] };
  vm.runInNewContext(LER_LEILOES_PUBLICOS, { document: documento,
    location: { href: 'https://vitrinedejoias.caixa.gov.br/Paginas/default.aspx' },
    window: { ReactNativeWebView: { postMessage: (mensagem) => mensagens.push(JSON.parse(mensagem)) } } });
  assert.equal(extrairLeiloesPublicos(mensagens[0])[0].descricao, 'Em exposição · PB · CAMPINA GRANDE');
});

test('lista somente leilões públicos em exposição no cronograma oficial', () => {
  const dados = extrairLeiloesPublicos({
    url: 'https://vitrinedejoias.caixa.gov.br/Paginas/default.aspx',
    leiloes: [
      { url: 'https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx?leilao=227%2F2026', descricao: 'PB CAMPINA GRANDE Em exposição' },
      { url: 'https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx?leilao=1', descricao: 'Confirmado' },
      { url: 'https://vitrinedejoias.caixa.gov.br.evil.test/Paginas/vitrine-leilao.aspx?leilao=2', descricao: 'Em exposição' }
    ]
  });
  assert.equal(dados.length, 1);
  assert.match(dados[0].descricao, /CAMPINA GRANDE/);
  assert.throws(() => extrairLeiloesPublicos({ url: 'https://evil.test', leiloes: [] }), /cronograma oficial/);
});

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
