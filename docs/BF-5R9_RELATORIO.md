# BF-5R9 — Auditoria Final, Polimento e Identidade Android

Data: 2026-11-04. Branch `feat/bf-5-uiux-global-rework`; PR #20 aberta e draft, sem merge. Checkout inicialmente limpo, fetch e fast-forward sem novos commits. SHA inicial efetivo: `502514c8cbc2899e581ffcde471143328c7a6295`. SHA final de código e assets auditados: `b2bc0aa65f72f915af4931b4169da807946ebd9a`. O commit documental posterior apenas consolida resultados e não muda o APK; SHA do topo documental é informado na entrega/PR.

## Auditoria R8 e reparos

| Área | Classificação e evidência | Resultado |
| --- | --- | --- |
| Capa anterior ao bundle | Comportamento correto: HTML/CSS inline antes do módulo; estados reais de banco e montagem, sem porcentagens ou duração mínima | Aparência preservada |
| Falha de renderização durante abertura | Defeito: boundary não completava a capa e a recuperação podia ficar encoberta | `componentDidCatch` completa a capa; erros de chunk ficam contidos na área de rotas, conservando dock e mundo residente |
| Entrada direta em rota secundária | Risco fundamentado: effect no shell removia capa mesmo com destino suspenso | Sinal de conclusão dentro do subtree Suspense, após commit do destino |
| Saída da capa | Comportamento correto: dois RAFs, opacidade, pointer-events e fallback sem transitionend; risco pequeno de listener/timer retido até fallback | Cleanup cancela timer e remove listener; testes cobrem saída normal e movimento reduzido. RAF suspenso em background prossegue ao retorno, não reabre capa |
| Code splitting | Comportamento correto: imports locais, cache nativo de módulos, preload oportunista e rejeição do preload contida | Todos os sete loaders preservados. Recuperação explícita por recarga quando React.lazy conserva uma rejeição; tentar remontar sozinho não garante recuperar chunk rejeitado |
| Recuperação de rota | Risco fundamentado: boundary global desmontava também mundo e dock | Boundary localizado, resetado por pathname, com Fragment para preservar seletores diretos e animações aprovadas |
| WeakMap de conteúdo da Coleção | Defeito de apresentação comprovado: snapshot antigo reaparecia antes da consulta, inclusive após exclusão/restauração; sem invalidação de escrita | Removido cache de conteúdo. Cada montagem aguarda entradas/etiquetas canônicas em paralelo. Snapshot vinculado à aplicação evita mistura entre instâncias; cleanup ignora resultado tardio |
| Concorrência na Coleção | Comportamento correto: guarda `active` impede publicação após desmontagem | Preservada. Não introduz assinatura live/polling; alterações externas enquanto a página fica montada continuam fora do contrato |
| Haptic em pointerup | Regressão semântica: liberação pode não produzir click; supressão temporal podia consumir ativação seguinte no mesmo controle | Pulso somente no click confirmado, sem janela de 800ms nem debounce. Pressão visual ainda limpa por movimento/cancelamento/liberação. Mouse/teclado seguem semântica de clique; desabilitados e aba corrente excluídos |
| Ponte nativa | Risco fundamentado: rejeição assíncrona tratada, exceção síncrona não contida | Ambas contidas; fallback opcional sem impedir ação |
| Runtime e lifecycle | Comportamento correto nos caminhos inspecionados: RAF coalescido, mundo pausado fora da aba, resize/projeção já protegidos em R7, seleção atualizada para animados | Sem mudança no runtime, DPR, iluminação, animações, pan/pinch ou picking |
| Engasgos físicos ocasionais | Hipótese não comprovada quanto à causa: relato humano confirma sintoma, não identifica etapa CPU/GPU | Não declarado resolvido nem convertido em justificativa para refatoração |

Armazenamento com rejeição segue para fallback controlado em `main`; erro da consulta da Biblioteca completa a capa. Nenhum timer decide que banco ou mundo está pronto. Não se promete recuperação de um bundle principal que nem execute ou de uma operação externa que nunca resolva; não se adicionou watchdog arbitrário. Android Back conserva listener com remoção inclusive se registro nativo resolver após desmontagem. Foco principal, `aria-live`, reduced motion e alternativa semântica permanecem; TalkBack exige aparelho.

## Otimizações novas: zero de até três

