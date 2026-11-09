# BF-5.6A+B+C — Gate físico parcial e reparos do Arcanário

- Registro: **09/11/2026** (Moto G06, relato do proprietário com capturas).
- Fonte: testes físicos reais na candidata consolidada da PR #45, baseada em #44/B e #43/A.
- Decisão do proprietário: **integrar as três PRs após implementar os reparos abaixo, mesmo com outros testes parciais**, mantendo refinamentos futuros antes do encerramento completo da BF-5.6. Esta decisão não é CI verde nem certificação de acessibilidade ou aceite de toda a fase.

## Resultado observado no aparelho

| Grupo | Estado | Evidência/ressalva |
| --- | --- | --- |
| Dados pessoais e atualização | **PASS observado** | Proprietário informou que os dados foram preservados após a atualização; não foi demonstrado restore destrutivo. |
| Exportação de backup | **PASS observado** | Proprietário conseguiu produzir backup; não equivale a validação da restauração. |
| Molduras sem picker nativo (B-R1) | **PASS observado** | Reparação anterior funcionou no Moto G06. |
| Criação de questão autoral | **PASS básico** | Questão foi criada e exibida; demais fluxos não exaustivamente testados. |
| Classificação/etiquetagem | **FAIL de usabilidade antes do reparo** | Busca não produzia seleção nem etiqueta porque não havia classificações criadas; relato de flash branco transitório ao tocar novamente no campo, causa não comprovada. |
| Fólio de questão | **FAIL de contraste antes do reparo** | “Gabarito e resolução (Oficina)” dourado muito claro sobre papel bege, leitura difícil. |
| Resto de A+B+C | **PARCIAL/não certificado** | Provações longas, taxonomia hierárquica, filtros dinâmicos, relatórios, Canvas/lifecycle, TalkBack, termal, memória e CI global seguem sujeitos a refinamento/gates próprios. |

## Reparos aplicados à branch da C

1. **Classificação na Oficina:** explicação de que pesquisa apenas filtra tags já cadastradas; resultado vazio explícito; campo de texto sem submissão por Enter; botão **Criar e marcar etiqueta** faz cadastro transacional de etiqueta pessoal pela porta de aplicação, marca a referência no rascunho da questão e atualiza o acervo; nome repetido orienta selecionar a etiqueta existente. Hierarquia editorial e assunto principal continuam disponíveis na sala Assuntos. Nenhum dado legado foi reclassificado, nem houve migração de banco.
2. **Contraste do fólio:** CSS escopado ao resumo de detalhes em `.arcana-folio`, usando texto escuro sobre fundo bege mais saturado, estados hover/foco discerníveis. O tema violeta/dourado permanece no restante do Arcanário.
3. **Cobertura adicionada:** caso E2E dirigido para etiqueta pessoal nova, Enter sem submissão da questão, associação à questão e cores do resumo. **Teste ainda não executado** após o reparo remoto; execução e nova inspeção física pendentes.

A tela branca transitória relatada ao tocar na busca **não tem causa de WebView confirmada**. A remoção da submissão implícita e a clareza da seleção atacam causas plausíveis; somente o Moto G06 poderá confirmar a eliminação do sintoma.

## Integração e dívida preservada

Autorização expressa neste gate para integrar **#43 → #44 → #45 à `main`**, mantendo método de merge com histórico rastreável. PRs não devem ser declaradas completamente testadas. Integrar código não equivale a fechar BF-5.6: D–G permanecem etapas futuras, e o refinamento global ocorrerá antes do encerramento da fase.

A/B/C conservam Dexie v17 e backup v9 no conjunto, com importação v6/v7/v8. **Não há downgrade suportado**, e nenhum teste deve usar dados pessoais para restauração destrutiva. Os FAIL da suíte ampla (1.104 PASS/3 FAIL), E2E Canvas pendente, TalkBack, cargas prolongadas e divergências físicas continuam rastreados no relatório da C. 
