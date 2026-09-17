// Importa apenas os dados explicitamente publicados na descrição de um lote.
// Peso total NÃO equivale a peso da liga de ouro sem pedras.
export function normalizarNumeroLote(numero) {
  const valor = String(numero ?? '').trim();
  if (!/^\d{4}\.\d{6}-\d$/.test(valor)) throw new Error('Use o número completo do lote, como 0041.000257-7.');
  return valor;
}

export function extrairDadosLote(texto, numeroEsperado) {
  const conteudo = String(texto ?? '');
  const esperado = normalizarNumeroLote(numeroEsperado);
  const encontrado = conteudo.match(/(?:N[º°o]\s*)?Lote\s*:?\s*(\d{4}\.\d{6}-\d)/i)?.[1];
  if (!encontrado || encontrado !== esperado) throw new Error('O texto não contém o número do lote solicitado. Confira antes de importar.');
  const peso = conteudo.match(/PESO\s+LOTE\s*:\s*(\d+(?:[.,]\d+)?)\s*G\b/i)?.[1];
  const preco = conteudo.match(/(?:Valor do lance mínimo|Valor Mínimo|Lance mínimo)\s*:\s*R\$\s*([\d.,]+)/i)?.[1];
  if (!peso || !preco) throw new Error('Peso total ou lance mínimo não foram encontrados na descrição.');
  const pesoTotal = Number(peso.replace(',', '.'));
  const lanceMinimo = Number(preco.replace(/\./g, '').replace(',', '.'));
  if (!(pesoTotal > 0 && lanceMinimo >= 0 && Number.isFinite(lanceMinimo))) throw new Error('Dados do lote inválidos.');
  const descricao = conteudo.match(/Descrição\s*:\s*([^\n]+?)(?=\s*Valor do lance mínimo|\n|$)/i)?.[1]?.trim() || '';
  return { numero: esperado, pesoTotal, lanceMinimo, descricao };
}

export function extrairLotePublico(mensagem) {
  const { url, numero, descricao, lanceMinimo, fotos } = mensagem || {};
  const origem = new URL(url);
  if (origem.protocol !== 'https:' || origem.hostname !== 'vitrinedejoias.caixa.gov.br' ||
      !/^\/Paginas\/vitrine-leilao\.aspx$/i.test(origem.pathname)) {
    throw new Error('A importação só aceita lotes da Vitrine oficial da Caixa.');
  }
  const dados = extrairDadosLote(`Descrição: ${descricao}\nValor do lance mínimo: ${lanceMinimo}\nNúmero do lote: ${numero}`, numero);
  return { ...dados, origem: origem.href, fotos: (Array.isArray(fotos) ? fotos : [])
    .filter((foto) => { try { const u = new URL(foto); return u.protocol === 'https:' && u.hostname.endsWith('.caixa.gov.br') && !/indisponivel\.png$/i.test(u.pathname); } catch { return false; } })
    .slice(0, 2) };
}
