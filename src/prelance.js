import { parseNumero } from './auction.js';

// Uma estimativa inferior de metal precisa de justificativa externa. O catálogo
// e o lance vencedor não medem teor, massa da liga ou rendimento do refino.
export function analisarPreLance(campos) {
  const nomes = ['pesoTotal', 'pesoMetalMinimo', 'teor', 'precoVendaOuro', 'lance', 'custos', 'tarifaPercentual'];
  const v = Object.fromEntries(nomes.map((nome) => [nome, parseNumero(campos[nome])]));
  if (!Object.values(v).every(Number.isFinite)) throw new Error('Preencha todos os números, inclusive a hipótese mínima de metal.');
  if (v.pesoTotal <= 0 || v.pesoMetalMinimo <= 0 || v.pesoMetalMinimo > v.pesoTotal) throw new Error('O peso mínimo de metal deve ser maior que zero e não superar o peso total.');
  if (v.teor <= 0 || v.teor > 1000) throw new Error('O teor deve estar entre 1 e 1000.');
  if (v.precoVendaOuro <= 0) throw new Error('Informe um preço de venda do ouro fino maior que zero.');
  if (v.lance < 0 || v.custos < 0 || v.tarifaPercentual < 0 || v.tarifaPercentual > 100) throw new Error('Lance, custos e tarifa devem ser válidos.');
  const ouroFino = v.pesoMetalMinimo * v.teor / 1000;
  const receita = ouroFino * v.precoVendaOuro;
  const tarifa = v.lance * v.tarifaPercentual / 100;
  const custo = v.lance + tarifa + v.custos;
  const lucro = receita - custo;
  const lanceMaximo = (receita / 1.15 - v.custos) / (1 + v.tarifaPercentual / 100);
  if (![ouroFino, receita, tarifa, custo, lucro, lanceMaximo].every(Number.isFinite)) throw new Error('Valores grandes demais para cálculo seguro.');
  return { ouroFino, receita, tarifa, custo, lucro, lanceMaximo: Math.max(0, lanceMaximo),
    viavelNaHipotese: lanceMaximo >= v.lance && lanceMaximo > 0 };
}
