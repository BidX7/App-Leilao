export const URL_VITRINE = 'https://vitrinedejoias.caixa.gov.br/Paginas/default.aspx';

// Consulta somente links públicos de leilões em exposição exibidos no cronograma.
export const LER_LEILOES_PUBLICOS = `(() => {
  let tentativas = 0;
  const consultar = () => {
    const leiloes = Array.from(document.querySelectorAll('a[href*="vitrine-leilao.aspx"]'))
      .map(a => { const linha = a.closest('tr'); const colunas = linha?.querySelectorAll('td');
        return { url: a.href, texto: linha?.innerText || '',
          nome: colunas?.length >= 7 ? 'Em exposição · ' + colunas[3].innerText.trim() + ' · ' + colunas[4].innerText.trim() : '' }; })
      .filter(item => /Em exposição/i.test(item.texto))
      .map(item => ({ url: item.url, descricao: item.nome || item.texto.replace(/\\s+/g, ' ').trim() }));
    if (leiloes.length || ++tentativas >= 60) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'leiloes', url: location.href, leiloes }));
    } else setTimeout(consultar, 1500);
  };
  consultar();
})(); true;`;

export const ROLAR_PARA_LOTES = `(() => {
  let tentativas = 0;
  const mostrar = () => {
    const titulo = Array.from(document.querySelectorAll('h3')).find(x => /Resultados/i.test(x.textContent));
    if (titulo && /Nº Lote\\s+\\d{4}\\./.test(document.body.innerText)) titulo.scrollIntoView();
    else if (++tentativas < 12) setTimeout(mostrar, 750);
  };
  mostrar();
})(); true;`;

export function extrairLeiloesPublicos(mensagem) {
  if (!paginaCronogramaPublico(mensagem?.url) || !Array.isArray(mensagem.leiloes))
    throw new Error('Não foi possível verificar o cronograma oficial.');
  return mensagem.leiloes.filter(({ url, descricao }) => {
    try {
      const pagina = new URL(url);
      return pagina.protocol === 'https:' && pagina.hostname === 'vitrinedejoias.caixa.gov.br' &&
        pagina.pathname.toLowerCase() === '/paginas/vitrine-leilao.aspx' &&
        pagina.searchParams.has('leilao') && /Em exposição/i.test(descricao);
    } catch { return false; }
  }).slice(0, 30);
}

export function paginaCronogramaPublico(url) {
  try {
    const pagina = new URL(url);
    return pagina.protocol === 'https:' && pagina.hostname === 'vitrinedejoias.caixa.gov.br' &&
      pagina.pathname.toLowerCase() === '/paginas/default.aspx';
  } catch { return false; }
}

// Executado somente na página pública da Vitrine aberta pelo próprio usuário.
// Lê o modal visível, sem acessar login, contratos ou dados de compradores.
export const LER_LOTE_VISIVEL = `(() => {
  const modal = document.querySelector('.detalhe-joia-modal-content');
  const campo = (id) => modal?.querySelector('#' + id)?.textContent?.trim() || '';
  const fotos = ['imagemJoiaEsquerdaModal', 'imagemJoiaDireitaModal']
    .map(id => modal?.querySelector('#' + id)?.src).filter(Boolean);
  window.ReactNativeWebView.postMessage(JSON.stringify({
    url: location.href,
    numero: campo('numeroDoLoteModal'),
    descricao: campo('descricaoLoteModal').replace(/^Descrição:\\s*/i, ''),
    lanceMinimo: campo('valorLanceMinimoModal'), fotos
  }));
})(); true;`;

export function urlPublica(url) {
  try {
    const destino = new URL(url);
    return destino.protocol === 'https:' && destino.hostname === 'vitrinedejoias.caixa.gov.br';
  } catch { return false; }
}
