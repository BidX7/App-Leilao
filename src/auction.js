const MARGEM_MINIMA = 0.15;
const RECUPERACAO_PADRAO = 0.98;
const TAXA_PRATA_REFINO = 1;

function arredondarCentavos(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function validarResultados(valores) {
  if (!valores.every(Number.isFinite)) {
    throw new Error('Os valores informados são grandes demais para um cálculo seguro.');
  }
}

export function parseNumero(valor) {
  const texto = String(valor ?? '').trim().replace(/\s/g, '');
  if (!texto) return Number.NaN;
  if (/[eE]/.test(texto)) return Number.NaN;
  if ((texto.match(/,/g) ?? []).length > 1) return Number.NaN;
  if (texto.includes(',') && texto.lastIndexOf('.') > texto.lastIndexOf(',')) return Number.NaN;
  if (texto.includes('.') && !texto.includes(',') && /^\d{1,3}(?:\.\d{3})+$/.test(texto)) {
    return Number(texto.replace(/\./g, ''));
  }
  const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : Number.NaN;
}

export function analisarLote(campos) {
  const peso = parseNumero(campos.peso);
  const teor = parseNumero(campos.teor);
  const cotacao = parseNumero(campos.cotacao);
  const lance = parseNumero(campos.lance);
  const custos = parseNumero(campos.custos);

  if (![peso, teor, cotacao, lance, custos].every(Number.isFinite)) throw new Error('Preencha todos os campos com números válidos.');
  if (peso <= 0 || cotacao <= 0) throw new Error('Peso e cotação precisam ser maiores que zero.');
  if (teor <= 0 || teor > 1000) throw new Error('O teor deve estar entre 1 e 1000.');
  if (lance < 0 || custos < 0) throw new Error('Lance e custos não podem ser negativos.');

  const ouroFino = peso * (teor / 1000);
  const recuperavel = ouroFino * RECUPERACAO_PADRAO;
  const valor = recuperavel * cotacao;
  const custoTotal = lance + custos;
  const lucro = valor - custoTotal;
  const roi = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;
  const lanceMax = Math.max(0, valor / (1 + MARGEM_MINIMA) - custos);
  validarResultados([ouroFino, recuperavel, valor, custoTotal, lucro, roi, lanceMax]);
  let decisao = 'NÃO COMPRAR';
  if (lucro > 0 && roi >= MARGEM_MINIMA * 100) decisao = 'COMPRAR';
  else if (lucro > 0) decisao = 'CUIDADO';
  return { ouroFino, recuperavel, valor, custoTotal, lucro, roi, lanceMax, decisao };
}

// Simulação conforme o orçamento da refinadora: ouro e gramas cobradas
// arredondados a 2 casas antes de calcular cada valor em reais.
export function analisarRefino3M(campos) {
  const peso = parseNumero(campos.peso);
  const amostra = parseNumero(campos.amostra);
  const teor = parseNumero(campos.teor);
  const kitco = parseNumero(campos.kitco);
  const desconto = parseNumero(campos.desconto);
  const taxaRefinoPercentual = parseNumero(campos.taxaRefinoPercentual);
  const pesoPrata = parseNumero(campos.pesoPrata);
  const precoPrata = parseNumero(campos.precoPrata);
  const precoVendaOuro = parseNumero(campos.precoVendaOuro);
  const lance = parseNumero(campos.lance);
  const custos = parseNumero(campos.custos);

  if (![peso, amostra, teor, kitco, desconto, taxaRefinoPercentual, pesoPrata, precoPrata, precoVendaOuro, lance, custos].every(Number.isFinite)) {
    throw new Error('Preencha todos os campos com números válidos; use 0 quando não houver prata ou outros custos.');
  }
  if (peso <= 0 || amostra < 0 || amostra >= peso) throw new Error('A amostra deve ser menor que o peso e não pode ser negativa.');
  if (teor <= 0 || teor > 1000) throw new Error('O teor deve estar entre 1 e 1000.');
  if (kitco <= 0 || desconto < 0 || desconto >= kitco) throw new Error('A cotação Kitco deve superar o desconto da refinadora.');
  if (taxaRefinoPercentual < 0 || taxaRefinoPercentual > 100) throw new Error('A taxa de refino deve estar entre 0% e 100%.');
  if (pesoPrata < 0 || precoPrata < 0 || precoVendaOuro <= 0 || lance < 0 || custos < 0) {
    throw new Error('Prata, preços, lance e custos não podem ser negativos; a venda do ouro deve ser maior que zero.');
  }
  if (pesoPrata > 0 && precoPrata <= 0) throw new Error('Informe o preço da prata quando houver prata estimada.');

  const pesoAposAmostra = peso - amostra;
  const ouroFino = arredondarCentavos(pesoAposAmostra * teor / 1000);
  const gramasTaxaOuro = arredondarCentavos(ouroFino * taxaRefinoPercentual / 100);
  const precoTaxaOuro = kitco - desconto;
  const custoRefinoOuro = arredondarCentavos(gramasTaxaOuro * precoTaxaOuro);
  const custoRefinoPrata = arredondarCentavos(pesoPrata * precoPrata * TAXA_PRATA_REFINO);
  const custoRefino = arredondarCentavos(custoRefinoOuro + custoRefinoPrata);
  const valorVendaOuro = arredondarCentavos(ouroFino * precoVendaOuro);
  const custoTotal = arredondarCentavos(lance + custos + custoRefino);
  const lucro = arredondarCentavos(valorVendaOuro - custoTotal);
  const roi = custoTotal > 0 ? lucro / custoTotal * 100 : null;
  const lanceMax = Math.max(0, arredondarCentavos(valorVendaOuro / (1 + MARGEM_MINIMA) - custos - custoRefino));

  validarResultados([pesoAposAmostra, ouroFino, gramasTaxaOuro, precoTaxaOuro, custoRefinoOuro, custoRefinoPrata,
    custoRefino, valorVendaOuro, custoTotal, lucro, lanceMax, ...(roi === null ? [] : [roi])]);

  let decisao = 'NÃO COMPRAR';
  if (lucro > 0 && roi !== null && roi + 1e-9 >= MARGEM_MINIMA * 100) decisao = 'COMPRAR';
  else if (lucro > 0) decisao = 'CUIDADO';

  return { pesoAposAmostra, ouroFino, taxaRefinoPercentual, gramasTaxaOuro, precoTaxaOuro, custoRefinoOuro, custoRefinoPrata,
    custoRefino, valorVendaOuro, custoTotal, lucro, roi, lanceMax, decisao };
}

export function formatarReal(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
