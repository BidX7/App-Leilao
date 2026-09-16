# App Leilão

MVP em React Native/Expo para estimar a viabilidade da compra de lotes de ouro.

## Cálculos

### Pré-lance com histórico oficial

A tela **Pré-lance** contém três casos do catálogo oficial de Criciúma de 16/05/2018, cruzados pelo número do lote com o resultado de 17/05/2018. Fontes: [catálogo](https://servicebus2.caixa.gov.br/vitrinearquivos/pdf/011201841541020180516104338.pdf) e [resultados](https://servicebus2.caixa.gov.br/vitrinearquivos/pdf/011201841541020180517112715.pdf). Os resultados publicados eram provisórios até a confirmação do pagamento. Os exemplos preenchem peso total e lance mínimo, mostram lance vencedor e tarifa, mas **não preenchem peso do ouro, teor ou cotação**. O catálogo às vezes estima o peso das pedras, sem provar a massa da liga.

O usuário informa uma hipótese mínima justificada de liga de ouro sem pedras, teor, preços, custos e tarifa. O app calcula o teto de lance para ROI de 15% incluindo 3% do ouro fino como custo estimado do refino. A tela informa que o resultado é **condicional à hipótese**, sem recomendação automática de compra. Sem limite inferior de metal defensável, o histórico de preços sozinho não permite um lance seguro. A tarifa de 6% vem **apenas do exemplo de 2018**; confirme a regra do leilão atual antes de usar outro lote. Esse cálculo pré-lance não altera a análise com refino existente nem comprova a precisão das hipóteses.

Após receber um lote, informe **o peso medido da liga sem pedras** e **o teor testado ou confirmado** no cartão "Depois de receber o lote". O botão leva esses valores e os preços à análise com refino, incluindo a tarifa calculada nos outros custos. A hipótese mínima usada antes do lance nunca é copiada como se fosse uma medição. Antes de calcular o refino, informe ainda a amostra e a prata conforme o resultado real da separação; o app não armazena um histórico persistente de previsões e medições nesta versão.

O aplicativo abre na **Análise com refino**, que fornece a decisão de compra. A **Simulação auxiliar** preserva a estimativa original, mas não exibe recomendação de compra porque não inclui a taxa da refinadora:

### Importar dados de um lote da Caixa

Na Análise com refino, informe o número completo do lote, abra a Vitrine oficial e cole o texto de detalhes. O app exige que o texto contenha o mesmo número e extrai somente o peso **total** anunciado e o lance mínimo. Ele não converte o peso total em ouro, não estima teor nem detecta pedras pela imagem. Após importar, informe a liga sem pedras, teor, custos e preços para calcular. Se o peso da liga ultrapassar o peso total ou o preço de compra ficar abaixo do lance mínimo, a análise é bloqueada.

A busca direta na Caixa por número de lote ainda não foi integrada: a Vitrine carrega dados na página e não foi confirmado um endpoint público estável para consulta nativa. O botão abre o site oficial; o usuário copia os detalhes. Esta etapa mantém o cálculo manual disponível se a Caixa mudar o site ou estiver inacessível.

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
