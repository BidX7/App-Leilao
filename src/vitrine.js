export const URL_VITRINE = 'https://vitrinedejoias.caixa.gov.br/Paginas/default.aspx';

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
