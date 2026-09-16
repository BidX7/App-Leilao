import { parseNumero } from './auction.js';

// Entrada feita após abrir o lote. Nunca transforma hipótese pré-lance em medição.
export function prepararRefinoAposMedicao(pre, pesoMedido, teorMedido) {
  const total = parseNumero(pre.pesoTotal);
  const peso = parseNumero(pesoMedido);
  const teor = parseNumero(teorMedido);
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(peso) || peso <= 0 || peso > total) {
    throw new Error('Informe o peso medido da liga sem pedras, maior que zero e até o peso total anunciado.');
  }
  if (!Number.isFinite(teor) || teor <= 0 || teor > 1000) throw new Error('Informe o teor medido ou confirmado entre 1 e 1000.');
  const lance = parseNumero(pre.lance);
  const custos = parseNumero(pre.custos);
  const tarifaPercentual = parseNumero(pre.tarifaPercentual);
  if (![lance, custos, tarifaPercentual].every(Number.isFinite) || lance < 0 || custos < 0 || tarifaPercentual < 0 || tarifaPercentual > 100) {
    throw new Error('Confira lance, custos e tarifa antes de transferir ao refino.');
  }
  return { peso: String(peso), teor: String(teor), kitco: pre.kitco, desconto: pre.desconto,
    precoVendaOuro: pre.precoVendaOuro, lance: pre.lance,
    custos: String(Math.round((custos + lance * tarifaPercentual / 100) * 100) / 100) };
}
