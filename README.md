# App Leilão

MVP em React Native/Expo para estimar a viabilidade da compra de lotes de ouro.

## Cálculos

- ouro fino conforme peso e teor;
- recuperação estimada de 98%;
- valor recuperável pela cotação informada;
- lucro, ROI e lance máximo para margem mínima de 15%;
- recomendação: **COMPRAR**, **CUIDADO** ou **NÃO COMPRAR**.

Os resultados são estimativas e não substituem análise física, ensaio do metal, impostos ou avaliação profissional.

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