A inspeção não sustentou uma nova alteração independente com benefício proporcional comprovável. Projeção, resize, residência, RAF e publicação diagnóstica já têm proteções R5/R7. `inhabitantAgency.getSnapshot` devolve snapshot existente; não se confirmou reconstrução por chamada. Não alterados frequência de animação, overlays narrativos ou modelos. Não há nova medição física de latência/FPS. Os reparos acima corrigem integridade e recuperação, não são apresentados como otimizações de velocidade.

Evidência antes/depois dos reparos: conteúdo antigo antes da revalidação passa a nenhum conteúdo reapresentado; pulso em pointerup sem click passa a zero; timer de saída pendente após transitionend passa a zero. Asserções determinísticas nos testes R9, sem percentuais ou milissegundos de ganho inventados. Retirar cache pode tornar visível o carregamento canônico ao retornar à Coleção: troca deliberada em favor da integridade. O fallback de recuperação só aparece em falha real.

## Arte e ícone

Paleta, CSS, ornamentos, canvas fullscreen, pátio e narrativas preservados; nenhuma alteração em domínio, schema Dexie v9, backup v6 ou preferências. Aprovação artística R6 e resultados físicos positivos de R7/R8 são relatos do proprietário no pedido; não constituem aprovação física desta candidata.

Novo selo original: códice aberto marfim/latão, chama lilás com núcleo luminoso como portal entre páginas, fundo ameixa e estrelas. Fonte e processo: [assets/android-icon/README.md](../assets/android-icon/README.md), gerador Python e SVGs editáveis. Paths compartilhados com VectorDrawable; Android adaptive normal/round v26, monochrome v33, dez mipmaps legados nas cinco densidades. Manifesto já apontava para os recursos corretos. Sem imagens externas ou dependência permanente nova. [Prancha](evidence/bf5r9/icon-preview.png) inclui integral, circular, monocromático e miniaturas. Inspeção visual automatizada/local, aprovação humana pendente.

## Verificações e entrega

- Format:check, lint amplo e lint dirigido final, TypeScript, áudio, build web e performance:report: PASS. Entry inicial final: 631.317 bytes; ThreeWorldRuntime: 731.479 bytes. Warning de chunks >500 kB permanece; tamanho não mede fluidez.
- Unitários amplos: 726 PASS / 1 timeout em 96 arquivos (55,09 s), antes dos testes novos R9. Falha de 5 s no teste de encontros/autonomia de `inhabitantAgency`, mesmo nome da R7. Execução do arquivo dirigido também falhou por timeout (6 PASS / 1 FAIL), ainda com E2E concorrente: não prova causa ambiental nem correção. Runtime/agência não alterados.
- Unitários finais dirigidos: 21 PASS em cinco arquivos; após ajuste de landmark/Fragment da recuperação, App/boundary novamente 6 PASS. Nenhum teste removido ou limite aumentado. Gate unitário global continua vermelho.
- E2E final dirigido: 2 PASS (26,7 s), cobrindo transição, ausência de blur, pressão, overflow, falha de chunk/capa, recarga e navegação offline com chunks já carregados. O teste antigo exigia `sanctuary-arrive`; atualizado para a animação R6 `illuminated-page-arrive`, preservando asserts. Primeiro teste R9 isolado também PASS.
- Android sync e APK debug: PASS. Primeiro build incremental falhou ao resolver foreground após remoção do template qualificado; reconstrução `:app:clean assembleDebug` PASS (26 s) e dois builds incrementais seguintes PASS (6 s cada). Extração `aapt2` confirma três camadas adaptive no APK. Regeração de ícones comparada duas vezes por SHA, idêntica; sem dependência nova no aplicativo.
- APK local não versionado: `android/app/build/outputs/apk/debug/app-debug.apk` (aproximadamente 5,1 MiB). SHA-256: `b00202d224fc12ba098f2a9d453496b7b1cf9917a30a7201f0f5a2bba82b3221`.
- Nenhum aparelho ADB conectado. Não executados instalação, launcher físico, TalkBack, áudio percebido ou benchmark Moto G06.

### E2E amplo e triagem

Uma execução ampla: **20 PASS / 27 FAIL, 47 cenários, 15,9 min**, sem retries. [Inventário com comparação R7](evidence/bf5r9/e2e-inventory.json). Iniciou antes da correção final do landmark/Fragment e da adição do teste R9; os testes dirigidos finais cobrem essas alterações, sem repetir a ampla inteira. Não há gate global verde nem garantia de ausência de regressões.

