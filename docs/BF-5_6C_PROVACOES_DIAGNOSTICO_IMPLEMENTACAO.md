# BF-5.6C — Provações, Taxonomia e Diagnóstico

08/11/2026. **Candidata para auditoria e gate físico conjunto A+B+C.** Implementação/publicação expressamente autorizadas pelo proprietário; não é aceite, encerramento nem autorização de merge. D–G/BF-6/BF-7 não iniciadas. Sem backend, contas, envio automático, pacote oficial, TCG ou alteração do mundo 3D.

## Base, rastreabilidade e publicação

`git fetch origin` executado antes da implementação; checkout inicial limpo. GitHub confirmou [A/#43](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/43) e [B/#44](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/44) abertas, draft e sem merge. A: `e6b8b2c53adf26779c8e3f9b4cd33a998256c6ea`. Base exata da C: B **76cf4c7328c5d61da57d8d72e6422f99ead18540**, branch **feat/bf-5-6b-arcanario-workshop**. C criada diretamente dessa ponta em **feat/bf-5-6c-arcanario-provacoes**, sem rebase, alteração da main ou descarte de trabalho. PR draft da C terá B como base. [ADR-027](decisions/ADR-027-provacao-taxonomia-diagnostico.md) define o contrato complementar; relatórios [A](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md)/[B](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md) e ADR-020/025/026 preservados.

## Reparos B-R1 e B-R2

Registro humano obrigatório: [comentário de defeitos da B no Moto G06](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/44#issuecomment-6730345156).

**B-R1 implementado tecnicamente:** moldura usa três opções visíveis React com radios nativos embutidos (não picker/dialog Android): Constelação/traços celestes, Herbário/ramos e folhas, Iluminura/ouro geométrico. Nomes, ornamentos, borda/estado selecionado, grupo/legend, foco e teclado; prévia SVG muda imediatamente. O valor permanece em `appearance.frame` somente no rascunho até salvar. Família do Acervo e escolha de revisão também perderam seus `<select>`. Não há `<select>` no Arcanário nem nas novas interfaces C. Sem refatoração dos formulários antigos da Biblioteca. Novos grupos de filtros têm expansão gerida por React e botão `aria-expanded`.

**B-R2 implementado tecnicamente:** “Nome da carta no acervo (opcional)” identifica/busca, sem substituir a frente; frente/verso têm ajuda explícita sobre quando aparecem. Prévia mostra o nome externo e a face. Questões distinguem identificação, enunciado, alternativas e resolução. Não houve migração de título/frente/verso, nem alteração automática de carta existente. Busca, fólio, revisão, histórico e troca v1 preservam as mesmas propriedades.

Testes cobrem três molduras, prévia, rascunho, salvamento/reabertura, edição de carta anterior, saída sem salvar e filtro de família. Causa exata do sintoma WebView/Android **não foi fisicamente demonstrada**. Os reparos aguardam revalidação Moto G06/TalkBack; não declarar defeitos fisicamente encerrados.

## Produto, telas e identidade

| Caminho | Experiência |
| --- | --- |
| `/arcanario/provacoes` | Entrada, quantidade/seleção, filtros ou baralho salvo, histórico/retomada |
| `/arcanario/provacoes/:id` | Enunciado livre, alternativas, confirmação, correção comentada, pausa, resultado e consulta histórica |
| `/arcanario/oficina/nova?tipo=question` e `/oficina/:id` | Questão autoral, alternativas/gabarito, explicação, classificação, metadados, prévia e rascunho |
| `/arcanario/assuntos` | Criar/editar classificações e etiquetas, navegar por caminhos e pesquisar sinônimos |
| `/arcanario/baralhos/novo?tipo=dynamic` e `/baralhos/:id` | Critérios reais e prévia de elegibilidade; estáticos continuam ordenados com revisão fixável |
| `/arcanario/diagnostico` | Período UTC, distintas/repetições, assuntos/habilidades, erros, histórico e exportação |

Novas salas/atalhos integrados ao Portal e navegação existente. Fólio claro com escrita violeta, inscrições douradas, selo de Provações, alternativas amplas e correção textual; papel cresce com o enunciado, sem impor proporção de carta. Diagnóstico conserva o material do arquivo violeta/dourado. Texto longo, rolagem natural, foco, labels, áreas de toque e movimentos reduzidos. Ao iniciar/avançar/retomar, o foco vai ao título da questão para evitar continuar no fim do fólio anterior. Quatro famílias de cartas e seis tipos de registro da Biblioteca preservados. WorldHost, Canvas, ThreeWorldRuntime, câmera e agência não foram modificados. Botão Voltar Android usa o fluxo existente; aceitação física de navegação/lifecycle continua pendente.

## Questões, revisões e rascunhos

`question` continua uma carta global, editada pelo mesmo `ArcanariumWorkshop` transacional. Campos: nome opcional até 160; enunciado/explicação até 16.000; de 2 a 5 alternativas até 4.000; gabarito válido obrigatório; classificação; dificuldade opcional; proveniência; prova/ano/banca/instituição/caderno opcionais. IDs de alternativas não mudam ao reordenar; letras são calculadas pela posição. Remover a correta limpa o gabarito e impede salvar até escolher outra.

Cada edição exige revisão esperada, cria versão completa imutável e preserva anteriores. Conflito conserva todo o texto, classificação e alternativas e oferece conferir a salva e usar explicitamente a revisão atual como base. Rascunho privado é validado por identidade/família, gravado durante a edição e flush ao ocultar/sair; erro de storage tem aviso. Salvar remove o rascunho; sair conserva; descartar não muda carta salva. Não há bytes de imagem em questão nem extensão de ownership: **questões são textuais nesta C**; mídia opcional de apoio não foi incluída. Relicário e retenção de imagens da B permanecem cobertos pelas regressões.

## Taxonomia funcional

IDs/revisões estáveis em `knowledgeTags`; namespace editorial separado das etiquetas pessoais. Criação local: Área → Disciplina → Assunto → Subassunto → Habilidade, um pai do nível imediatamente anterior para filhos. Área não possui pai; etiqueta pessoal não recebe pai editorial. Pesquisa por caminho/nome/sinônimos; seleção múltipla e assunto principal (assunto/subassunto). Sinônimos têm normalização NFKC/espaços/caixa; duplicatas entre irmãos, sinônimos conflitantes, ciclos e referências inexistentes são rejeitados em transação. Conflito de revisão não regrava a classificação.

Não há seed, catálogo fictício, pacote ou conteúdo oficial. Grafos legados válidos continuam legíveis; não são reclassificados pela migração. Não existe exclusão de tags nesta candidata. Sessões fotografam taxonomia completa (IDs, nomes, pais, sinônimos e revisões), conservando o significado de tentativas após renomear/mover classificações. Relatórios separam snapshots/revisões; não interpretam o passado com o rótulo atual.

## Baralhos e seleção

Estáticos: lista única ordenada de IDs, seguindo revisão atual ou fixando versão pela UI. Motor respeita a fixação e exclui arquivadas. Não copia cartas ao associar/retirar de baralho.

Dinâmicos: v1 original continua executável; v2 acrescenta origem, prova/ano/banca, dificuldade, nunca respondidas/com erro anterior/já respondidas, mínimo/máximo de tentativas e quantidade. Área, disciplina, assunto, subassunto e habilidade usam IDs de taxonomia com descendentes. Etiquetas pessoais usam ID exato. **Todos os campos e todas as tags selecionadas combinam por E**; prova/banca são correspondência exata normalizada. “Erro anterior” inclui qualquer erro confirmado, inclusive em outra revisão. Tentativas de sessões pausadas/abandonadas contam; não respondida não gera erro.

Ordenação dinâmica lexical estável por ID, sem aleatoriedade oculta, quantidade entre 1–500 limitada ao acervo disponível; vazio é informado e não inicia. A prévia consulta o estado atual. Iniciar relê na transação, materializa seleção e ordem de revisões e só então grava a sessão. Inclusões/classificações posteriores não mudam a seleção já iniciada. Seleção pura é separada da persistência e testável. Critérios v1 de outras famílias são preservados; Provações usam apenas as questões elegíveis.

## Sessões, correção e retomada

`question_session.trial` v1 guarda revisão concorrente, estado/posição, timestamps, respostas/correções e snapshot editorial. Referências de carta/revisão e versões imutáveis preservam enunciado, IDs/ordem efetiva das alternativas, gabarito, explicação e classificação. O baralho é fotografado por nome/ID/revisão; não é dependência viva para retomar. Placeholders antigos da A sem `trial` continuam preservados e não inventam tentativas.

Motor puro em `domain/provations.ts`; aplicação coordena porta/transação. Resposta exige estado ativo, alternativa existente e posição ainda sem resposta; comando exige revisão atual da sessão. Corrigir grava antes de atualizar React, sem avanço automático. Próximo exige confirmação persistida; na última posição conclui. Falha de disco é erro de persistência, distinto de conflito, com rollback/posição preservados. Gabarito posterior não muda correção histórica. O DTO de resposta **não possui** gabarito/explicação até confirmar.

Estados: em andamento e pausada são retomáveis; pausa conserva inclusive a correção atual. Saída inesperada deixa sessão ativa e reabrível. Concluída e abandonada são terminais, sem novas respostas. Conclusão antecipada separa não respondidas; abandono preserva respostas confirmadas. Resultado consulta cada questão e sua revisão, sem atribuir erro às não respondidas.

## Estatísticas, diagnóstico e relatórios

Por sessão: apresentadas, respondidas, corretas, incorretas, não respondidas, corretas/respondidas (%); zero respostas → sem percentual. Por questão: tentativas, acertos/erros, revisão e histórico de respostas. Por classificação: distintas, tentativas/repetições, acertos/erros, diversidade de assuntos/habilidades e tendência quando cabível.

Totais contam cada tentativa uma vez, mesmo com várias tags. Distribuições sobrepostas não são somáveis. Distintas usam o ID global através de revisões; repetições = tentativas − distintas. Menos de cinco distintas é comunicado como evidência insuficiente (limiar descritivo, sem precisão estatística). Tendência compara metades cronológicas somente com três IDs distintos em cada metade e datas diferentes; não representa causalidade, domínio ou aprovação. Orientações apontam assuntos com erros, poucos dados, sem prática e questões que merecem revisão com contagens reais.

Exportação explícita: `biblioteca-viva-learning-report` JSON **v1** e CSV UTF-8 com BOM, aspas/escape e proteção contra fórmula. JSON conserva período UTC, geração, totais, sessões, questões/tentativas/revisões, classificações históricas, taxonomia atual e limitações; CSV resume assuntos. Totais por tentativa/assunto respeitam o período; sessões listadas intersectam esse período e mostram suas estatísticas integrais. Arquivo educacional é separado do backup pessoal. Nenhum resultado é transmitido automaticamente; destino é escolhido no fluxo do sistema/download. Plugin Android agora aceita nomes previstos de baralho/relatório e MIME JSON/CSV, preservando a restrição do nome de backup e sem permissões amplas.

## Persistência e compatibilidade A+B

Dexie **v17**, mesmas tabelas/índices v16; upgrade transacional atualiza somente marcador e preserva linhas/bytes anteriores, sem limpeza. Campos/contratos novos são opcionais nas estruturas antigas. Backup **v9**, importa originais **v6/v7/v8**, checksum SHA-256 canônico antes de transformação, grafo/revisões/snapshots/resultados/mídias validados, replace protegido e rollback após clear. Limite **10 MiB**, falha explícita sem truncamento. Retenção de versões e snapshots pode consumir esse limite. Sem downgrade garantido/suportado.

Fonte canônica e mapa de flashcards da A, fólio, links/tombstones, imagens/ownership, Ecos e Relicário da B preservados. Troca autoral **v1 não muda**: exporta/importa Ecos/lembranças; questões não são introduzidas silenciosamente nesse envelope. Questões/Provações/histórico são recuperáveis pelo backup v9. Sem novo instalador ou pacote da D.

## Verificação e resultados

Somente bancos/origens descartáveis e dados fictícios. Nenhum dado pessoal foi limpo/restaurado. Zero retries e nenhum timeout/assert removido ou ampliado.

| Execução | Resultado |
| --- | --- |
| Domínio/B/React inicial | 28 PASS / 4 arquivos |
| Nova integração + React, durante desenvolvimento | 23 PASS / 3 FAIL; duas expectativas de apresentação/lookup e uma falha real de rascunho corrigidas |
| Após reparo do rascunho/nomes | 17 PASS / 2 arquivos |
| Regressão dirigida A+B+C/arquivos/backup/fólio | **103 PASS / 17 arquivos** |
| Rodada ampla única | **1.104 PASS / 3 FAIL / 1.107 testes / 170 arquivos** |
| Dirigida final após expansão React/MIME | **40 PASS / 6 arquivos** |
| Persistência final com erro de disco distinto de conflito | **8 PASS / 1 arquivo**, sobreposto à dirigida |
| Domínio/persistência após esclarecimento do período | **17 PASS / 2 arquivos**, sobreposto |
| React após foco no início de cada questão | **9 PASS / 1 arquivo**, sobreposto |
| E2E A + B + C, rodada estável | **6 PASS / 2 FAIL** |
| E2E dirigido de filtros após correção + Canvas | 0 PASS / 2 FAIL, causas discriminadas abaixo |
| E2E final central da C | **1 PASS**, 10 questões, pausa/reload, 50%, JSON/CSV, paisagem |

Os três cenários novos da C têm PASS entre execuções; são **7 cenários distintos PASS entre os 8 dirigidos**, sem arredondar rodadas sobrepostas como uma suíte única verde. O E2E de Canvas permanece pendente.

Falhas novas/intermediárias:

- Rascunho da questão: cleanup de efeito podia gravar texto anterior depois da gravação nova. Corrigido para usar referência do estado mais recente; conflito/recuperação dirigidos PASS. Expectativa de atributo de moldura tornou explícito `data-frame` na gravura; separação textual da letra/alternativa corrigiu nome acessível. Erros de tipos/lint dos testes corrigidos sem casts cegos/ignores/desativação de regra.
- Primeira execução E2E foi iniciada por engano enquanto o build substituía `dist`: servidor preview falhou por ENOENT e os oito cenários falharam/ficaram sem conexão. Registrada como falha de preparação do agente, não evidência de regressão nem PASS. A execução seguinte começou após conclusão do build.
- E2E de filtros encontrou grupo nativo fechado depois do clique; grupos novos foram substituídos por expansão React com `aria-expanded`. Teste seguinte avançou até pausa. O reload do teste precedia o fim da navegação assíncrona e reabria a própria sessão pausada (respostas preservadas); adicionada espera pela tela de Provações antes do reload, sem mudar timeout/assert funcional. O cenário completo então PASS em 9,5 s.
- Ampla: dois testes da Oficina esgotaram a espera de navegação para “Editar na Oficina” (um preexistente e o novo de molduras); dirigidas correspondentes PASS. Não declarar a ampla aprovada nem atribuir causa sem evidência.
- Ampla: timeout de **5 s no envelope da Aryn**, não da Ytha nesta execução. Runtime/animação não modificados. É uma falha observada nesta candidata na classe de suíte que já possui dívida de timeout; não declarar a causa igual à histórica da Ytha. Sem segunda ampla para buscar verde.
- E2E de residência B: primeira rodada estável não encontrou Canvas no prazo; execução dirigida posterior chegou ao Canvas mas esgotou na navegação Coleção. As duas falhas e pontos distintos permanecem registrados, sem atribuição causal/ajuste de timeout/retry ou mudança especulativa de Three. Preservação física do Canvas/retorno exige o gate conjunto.

Formato, lint, tipos, áudio, build e relatório de performance executados com PASS; warning de chunks >500 kB permanece. Relatório estático não mede CPU/GPU/FPS Android. Empacotamento Android, conferência final de assets/hash e referência final de publicação são registrados no complemento de proveniência abaixo. **Sem CI global verde**, sem novo workflow remoto caro; publicação com `[skip ci]` conforme política de cota vigente. Falhas históricas BF-5.5/CI/TalkBack/memória/termal permanecem separadas e abertas.

## Evidências visuais

Capturas Chromium de produção, dados fictícios, 390×844/844×390, movimento reduzido. Inspeção visual pelo agente não equivale a aceite artístico/Android. Capturas de página inteira mostram o dock fixo na posição do viewport original; a página continua rolável e os controles têm espaço de fim.

- [Molduras e campos da Oficina](audits/evidence/bf56c/molduras-retrato.png).
- [Editor/prévia de questão](audits/evidence/bf56c/editor-retrato.png).
- [Taxonomia autoral](audits/evidence/bf56c/taxonomia-retrato.png).
- [Filtros dinâmicos](audits/evidence/bf56c/filtros-retrato.png).
- [Resolução em fólio](audits/evidence/bf56c/provacao-retrato.png).
- [Correção comentada](audits/evidence/bf56c/correcao-retrato.png).
- [Resultado](audits/evidence/bf56c/resultado-retrato.png).
- [Diagnóstico retrato](audits/evidence/bf56c/diagnostico-retrato.png) e [paisagem](audits/evidence/bf56c/diagnostico-paisagem.png).

## APK debug e proveniência

Empacotamento consolidado A+B+C em andamento na sequência desta implementação. O complemento final registrará commit produtivo exato, comando/resultado Android, tamanho, SHA-256 e conferência dos assets. Não distribuir um APK anterior da B como se fosse C. Nenhum APK/keystore é versionado, nenhuma release é criada e nenhuma instalação em base pessoal é executada pelo agente.

## Roteiro Moto G06 — gate conjunto A+B+C

1. **Segurança antes da atualização:** no APK instalado exportar o backup atual (v6/v7/v8 conforme sua versão), guardar externamente e conferir acesso. Registrar tamanho/hash e commit do novo APK. Atualizar sem desinstalar/limpar dados. Não fazer downgrade de banco. Testes de restore destrutivo somente em instalação/base descartável, com estratégia de recuperação.
2. **Migração/integridade:** conferir contagens e conteúdo dos seis tipos de registro, notas/citações, sessões, fichas/planos, avaliações e capas. Estudos/flashcards anteriores devem conservar frente/verso, vínculos e edição canônica; não pedir reset.
3. **B-R1/B-R2:** Oficina → Eco; preencher nome diferente da frente/verso. Selecionar as três molduras sem janela nativa/tela branca; verificar prévia imediata e rascunho intacto. Sair/reabrir sem salvar, conferir recuperação; descartar e verificar salva intacta; repetir salvando e reabrindo/editar carta anterior. Conferir ajuda contextual e diferença nome/frente/verso. Usar família no Acervo, revisões, teclado externo e TalkBack se disponível; foco e estado selecionado devem ser anunciados. Relatar causa/sintoma persistente sem declarar confirmação apenas por Chromium.
4. **Regressão A+B:** criar/editar Eco pela Oficina e pelo fólio, compartilhar em dois baralhos, reordenar/fixar revisão/retirar de um, revisar Ecos com pausa/reabertura/histórico. Criar lembrança com imagem local, editar/moldura e consultar revisão anterior no Relicário. Exportar/importar baralho v1 como cópia. Exclusões somente de registros fictícios.
5. **Taxonomia:** criar Área, Disciplina, Assunto, Subassunto e Habilidade reais de sua escolha e etiqueta pessoal; pesquisar sinônimo, navegar caminho e escolher assunto principal/múltiplas tags. Tentar duplicata/ciclo/pai inválido (se o fluxo permitir), esperar rejeição sem perda. Não é preciso instalar catálogo.
6. **Questões:** criar dez questões fictícias com 2–5 alternativas, marcar gabarito, explicar/classificar e preencher prova/ano/banca. Nome deve ser distinto do enunciado. Reordenar/remover/adicionar alternativas, conferir gabarito e prévia. Sair inesperadamente no rascunho e recuperar; salvar, reabrir, editar e arquivar uma questão de ensaio. Conferir que questões são textuais nesta versão.
7. **Baralhos:** estático com ordem/revisão fixada; dinâmico com área/assunto/tags + prova/ano/banca + dificuldade. Conferir combinação por E, vazio, limite maior que acervo, nunca respondidas, com erros e limites de tentativas. Iniciar com dez disponíveis, anotar seleção; novas questões/classificações não podem entrar silenciosamente na sessão já iniciada.
8. **Provação:** responder certa/errada; nenhum gabarito/explicação aparece antes da confirmação. Após confirmar conferir escolhida/correta/resolução e impedir nova resposta. Avançar, pausar, sair pelo dock/Voltar, pôr em segundo plano e fechar/reabrir aplicativo; retomar mesma posição/revisão/ordem, sem duplicação. Editar gabarito da carta fora da sessão e confirmar histórico original intacto. Testar conclusão normal, antecipada/não respondidas e abandono em sessões fictícias.
9. **Diagnóstico/arquivos:** conferir apresentadas/respondidas/certas/erradas/não respondidas/%; repetir uma questão e verificar distinta permanece uma, tentativas/repetições aumentam. Uma questão com várias tags não multiplica total. Verificar poucos dados e orientações justificadas, histórico por revisão, renomear assunto e comparar sessão antiga. Exportar JSON/CSV por ação explícita, cancelar uma exportação e abrir os arquivos no destino escolhido. Conferir v9 de segurança após atualização; restore somente em base descartável.
10. **Ergonomia/arte:** retrato/paisagem, teclado aberto, texto/enunciado muito longo, texto ampliado, alto contraste/redução de movimento, toque/foco/TalkBack. Verificar acesso a alternativas/botões e fim da página com dock. Voltar à Biblioteca e conferir mesmo contexto/câmera/Canvas, fluidez percebida, ausência de tela branca e apreciação artística. Registrar PASS/FAIL por grupo e capturas de defeitos; Playwright não substitui esse gate.

## Limitações e pendências antes de integrar

- Questões textuais; imagem opcional não implementada. Troca autoral v1 continua limitada a Ecos/lembranças; backup v9 é o caminho de recuperação completa.
- Taxonomia local sem exclusão/catálogo oficial. Diagnóstico é descritivo, com limiar/limitações explícitos; não oferece nota oficial, proficiência ou aprovação. Período usa UTC; estatísticas de sessões listadas são integrais.
- Retenção histórica deliberada e limite monolítico de 10 MiB; nenhum downgrade.
- Ampla FAIL e E2E de Canvas pendente como descritos. Dívidas anteriores não encerradas. Avaliação de texto ampliado/alto contraste/teclado, Android Back, segundo plano, áudio percebido, TalkBack, termal/memória sustentada e fluidez/artes exigem evidência física humana; não foram certificadas pelo agente.
- Auditoria da PR C, gate físico A+B+C e aceite explícito do proprietário. Integração A → B → C somente em operação posterior autorizada, corrigindo bases conforme necessário. Não fazer merge nesta missão nem iniciar D.
