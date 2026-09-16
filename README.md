# App Leilão

MVP em React Native/Expo para estimar a viabilidade da compra de lotes de ouro.

## Cálculos

O aplicativo abre na **Análise com refino**, que fornece a decisão de compra. A **Simulação auxiliar** preserva a estimativa original, mas não exibe recomendação de compra porque não inclui a taxa da refinadora:

- ouro fino conforme peso e teor;
- recuperação estimada de 98%;
- valor recuperável pela cotação informada;
- lucro, ROI e lance máximo para margem mínima de 15%;
- valores de comparação, sem recomendação de compra.

Os resultados são estimativas e não substituem análise física, ensaio do metal, impostos ou avaliação profissional.

**Análise com refino** reproduz a sequência da simulação 3M fornecida pelo fundador, com arredondamento a duas casas em cada etapa do orçamento:

Informe explicitamente o peso retirado como amostra, a prata fina estimada e o desconto contratado por grama. Use zero somente quando tiver confirmado que o material não contém esses itens; sem esses dados, o modo não emite recomendação.

1. Ouro fino = (peso da liga de ouro sem pedras − amostra retirada) × teor / 1000.
2. Gramas de taxa do ouro = 3% do ouro fino arredondado; taxa do ouro = essas gramas × (Kitco por grama − desconto informado).
3. Taxa da prata = peso estimado de prata fina × preço informado por grama (100%). A prata é um componente da cobrança, não receita de venda neste cálculo.
4. Venda estimada do ouro = ouro fino × preço de venda informado. Custo total = preço de compra + taxa do ouro + taxa da prata + outros custos. Lucro = venda estimada − custo total. ROI = lucro / custo total; margem mínima para **COMPRAR**: 15%.

No exemplo do documento: 235 g, amostra de 1,1 g, teor 750, Kitco R$ 742,60/g, desconto R$ 100/g, 10 g de prata a R$ 12,68/g e venda do ouro a R$ 680/g geram R$ 3.506,88 de refino e R$ 119.292,40 de venda estimada. Se o preço de compra for R$ 100.000, o lucro estimado antes de outros custos é R$ 15.785,52. A recuperação de 98% pertence apenas ao modo simples; o modo Refino 3M supõe devolução integral do ouro calculado após a amostra e cobra o serviço separadamente.

Os valores do documento são históricos e hipotéticos quanto a teor e prata. O usuário deve preencher cotações, teor, prata, amostra e compra com seus dados; o app não obtém preços em tempo real. Não somar novamente o refino ao campo “outros custos”.

## Executar e validar

Requer Node.js 20 ou superior.

```bash
npm install
npm start
npm test
npm run check
```

`npm run check` gera o bundle de produção Android em `dist/`.

## Teste ainda necessário em aparelho físico

- abertura no Expo Go em um Android real;
- teclado numérico e digitação com vírgula;
- rolagem com o teclado aberto;
- legibilidade em telas pequenas;
- comportamento offline após o primeiro carregamento.
