> **DECISÃO POSTERIOR À AUDITORIA — 11/11/2026:** após receber o parecer G, o proprietário declarou expressamente que prefere **encerrar a BF-5.6 com as ressalvas**. A fase global está, portanto, **formalmente encerrada com ressalvas**, conforme [termo canônico](BF-5_6_FECHAMENTO_GLOBAL_2026-11-11.md). O trecho abaixo escrito antes dessa decisão, que menciona “aguardando aceite”, permanece histórico do momento da auditoria e não é o estado vigente. Nenhum E2E/CI/Android foi executado entre a auditoria e o fechamento; as dívidas técnicas não foram marcadas como PASS.

# BF-5.6G — Auditoria integrada e consolidação (11/11/2026)

**Decisão operacional:** execução autorizada pelo proprietário em **uma única rodada, diretamente na `main`**, com checkpoints internos G1 → G2 → G3 → G4. **Auditoria executada e reparos documentais/acessíveis publicados na `main`.** Esta é uma **avaliação técnica com ressalvas**; não representa CI global aprovada, nova instalação Android nem aceite explícito de encerramento da BF-5.6 global. O plano original exige esse aceite. Nenhuma PR adicional foi criada, nenhum merge foi necessário, e não se iniciou BF-6/BF-7.

**Base auditada:** `main` `639c5cbfb718b84b89bde5c04523837fe1340ab8` (antes dos commits G); integra BF-5.6A–F, mais a melhoria transversal BV-UXC da [PR #49](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/49), merge `420109381aa91b5278fcee9d93b10984e9eef92a`. **PRs abertas na consulta inicial: zero.** [Matriz estruturada de evidências](audits/evidence/bf56g/inventory.json).

## G1 — Inventário, rastreabilidade e escopo (CONCLUÍDO)

Consulta real à árvore GitHub: **1.910 entradas**, entre elas **228 arquivos de testes unitários/integração/E2E** (métrica de arquivos; não é número de testes executados), **39 specs E2E** e **48 pinturas WebP** no runtime do TCG. A contagem pode ser alterada por mudanças futuras e não é prova de cobertura comportamental. As etapas A–F estão integradas e encerradas *individualmente* com as ressalvas dos respectivos aceites; BV-UXC foi encerrada separadamente após aprovação física.

Fontes de autoridade:

| Área | Estado verificado pela leitura do código | Fonte |
| --- | --- | --- |
| Persistência | Dexie **v19**, histórico de migrações 1–19; **sem migração G** | `src/infrastructure/database/schema.ts`, `database.ts` |
| Backup | Formato **v11**, leitura de v6–v10, limite **10 MiB**, checksum SHA-256, inspeção de vínculos e replay de duelo; restauração em transação Dexie | `src/application/backup.ts`, `infrastructure/backup/backupCodec.ts`, `dexieBackupStore.ts` |
| Arcanário educativo | Cartas globais, revisões, Provações, taxonomia, relatórios, Coleções/Pacotes e mídias locais; pacotes validados com manifesto/hashes/limite | ADR-025–028, `src/application/educationalPacks.ts`, `infrastructure/packs/packCodec.ts` |
| Conteúdo de prova | Quatro exercícios **autorais**; ENEM/CNU são referências sem enunciados oficiais distribuídos | [Fechamento D](BF-5_6D_FECHAMENTO_2026-11-09.md) |
| TCG | Motor determinístico de versão 1, sessões/replay, IA local e 48 cartas; **nenhuma mudança de regras nesta G** | [Fechamento E](BF-5_6E_FECHAMENTO_2026-11-09.md), `src/application/duels.ts`, `domain/duel/engine.ts` |
| Arena/mundo | Duelo em uma tela e renderer efêmero; lua orbital no scheduler do mundo residente; gate artístico anterior aprovado pelo proprietário | [Fechamento F](BF-5_6F_FECHAMENTO_2026-11-09.md), ADR-030 |
| Toque/transições | PR #49 mesclada, BV-UXC fechada com microengasgos residuais aceitos e E2E lifecycle pendente | [Fechamento BV-UXC](BV_UXC_FECHAMENTO_2026-11-10.md), ADR-031 |

**Limite importante:** leitura de contratos e código-fonte confirma a presença de proteções e estratégias, **não prova execução de restore, ausência absoluta de corrupção nem estabilidade térmica**. Nenhum dado privado do aparelho ou backup pessoal foi acessado.

## G2 — Integridade de entrada, navegação, dados e lifecycle (CONCLUÍDO COM RESSALVAS)

### Revisão estática

- `JsonBackupCodec` verifica versão, tamanho, checksum, IDs/vínculos, mídia e consistência do replay. `DexieBackupSnapshotStore.replace` valida antes de aplicar substituição e executa a alteração dentro de transação `rw`; **nenhuma restauração destrutiva foi realizada na G**.
- Os pacotes usam manifesto validado, digests, direitos declarados e operações transacionais; remoção preserva revisões e pode **não liberar bytes**. Backups privados não reproduzem o acervo público não referenciado; usuários devem manter cópias próprias antes de atualizar.
- A arena usa o serviço/engine anterior, sem alterar IDs, snapshots ou esquema; a lua utiliza o scheduler residente, não um novo RAF próprio. Os recursos de apresentação seguem o ciclo de vida implementado em F.
- PR #49 altera continuidade de toque, microtarefas, preparo de rotas, rascunhos e consultas. Avaliações humanas de fluidez e transições continuam sendo específicas da versão testada na BV-UXC; não extrapolar para FPS P95/P99 ou TalkBack.

### Defeito encontrado e intervenção G2 — alternativa de acesso orbital

O E2E `e2e/bf56f-orbital-refinement.spec.ts` assumia que selecionar **“Próximo →” uma única vez** no catálogo semântico abriria o portal lunar. Essa suposição depende da ordem e dos objetos presentes no mundo. A navegação acessível não tinha um comando direto inequívoco para o portal. O teste anterior havia terminado em timeout de 30 s **duas vezes** na F.

**Reparo publicado diretamente na `main`:**

1. `src/features/library/WorldHost.tsx`: comando semântico **“Abrir Salão de Duelos”** disponível nos controles acessíveis quando a cena registra o portal `portal:duelo-arcano`. Invoca `runtime.selectObject` e reutiliza o caminho canônico de seleção/navegação. Não interfere no toque do Canvas nem acrescenta renderer/RAF.
2. `src/features/library/WorldHost.test.tsx`: novo caso de seleção por teclado e encaminhamento do ID canônico ao callback.
3. `e2e/bf56f-orbital-refinement.spec.ts`: passa a focar/acionar o controle estável por `Enter`, sem depender de ordem de outros objetos.

Commits G2: `d3fa6e6`, `309067e`, `bce79c4`.

**Estado do defeito:** rota de acesso direto **implementada**, fragilidade de ordem do E2E **eliminada no código-fonte**. **Não chamar E2E PASS ou reparo físico certificado:** o novo teste e a UI precisam ser executados numa instalação atualizada; o timeout anterior permanece histórico aberto até essa evidência.

## G3 — Coerência arquitetural e saneamento de registros (CONCLUÍDO)

A auditoria dos ADRs detectou uma colisão objetiva:

- `ADR-030-arena-viva-apresentacao-lifecycle.md` (Arena Viva).
- `ADR-030-desempenho-rotas-consultas.md` (PR #49/BV-UXC).

**Reparo na `main`:** a decisão da Arena Viva mantém o identificador **ADR-030**; a decisão posterior de desempenho foi movida para **[ADR-031 — residência de rotas e consultas consistentes](decisions/ADR-031-desempenho-rotas-consultas.md)**. Atualizados cinco arquivos com vínculos conhecidos: `AGENTS.md`, `docs/decisions/README.md`, `docs/README.md`, `docs/ARCHITECTURE.md` e `docs/audits/BV_UXC_R5_DESEMPENHO_GLOBAL_2026-11-09.md`. O arquivo antigo foi excluído **depois** da criação e atualização dos links. Não foram apagadas as decisões nem reescrito histórico de commits.

**Verificação feita:** árvore do GitHub na revisão `536000c0` contém exatamente um ADR-030 e um ADR-031; os cinco arquivos de referência foram relidos do remoto com caminho novo e sem o antigo. Não são necessárias alterações em schema/backup/runtime para esta correção.

## G4 — Matriz de validação e dívidas remanescentes (CONSOLIDADA)

| Verificação | Evidência | Situação |
| --- | --- | --- |
| Estado Git/main, PRs abertas, árvore e ADRs | Consulta real à API GitHub | **Verificado** |
| Contratos de backup, Dexie, pacotes e replay | Leitura estática dos arquivos atuais | **Inspecionados; sem teste novo de execução** |
| Acesso orbital alternativo e teste correspondente | Código e testes alterados na `main` | **Implementado; não executado** |
| TypeScript/lint/format/build web e Android **após G2/G3** | Checkout local indisponível neste ambiente | **NÃO EXECUTADOS** |
| Testes unitários/E2E após G | Checkout e dependências locais não acessíveis | **NÃO EXECUTADOS** |
| GitHub Actions CI global | Cota esgotada informada pelo proprietário | **NÃO EXECUTADA; não verde** |
| Gate físico Android desta nova revisão | Nenhum APK gerado/instalado durante a G | **PENDENTE** |
| Segurança/dependências atuais | Sem npm audit/varredura dinâmica e sem rede/checkout local | **NÃO CERTIFICADA** |

**Não somar nem promover resultados históricos:**
- Refinamento F, dirigido, pela execução anterior do Codex: **139/139 PASS**; partida completa e três viewports E2E PASS; **E2E orbital anterior FAIL por timeout**.
- Ampla anterior F2: **1.174 PASS / 12 FAIL**, seis timeouts gráficos ainda não resolvidos de maneira comprovada; a ampla não foi repetida na G.
- BV-UXC R5: **420 testes dirigidos PASS**, E2E de UI PASS, **E2E lifecycle 3D timeout**. Alterações remotas R6–R6.2 não tiveram compilação/testes locais novos comprovados no fechamento da PR #49.
- Aceite humano no Moto G06 das etapas E/F e BV-UXC foi registrado, mas não valida automaticamente as pequenas mudanças G2 nem resolve métricas de longa duração.

### Riscos priorizados

**Prioridade alta para certificação/qualidade:**
1. Compilar e executar os testes dirigidos `WorldHost.test.tsx` e `bf56f-orbital-refinement.spec.ts` na `main` atual; verificar o botão no Moto G06 sem alterar dados pessoais.
2. Reavaliar timeouts gráficos e lifecycle 3D com **uma execução focalizada com diagnóstico**, distinguindo lentidão SwiftShader/test runner de defeito reprodutível no Android; não elevar timeouts ou enfraquecer asserts por conveniência.
3. Realizar um gate Android proporcional sobre versão atualizada **posterior à PR #49 e à G**: Biblioteca → portal acessível/3D → Salão → duelo → pause/retome → Biblioteca → abrir quest e trocar salas, observando microengasgos.

**Débitos aceitos porém não resolvidos pela G:**
- Cota de CI, TalkBack humano, métricas Android P95/P99, aquecimento/memória prolongados e tolerância a baixa memória.
- Balanceamento do TCG (no último lote da E, Ruína **59/72** e Conhecimento **19/72** vitórias contra outras afinidades).
- Reforma transversal da UI/UX das demais salas do Arcanário, distinta da arena 3D aprovada.
- Licenças/fidelidade editorial para eventuais questões oficiais ENEM/CNU; não distribuir sem verificação.
- Limite backup privado de 10 MiB e histórico retido após remoção de pacote; ensaio de restauração **somente em base descartável**.
- Nenhuma alegação de segurança global ou release/Play Store.

### Compatibilidade e APK

G não alterou Dexie v19, formato de backup v11 (lê v6–v10), motor de regras/IA, IDs de cartas, imagens, migrações ou dados pessoais. **Não foi produzido APK nesta rodada remota**. O APK BF-5.6F-Refinamento anterior (SHA-256 `a68b3ecad2388f3b3df2a7cbad8064c763431acc83749c6c6e1dc814ad0f606e`) **não contém** o merge BV-UXC #49 nem os reparos G2; não usá-lo para validar a `main` atual. Para gate final é necessário compilar um APK novo localmente com `npm run android:build:debug`, registrar SHA e preservar dados na instalação.

## Parecer e decisão de fechamento

**Resultado desta rodada:** **BF-5.6G — auditoria integrada concluída com ressalvas, G1/G2/G3/G4 documentados e reparos seguros publicados na `main`.** O inventário não revelou, nesta inspeção estática, quebra comprovada de contratos de banco/backup/engine que justificasse uma migração ou reescrita de produção. Isso **não é prova de ausência de defeitos**.

**Recomendação:** a base A–F, já aprovada funcionalmente/artisticamente em gates dirigidos anteriores, é candidata a **encerramento global da BF-5.6 com ressalvas** após **decisão explícita do proprietário**, sem mascarar gates ausentes. A auditoria G pode ser considerada entregue agora; **o estado global fica “aguardando aceite de fechamento”**, não encerrado automaticamente por uma autorização para auditoria. Um gate curto posterior na `main` atual aumentaria a confiança, especialmente no acesso orbital acessível.

**Não iniciar BF-6/BF-7 nem a reforma geral do Arcanário por inferência.**

### Rastreabilidade

- [Plano BF-5.6](BF-5_6_ARCANARIO_PLANO.md).
- [Fechamento F](BF-5_6F_FECHAMENTO_2026-11-09.md).
- [Fechamento BV-UXC](BV_UXC_FECHAMENTO_2026-11-10.md).
- [Matriz G](audits/evidence/bf56g/inventory.json).
