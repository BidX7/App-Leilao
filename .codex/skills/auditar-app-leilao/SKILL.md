---
name: auditar-app-leilao
description: Auditar ou diagnosticar o MVP App Leilão em Expo, seus cálculos, testes e a confiabilidade de dados de lotes da CAIXA, produzindo evidência verificável e revisão MMD quando solicitada. Use para auditoria, diagnóstico e revisão deste repositório; implementação e publicação exigem autorização própria conforme AGENTS.md.
---

# Auditoria do App Leilão

Esta skill orienta uma execução de auditoria, não cria um processo autônomo nem agenda sua repetição. Trabalhe com o repositório `BidX7/App-Leilao` e a versão efetivamente acessível, não apenas com resumos de conversa. Leia `AGENTS.md` quando presente e respeite a autorização específica da tarefa.

## Modos

- **Analista:** investigar código, entradas, fórmulas, experiência Android, documentação e histórico; produzir achados com evidência reproduzível.
- **MMD:** executar a revisão sequencial em duas fases conforme `AGENTS.md`. Primeiro reproduzir a partir de um pacote neutro sem ver a conclusão; registrar resultado próprio. Só então comparar o relatório/patch do analista, reexecutar testes e refazer pelo menos um cálculo relevante. Marcar cada achado `confirmado`, `não reproduzido` ou `inconclusivo`, explicar por quê e emitir a decisão global pelos critérios de `AGENTS.md`.
- Se o pedido não mencionar MMD, começar no modo Analista. Um pedido de revisão MMD não autoriza execução paralela ou publicação.

## Procedimento

1. Confirmar branch, estado do trabalho e hash da referência remota disponível sem sobrescrever alterações existentes. Não presumir que `origin/main` está atualizada; fazer `fetch` apenas quando autorizado e possível. Ler `README.md`, `App.js`, `src/auction.js`, `test/auction.test.js`, `app.json` e documentação de continuidade relevante.
2. Registrar `git status`, rodar `npm test` e rodar a exportação equivalente a `npm run check` somente com saída em diretório temporário fora da árvore de trabalho, sem apagar artefatos preexistentes. Conferir novamente `git status`. Informar falhas de rede ou instalação como limitação, nunca como sucesso.
3. Verificar casos-limite de peso, teor, cotação, lance, custos e vírgula decimal. Conferir cálculo de ouro fino, recuperação, valor recuperável, custo total, lucro, ROI, lance máximo e classificação. O teor é expresso em milésimos; recuperação de 98% e margem mínima de 15% são hipóteses da versão atual, não garantias de mercado.
4. Distinguir teste de lógica/bundle de teste em Android físico. Para bugs de interface, pedir reprodução no aparelho quando a evidência local não bastar.
5. Entregar relatório sucinto: estado do commit analisado, testes executados e resultados, achados por gravidade com reprodução/impacto, hipóteses não confirmadas, pendências de aparelho e até três recomendações priorizadas.

## Dados automáticos de leilões

O objetivo do produto é listar oportunidades reais e reduzir digitação manual. Para avaliar ou implementar essa integração, verificar primeiro a Vitrine de Joias e os catálogos oficiais da CAIXA, o acesso permitido, os formatos publicados e a frequência de atualização. Não presumir API pública nem contornar cadastro, limites ou bloqueios da fonte.

Como critério de aceitação para uma futura integração, cada campo deve comportar `valor`, `fonte`, `momento_da_coleta` e `status` (`confirmado`, `estimado` ou `ausente`). Persistir esse modelo só em implementação autorizada. Número do lote, link oficial, cronograma e preço mínimo são distintos do lance atual do usuário; nunca substituir um pelo outro silenciosamente. Peso e teor só entram como confirmados se a publicação do lote trouxer essas medidas de modo inequívoco. Cotação requer fonte de mercado separada e horário; custos dependem do edital, retirada, transporte e operação do comprador. Um campo ausente deve continuar editável e impedir recomendação definitiva se for essencial ao cálculo.

O Analista propõe a extração e mapeia campos disponíveis; o MMD compara amostras com documentos oficiais, recalcula um lote e sinaliza divergências. Não chamar um teste de parser de prova de que a lista de leilões atuais está sincronizada. Antes de publicar conectores ou usar dados externos em produção, obter aprovação do fundador para fonte, método de coleta e frequência.

## Portões de decisão

- **Skill:** define como verificar e reportar; não decide quando executar. O agendamento, quando autorizado, dispara cada execução.
- **Analista/MMD:** podem investigar e recomendar. A segunda opinião não transforma hipótese em fato sem evidência.
- **Aplicativo:** é o objeto da análise; nesta versão não contém o agente nem concede a ele acesso a leilões.
- **Fundador:** aprova qualquer alteração de fórmula/limiar, conexão nova, gasto, publicação na `main`, APK ou decisão comercial.

Em auditorias e monitoramento, permanecer somente em leitura e diagnóstico; um patch deve ser apenas proposto, não aplicado. Para correção explicitamente solicitada, aplicar alteração pequena e testes, mas não publicar sem autorização separada. Consultas de cotação atual também exigem autorização específica, fonte verificável e horário; são informativas e nunca autorizam lance ou compra. Não acessar ou divulgar credenciais, dados pessoais ou resultados de terceiros sem necessidade e autorização.
