> **Contrato de cartas atualizado pela BF-5.6A candidata:** armazenamento global e projeção no fólio substituem a lista local editável; foco/tempo/estilos preservados. [ADR-025](decisions/ADR-025-arcanario-fundacao-persistencia.md) · [migração e compatibilidade](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md). A descrição original abaixo registra a Parte 2B.

# BF-5 — Parte 2B: fólio de Estudo, pomodoro e flash cards

Data: 2026-11-04. **Candidata de implementação; BF-5 e issue #24 abertas. Sem merge automático ou aceite artístico/físico.**

## Base e escopo

Checkout inicial limpo. `origin/main` sincronizada e `main` local avançada somente por fast-forward até `f35258cfc58ce62396668013533954950a994c4b`. O fólio de livros/documento Parte 2 ainda estava exclusivamente na [PR draft #25](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/25). O proprietário escolheu explicitamente partir dessa entrega: `feat/bf5-parte2b-estudo` tem base `5fcc7ec65094255515ab44e4891ff8a8b5b1fc4e` e PR encadeada à `feat/bf5-parte2-folio-leitura`. `main` permanece preservada.

Lidos AGENTS, STATUS, README, UX, Parte 2, índice de decisões, ADR-014/015, contratos de dados/Android/testes/arte/desempenho e issue #24 (sem comentários). Inspecionados rota, painéis, casos de uso, sessões, repositórios, schemas, backup e testes. O pedido atual autoriza implementação desta experiência; textos históricos de planejamento não revogam essa autorização.

A Parte 2B muda o detalhe de **Estudo** e os contratos necessários ao foco/cartas. Preserva o livro da Parte 2, seis tipos, organização/anotações anteriores, dados, mundos/Three.js, RPG, habitantes, quests, versão do pacote e serviços locais. Não há backend, conta, sincronização, dependência npm nova, XP, moeda ou streak.

## Experiência entregue

`EntryDetailPage` encaminha Estudo a `StudyDetailPage`, com uma única folha de marfim/ameixa/tinta/latão. Ordem: identidade compacta (título, área/disciplina, objetivo e status), foco circular, acumulado, caderno, grimório e ações secundárias. Em paisagem, texto/configuração de foco e anel dividem a largura; em retrato seguem no fluxo. Não são usados os cards de detalhe antigos.

- **Foco:** anel SVG e tempo central `mm:ss`; escolha 15/25/45 minutos; iniciar, pausar, retomar, encerrar/registrar e reiniciar com confirmação de descarte da sessão aberta. Botões touch, erro e confirmação após commit. Outra sessão global bloqueia início e oferece link para o registro correto. Sessões antigas sem limite continuam legíveis e usam tempo crescente, sem reinterpretar seus dados.
- **Acumulado:** soma segundos das sessões concluídas com o baseline de horas anteriores não representadas no histórico. A captura do baseline evita duplicar dados antigos ou arredondar novamente novos focos. O marcador da meta mantém seu contrato anterior (minutos inteiros para horas), com separação textual clara. Meta atingida não impede estudar mais; o progresso satura e o histórico guarda a duração integral.
- **Caderno:** área pautada confortável e persistência original de notas/citações, consulta, edição, exclusão confirmada e compartilhamento textual. Rascunhos das duas modalidades permanecem durante alternância; guard em links, unload e Back Android. A normalização textual das anotações permanece a já existente; não se introduziu editor rico.
- **Grimório:** criar/editar/excluir cartas com frente e verso, lista recolhível e rodada embaralhada. Flip revela o verso; avanço introduz a próxima carta por deslizamento lateral. “Lembrei” e “Rever depois” só habilitam após revelar. Fechamento mostra balanço da rodada e permite revisitar as cartas a rever. Escolhas não geram progresso fictício nem persistem uma pontuação. Cartas longas conservam o conteúdo em área rolável.
- **Secundárias:** histórico consultável e notas de sessão editáveis; duração não é digitada na tela de Estudo. Favoritos, etiquetas, estado e unidades não temporais permanecem acessíveis. Exclusão do registro mantém confirmação e informa remoção de notas, citações, sessões e cartas; texto escuro e fundo rosado explícitos corrigem o baixo contraste.

`study-folio.css` tem responsabilidade local. Foram retirados do detalhe genérico apenas os ramos de Estudo substituídos pela nova rota; outras categorias mantêm sua composição. Os painéis reutilizados recebem apresentação contínua apenas nesta folha. Campo pautado e tabs possuem seletores locais suficientes para prevalecer sobre o CSS legado. Dock permanece recolhido durante foco no formulário, incluindo botão de envio. Movimento reduzido do sistema e da preferência do app eliminam a transição das cartas. Foco visível, rótulos e controles textuais acompanham a apresentação.

## Timer em segundo plano

Contrato completo na [ADR-016](decisions/ADR-016-estudo-folio-pomodoro-cartas.md).

A contagem não depende de `setInterval` executar em primeiro plano. A sessão grava `activeSince`, segundos acumulados, status e `focusDurationSeconds`. O domínio deriva o tempo desses timestamps e o limita ao foco. Pausar materializa os segundos já decorridos; retomar grava nova origem temporal. O intervalo React apenas redesenha o mostrador.

Retorno por `visibilitychange`/`@capacitor/app` `appStateChange` reconsulta sessão, histórico e registro; montagem após término do processo faz a mesma consulta. Um foco de 25 minutos retomado duas horas depois continua valendo **25 minutos**, não duas horas. O ciclo encerrado fica em zero aguardando **Registrar foco**; descanso não é contado nem iniciado automaticamente. A conclusão é idempotente inclusive entre instâncias do caso de uso e confirma sessão/progresso/atividade/marcos na mesma transação. Eventos saem após commit. O indicador global reconhece foco terminado aguardando registro.

Não se adicionou foreground service, wake lock, alarme exato ou permissão: não é necessário manter CPU ativa para reconstruir o intervalo já delimitado. **Não há notificação, som ou alarme com tela desligada.** A gravação final do histórico acontece quando o usuário registra, incluindo após retornar. O fluxo mínimo adotado é duração de foco configurável, com descanso voluntário fora da sessão, sem temporizador de descanso separado.

Limite do relógio: mudanças manuais no horário do aparelho afetam timestamps civis. Avanço pode encerrar o foco; retrocesso anterior à sessão impede uma mutação temporal inválida até o relógio voltar a uma cronologia válida. Isso não limpa dados e não constitui duração monotônica garantida entre reboots. A continuidade/recuperação foi simulada tecnicamente; Android real/Doze ainda precisam de validação humana.

## Persistência e compatibilidade

Dexie **v10 aditiva**, mesmas nove tabelas/índices v9, upgrade apenas do marcador e sem limpar/transformar linhas. Necessária para cumprir a regra de versionar alterações de contrato persistido. Backup **v6 mantido**, usando os schemas estritos, checksum e restauração protegida existentes.

| Campo opcional | Contrato |
| --- | --- |
| `StudyEntry.flashCards` | Lista de `{id, front, back}`; IDs únicos; frente/verso obrigatórios com quebras de linha preservadas. Até 1000 cartas; ID 160 caracteres, frente 4000 e verso 8000. |
| `StudyEntry.studyTimeBaselineSeconds` | Inteiro não negativo, capturado uma vez: para horas, `max(0, progressCurrent * 60 - soma anterior das sessões concluídas)`; outras unidades, zero. Ausência em registros antigos usa a mesma fórmula como fallback de leitura. |
| `StudySession.focusDurationSeconds` | Inteiro 60–10800 segundos. Ausência preserva sessões antigas sem limite. Acumulado persistido não pode exceder o limite presente. |

`SaveFlashCard`/`DeleteFlashCard` usam porta de registros e transação, com mutação de domínio validada; React não acessa Dexie. Edição/organização preservam os campos opcionais. Excluir o estudo também remove suas cartas embutidas. Excluir sessão retira seus segundos do acumulado, preservando o marcador de progresso anterior e o baseline já capturado, conforme explicado na interface.

Backups v6 anteriores, sem os campos, continuam aceitos; round-trip dos novos campos é coberto. Aplicativo antigo pode rejeitar campos novos e não suporta downgrade de banco v10 para v9; não instalar versão antiga sobre esta candidata esperando reversão automática. Nenhuma migração espacial ou mudança de versão do pacote foi feita.

## Verificação real

Rodada unitária final dirigida: **94 PASS / 15 arquivos**, incluindo sessões/concorrência/limite/pausas/reabertura, baseline sem arredondamento recorrente, flash cards/rollback/evento pós-commit, upgrade v9→v10, compatibilidade e restauração de backup v6, migrações anteriores/seis tipos, schemas, preferências, lifecycle, revisão React, regressão do livro, App e fronteiras arquiteturais. Uma rodada anterior de 38 testes de persistência/backup também passou; não somar execuções repetidas como cobertura distinta.

Rodada E2E final: **2 PASS em 16,1s**, sem retries ou mudança de timeout. Cobriu criação de estudo, pausa e reload, avanço de relógio sem executar cada tick, outra página em primeiro plano, retorno/reload, limite de foco, registro único, ausência de campo de horas, nota/reabertura, campo pautado legível, cartas/criação/edição/reload, flip concluído, animação lateral, revisão, contraste da exclusão (>=4,5:1 e opacidade 1), cancelamento da exclusão, ausência de overflow em 390×844/844×390 e movimento reduzido sem transição. A simulação não atesta tela desligada nem comportamento de fabricante Android.

Resultados intermediários, sem ocultar falhas:

- Primeiros dois E2E falharam no setup por nome incorreto do campo de título (`Título (obrigatório)`; nome real `Título`). Corrigido o seletor do teste sem alterar assert de produto.
- Rodada seguinte: 1 PASS / 1 FAIL. Fluxo funcional/contraste/orientações passaram; o assert final encontrou regra global de movimento reduzido impondo duração residual `1e-06s`. A regra local foi corrigida para transição realmente ausente; assert `0s` preservado e aprovado na final.
- Inspeção das capturas revelou textarea escuro por precedência de CSS legado. Seletores locais corrigidos e E2E passou a exigir tinta legível e fundo pautado. Sem refatoração global às cegas.
- Teste novo de cleanup nativo inicialmente verificou microtask cedo demais devido a Promise aninhada no mock. Simplificado o mock para retornar o handle uma vez; asserção de remoção preservada e PASS. Ajustes de lint/tipos em código novo foram resolvidos antes dos gates finais.

**PASS:** lint, format:check, TypeScript (incluído no build), build, audio:check, performance:report, android:sync, android:build:debug e `git diff --check`. A suíte unitária/E2E ampla acumulada não foi repetida localmente, conforme pedido. Nenhuma asserção foi removida, timeout ampliado, retry acrescentado ou erro mascarado. A CI remota e dívidas #21/#22/#23 não são declaradas resolvidas ou verdes por esta validação dirigida.

APK: `android/app/build/outputs/apk/debug/app-debug.apk`, **5.777.212 bytes**, SHA-256 `1af077f00e87553479f005f8b95741934b5fcb05c279ec3ce89232212f8de84d`. Gerado e não instalado. Warnings conhecidos de `flatDir` e chunks >500kB permanecem; relatório estático aponta 636.581 bytes no entrypoint JS inicial, sem medir FPS/fluidez física.

Capturas fictícias inspecionadas: [retrato](evidence/BF-5P2B/estudo-retrato.png), [paisagem](evidence/BF-5P2B/estudo-paisagem.png) e [verso de carta](evidence/BF-5P2B/cartas-verso.png). Full-page conserva overlays fixos na posição do viewport da captura; não equivale a sobreposição permanente de conteúdo durante rolagem. Arte, teclado Android, TalkBack, ampliação de texto, pressão de memória e fluidez ainda não têm aceite humano nesta entrega.

## Roteiro curto — Moto G06

1. Preservar um backup anterior e atualizar pelo APK candidato, sem limpar armazenamento. Reabrir estudo antigo, confirmar marcador/horas anteriores, notas e histórico; conferir que o livro da Parte 2 continua disponível.
2. Iniciar foco 15/25/45, pausar e retomar. Bloquear tela e alternar apps; voltar antes do fim e verificar tempo restante. Deixar ultrapassar o limite: voltar, ver zero, registrar e confirmar que o total ganhou apenas o foco escolhido, uma única vez.
3. Iniciar outro foco, retirar o app dos recentes e reabrir sem limpar dados. Conferir recuperação; encerrar antecipadamente e consultar a duração. Reiniciar outro ciclo, cancelar/confirmar descarte e conferir preservação das sessões anteriores.
4. Escrever resumo/lembrete e citação, alternar modalidades com rascunho, salvar, editar, compartilhar texto e reabrir. Cancelar saída com rascunho. Observar teclado/dock e rolar até o envio em retrato/paisagem.
5. Criar duas ou mais cartas, reabrir, editar, revelar verso e usar “Lembrei”/“Rever depois”. Conferir slide, nova rodada das cartas a rever, retorno do foco e leitura de conteúdo longo. Testar preferência de movimento reduzido e TalkBack.
6. Conferir marcador/acumulado/histórico, anotar sessão, favoritos/etiquetas/estado e unidades não temporais. Exportar/restaurar somente uma cópia fictícia em ambiente descartável para validar cartas/tempo sem substituir dados pessoais.
7. Abrir “Cuidar deste registro”: ler o aviso completo, avaliar contraste/foco e cancelar exclusão. Repetir rotação, texto ampliado e alto contraste; verificar último controle acima do dock por rolagem.

Sem merge automático. A PR é draft encadeada à #25; BF-5 permanece aberta para avaliação e refinamento do proprietário.
