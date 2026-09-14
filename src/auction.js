const MARGEM_MINIMA = 0.15;
const RECUPERACAO_PADRAO = 0.98;

export function parseNumero(valor) {
  const texto = String(valor ?? '').trim().replace(/\s/g, '');
  if (!texto) return Number.NaN;
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
  let decisao = 'NÃO COMPRAR';
  if (lucro > 0 && roi >= MARGEM_MINIMA * 100) decisao = 'COMPRAR';
  else if (lucro > 0) decisao = 'CUIDADO';
  return { ouroFino, recuperavel, valor, custoTotal, lucro, roi, lanceMax, decisao };
}

export function formatarReal(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