A maioria das falhas tem nomes já FAIL no inventário parcial R7, sem prova de causa idêntica. Exemplos triados: shell exige banner ocultado pela direção fullscreen; fluxo principal espera `Compartilhar citação`; treino não observa execução registrada (já FAIL R7; causa não resolvida); ambiente expirou capturando canvas com fixture pronta. Nenhuma dessas falhas é simplesmente rotulada como problema do runner. Teste de animação R2 teve fixture obsoleta corrigida e PASS dirigido final.

**Novas falhas versus PASS do inventário parcial R7:** residência/rotação (`bf5r5-experience`) e entrada/diálogo (`bf5r5-world-input`), ambas por limite global de tempo. Não existe baseline amplo R8 executado neste checkout; não se pode atribuir causalmente à R9 nem declará-las aceitas. Cenários sem correspondência no inventário parcial não são chamados de regressões comprovadas. Checagem dirigida única, sem outro Chromium/suíte concorrente: **2 PASS em 53,8 s** (25,7/26,5 s). Isso confirma os dois caminhos nesta execução, mas não demonstra que a contenção foi a única causa nem torna verde a ampla. Não houve mudança no runtime, asserts, retries ou timeouts. Dois FAIL de `reading-area` (retornos e seis tipos) não têm resultado correspondente no inventário parcial R7; permanecem sem classificação causal conclusiva.

### CI e limites

CI anterior [41788653118](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41788653118): conclusão API **cancelled**, após aproximadamente 20 min; checks da PR a apresentavam como fail. Etapas até bundle/performance passaram; não há aprovação E2E integral. Não se converte cancelamento em verde. A CI R9 do SHA documental `d20d4e39c6acf5011c3b03f166ecea2a840ad36d`, [run 41805229003](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41805229003), também terminou **cancelled** em aproximadamente 20 min, durante E2E com falhas já registradas. Format, lint, tipos, **732 unitários em 97 arquivos**, áudio, build e performance PASS nessa execução remota. O teste de agência que expirou localmente passou remotamente em 3,19 s; isso não apaga o timeout local nem comprova causa única. Os E2E remotos não completaram os 48 cenários configurados (incluindo o novo R9); não há total final PASS/FAIL remoto nem CI verde. A consolidação documental posterior não altera código/APK e pode iniciar uma nova execução; o estado do topo fica informado na PR.

### Parecer de prontidão

| Categoria | Estado |
| --- | --- |
| Implementação R9 | Auditoria/reparos e recursos Android entregues; zero otimizações especulativas |
| Arte fisicamente aprovada | Identidade R6 e resultados anteriores de canvas/pan/pinch/scroll pelo proprietário |
| Verificações técnicas aprovadas | Format, lint, tipos, áudio, bundle/web, sync, APK, dirigidos descritos e diff-check |
| Ressalvas aceitas nesta rodada | Nenhuma; aceites BF-4 não autorizam automaticamente falhas BF-5 |
| Pendências bloqueantes de aprovação integral | Unitário global vermelho, E2E global vermelho e investigação das falhas; avaliação física final e ícone, TalkBack separado |

**Parecer:** pronta como candidata documentada para avaliação do proprietário, não pronta para declaração de fechamento técnico integral. BF-5 aberta, sem merge ou aceite presumido.

## Prontidão e roteiro físico final

BF-5 permanece aberta. Implementação entregue não equivale a fase encerrada. Identidade anterior fisicamente aprovada; ícone, reparos e fluidez R9 precisam de avaliação do proprietário. Falhas globais não recebem aceitação implícita.

No Moto G06, instalar sobre a versão existente sem limpar dados e preservar backup. Usar registros fictícios para alterações:

1. Abertura fria: capa imediata, rótulos coerentes, saída quando utilizável; repetir após fechar processo.
2. Pan, pinch, pinch→pan e seleção; quests, escolhas e diário, sem seleção involuntária ou perda de foco.
3. Alternar cinco abas e voltar ao mesmo mundo; primeira e segunda visita; Coleção, scroll convertido de toque, detalhes e Back Android.
4. Toques rápidos/repetidos, scroll/cancelamento sem vibração, teclado e controles desabilitados; observar separadamente ação e pulso físico.
5. Criar/editar dados fictícios nos seis tipos; confirmar retorno com informação atual, excluir fictício e confirmar ausência; treino/histórico, notas, citações e sessões.
6. Segundo plano/retorno, teclado aberto e rotação retrato/paisagem; verificar viewport e continuidade.
7. Ícone na tela inicial/gaveta, máscara circular, outra máscara disponível e ícones temáticos; reconhecer livro/chama em tamanho pequeno.
8. Registrar jank, aquecimento e estabilidade em sessão sustentada. TalkBack em registro separado: não executado nesta sessão.
