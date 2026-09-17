# Relatório — seleção de lotes públicos e pré-lance

Data: 17/09/2026. Versão experimental na branch `feat/vitrine-publica`.

## O que foi implementado

- O pré-lance abre a Vitrine pública oficial da Caixa dentro do app. O usuário escolhe um leilão, abre o detalhe de um lote e toca em **Importar lote aberto**. O app lê número, descrição, peso total, lance mínimo e fotos disponibilizadas na página; apresenta uma conferência antes de preencher o pré-lance.
- Caso a página não carregue, o usuário pode colar os dados publicados e conferir o lote. Também pode cadastrar um lote manualmente, com descrição, número, peso total e lance mínimo. Até 50 lotes manuais ficam armazenados somente no aparelho.
- O pré-lance recebe somente o peso **total** e o lance mínimo publicados. O peso mínimo da liga sem pedras e o teor ficam vazios para o usuário indicar hipóteses próprias. O cálculo pré-lance inclui tarifa e custos informados, sem taxa de refino.
- Após obter fisicamente o lote, o usuário informa peso da liga sem pedras e teor medido ou confirmado para levar esses dados à análise com refino. A hipótese anterior não vira medição automaticamente. A taxa de refino continua digitada em porcentagem e seu valor em gramas e reais aparece no resultado da análise.
- Os casos de 2018 deixam de aparecer na tela; continuam nos testes para verificação histórica.

## Fonte pública conferida

A Vitrine oficial exibiu em 17/09/2026 lotes em exposição no [leilão 227/2026](https://vitrinedejoias.caixa.gov.br/Paginas/vitrine-leilao.aspx?leilao=227%2F2026). Um detalhe público exibiu lote `0041.000001-9`, peso total 44,00 g, lance mínimo R$ 15.967,00, descrição de ouro e pedras. O peso do ouro sem pedras e o teor específico das peças não constam desses campos. A disponibilidade da página e das fotos pode mudar; a consulta dentro da APK depende do funcionamento atual da Vitrine.

## Verificação

`npm test`: 23 testes passaram. `npx expo export --platform android`: bundle Android gerado. O [GitHub Actions, execução 35257762332](https://github.com/BidX7/App-Leilao/actions/runs/35257762332), compilou e publicou o artefato `App-Leilao-Vitrine-experimental` (ZIP com APK, cerca de 27,6 MB). Os testes verificam a rejeição de páginas de origem diferente, peso e lance ausentes, e que nenhum teor ou peso de ouro é inventado na importação. A interação da Vitrine dentro do WebView e a instalação desta versão ainda precisam ser verificadas em um Android físico.

### Correção após teste no aparelho

O usuário confirmou que a página inicial da Caixa abriu na APK anterior, mas não encontrou uma opção acessível para abrir um lote. A nova versão mantém a disposição da tela, lê do cronograma oficial os leilões marcados **Em exposição** e exibe opções tocáveis para abrir cada leilão. A página do leilão rola até os cartões publicados. Foi conferido na Vitrine pública que havia links para Campina Grande/PB e Patos de Minas/MG e que o detalhe de um lote mostrava os campos de número, descrição e lance mínimo usados pela importação. **25 testes passaram**; o bundle Android foi gerado; a [execução 35266960874](https://github.com/BidX7/App-Leilao/actions/runs/35266960874) concluiu a APK com sucesso. A escolha e importação pelo WebView na APK corrigida ainda dependem de teste no Android do usuário.

### Segunda correção após novo teste no aparelho

O usuário instalou a APK da execução 7 e confirmou pela nova instrução visível que ela estava atualizada, mas a lista de leilões permaneceu vazia. A primeira extração tentava encontrar o cronograma por aproximadamente nove segundos; no navegador, o calendário público da Caixa pode demorar mais para preencher. A execução 8 amplia a espera para até 90 segundos, aceita a URL oficial com parâmetros e permite repetir a consulta pelo botão **Escolher lote público**, sem alterar a disposição da tela. **26 testes passaram**, incluindo um calendário que só aparece após quinze tentativas; o bundle Android foi gerado. Essa correção é uma hipótese testável: ainda não há confirmação de que o WebView no Android mostre os leilões ou importe um lote. Se a lista continuar vazia após a espera, será preciso observar o conteúdo efetivamente carregado no aparelho e ajustar a extração.

### Navegação em tela cheia na versão experimental

O usuário confirmou que a APK 8 listou dois leilões em exposição e abriu a página de Campina Grande. Porém, a janela embutida de 440 px de altura dificultou a navegação e não houve importação de um lote. O navegador foi movido para uma tela cheia **dentro do aplicativo**, com **Importar lote aberto** fixo abaixo da página da Caixa; o pré-lance e a entrada manual continuam no app. Isso não solicita cadastro na Caixa nem transfere dados privados. Os 26 testes de lógica e a exportação do bundle Android passaram; a navegação, a abertura de um detalhe e a importação ainda não foram confirmadas no aparelho. Uma tela maior pode facilitar o toque, mas não demonstra que o detalhe público será lido pelo WebView.

## Limites e próximos passos

O anúncio não prova a composição efetiva do lote. O pré-lance continua sendo um cenário condicional baseado na hipótese informada pelo usuário; não fornece um lance seguro independente dessa hipótese. Não há login na Caixa, lances pelo aplicativo, acesso a lotes privados de terceiros nem atualização automática de lances atuais. O cadastro manual não sincroniza entre aparelhos. Se a Caixa mudar a estrutura da página pública, a extração do detalhe pode exigir ajuste.
