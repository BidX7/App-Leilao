# Pacote de continuidade — App Leilão

Documento criado em 14 de setembro de 2026 para permitir a retomada do projeto mesmo com outra conta ou outro assistente.

## Identificação

- Projeto: App Leilão
- Responsável pelo repositório: BidX7
- Plataforma: React Native com Expo SDK 55
- Versão atual do MVP: 0.1.0
- Pacote Android: `com.bidx7.appleilao`
- Situação estimada: 90% do MVP concluído

## Links importantes

- Expo Snack: https://snack.expo.dev/@appleilao/app-leilao
- GitHub: https://github.com/BidX7/App-Leilao
- Conversa compartilhada de continuidade: https://chatgpt.com/share/6aa7d8f9-c7c8-83e9-9ad5-b4e91d74c597?ogimg=plain
- Expo Go para Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- Documentação Expo: https://docs.expo.dev/

## Objetivo do MVP

Analisar oportunidades em leilões de joias e metais preciosos. O usuário informa peso, teor do ouro, cotação do ouro 24k por grama, lance e custos adicionais. O aplicativo calcula:

- ouro fino;
- recuperação estimada de 98%;
- valor recuperável;
- custo total;
- lucro estimado;
- ROI;
- lance máximo para preservar margem mínima de 15%;
- decisão: COMPRAR, CUIDADO ou NÃO COMPRAR.

## Estado do trabalho

Concluído:

- código original recuperado do Snack;
- projeto Expo 55 reconstruído;
- regras financeiras separadas da interface;
- suporte a números com vírgula e formato brasileiro;
- validação de campos vazios, teor fora de 1–1000 e valores negativos;
- cores diferentes para as três decisões;
- melhorias de teclado, rolagem e acessibilidade;
- cinco testes automatizados aprovados;
- bundle Android de produção gerado com sucesso;
- documentação de execução e teste criada;
- dois commits locais organizados.

Pendente:

- testar no Expo Go em um Android físico;
- validar teclado, rolagem, tela pequena e uso offline;
- gerar um APK instalável, se desejado;
- corrigir qualquer falha encontrada exclusivamente no aparelho.

## Histórico dos commits

- `82f1ef1` — Initial commit (já está no GitHub)
- `b88f5ab` — feat: implement auction analysis MVP (publicado na `main`)
- `90c2a76` — docs: add setup and Android validation guide (publicado na `main`)

O conteúdo deste repositório na branch `main` é a fonte principal para a retomada.

## Estrutura do pacote

- `App.js`: tela principal do aplicativo;
- `src/auction.js`: cálculos, validações e formatação;
- `test/auction.test.js`: testes automatizados;
- `package.json` e `package-lock.json`: dependências e comandos;
- `app.json`: configuração Expo e Android;
- `README.md`: instruções resumidas;
- `CONTINUIDADE_DO_PROJETO.md`: este documento de retomada.

Pastas deliberadamente ausentes do ZIP:

- `node_modules/`: pode ser recriada com `npm install`;
- `dist/`: pode ser recriada com `npm run check`;
- `.git/`: histórico local interno, desnecessário para abrir o código e muito menos portátil.

## Como retomar em outro computador ou com outra conta

1. Descompactar o ZIP.
2. Abrir esta pasta em um ambiente com Node.js 20 ou superior.
3. Executar `npm install`.
4. Executar `npm test` e confirmar que os cinco testes passam.
5. Executar `npm run check` para gerar o bundle Android.
6. Conectar ao repositório `BidX7/App-Leilao`.
7. Comparar o conteúdo remoto antes de enviar alterações.
8. Publicar o código na branch `main` ou abrir uma branch/PR se o repositório já tiver evoluído.
9. Executar `npm start` e testar no Expo Go.

## Mensagem pronta para outro assistente

> Abra o arquivo CONTINUIDADE_DO_PROJETO.md e analise todo o pacote antes de alterar qualquer coisa. Este é o MVP do App Leilão em Expo SDK 55. Preserve o que funciona, execute os testes, gere o bundle Android e compare com https://github.com/BidX7/App-Leilao antes de publicar. Dois commits locais descritos no documento ainda podem estar pendentes. Depois teste os fluxos principais e documente o que exige aparelho Android físico.

## Validações já realizadas

Comando `npm test`: cinco testes aprovados, zero falhas.

Comando `npm run check`: bundle Android criado com sucesso, incluindo bundle Hermes de aproximadamente 1,7 MB.

A verificação online `npx expo install --check` não terminou porque o proxy de rede da sessão expirou. Isso não impediu a instalação das dependências nem a geração do bundle Android.

## Observações de segurança e negócio

- O pacote não contém senha, token do GitHub ou outra credencial.
- Não publicar chaves de assinatura Android no repositório.
- Os cálculos são estimativas. Antes de comprar um lote real, considerar ensaio do metal, pedras, perdas de refino, taxas, impostos, frete e comissão do leiloeiro.
- A recuperação de 98% e a margem mínima de 15% estão fixas nesta versão e poderão virar campos configuráveis em uma versão futura.


## Atualização — consulta assistida de lotes (16/09/2026)

A análise com refino é a tela inicial e leva os custos da refinadora em conta para COMPRAR, CUIDADO e NÃO COMPRAR. O usuário pode informar o número do lote, abrir a Vitrine da Caixa, copiar os detalhes e colá-los no app: número, peso total e lance mínimo são conferidos e importados. Peso da liga sem pedras, teor, amostra, prata e preços continuam exigindo confirmação. A consulta automática direta pelo número ainda não foi validada; não anunciar essa etapa como concluída. Foram aprovados 14 testes e gerado o bundle Android, mas faltam APK e teste físico.
