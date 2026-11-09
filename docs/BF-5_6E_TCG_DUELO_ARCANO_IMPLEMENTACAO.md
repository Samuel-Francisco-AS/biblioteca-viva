# BF-5.6E — Duelo Arcano: implementação candidata

Autorização específica do proprietário em 09/11/2026: execução contínua E1–E4, commits/push/APK e uma PR draft. Sem merge, encerramento BF-5.6 ou F/G/BF-6. Base `6babce2`, merge D `b3db5d87ce7e327e2ab88420681c4feaf99b1d6e` confirmado ancestral. Branch `feat/bf-5-6e-arcanario-duelo-arcano`; checkout inicial limpo.

## E1 — regulamento, motor e persistência

[ADR-029 / regulamento v1](decisions/ADR-029-duelo-arcano-regulamento.md) documenta preparação, zonas, mão, energia, ataques, Guardião/Ímpeto, efeitos, alvos, fadiga, resultados, abandono e limites. Domínio puro em `src/domain/duel`; aplicação em `src/application/duels.ts`; portas e tabelas globais reutilizadas. Transição imutável, comandos idempotentes por rejeição de ID/revisão, seed/PRNG, snapshots e replay. Atualização visual só recebe estado depois do commit.

Dexie v19 aditiva mantém tabelas/índices v18 e placeholders históricos. Backup v11 mantém formatos originais v6–v10, SHA-256, 10 MiB e rollback. Teste em base descartável valida restauração e falha após escrita. Sem downgrade ou limpeza de dados pessoais.

Validação E1: 12 testes dirigidos PASS (motor + Dexie); TypeScript PASS. Primeira execução encontrou expectativa incorreta da mensagem de falha simulada: a aplicação mascara erros de armazenamento, conforme contrato existente. Asserção corrigida para exigir código/contexto de persistência e rollback integral; não houve enfraquecimento do rollback. Checkpoints posteriores e rodada final ainda em execução.

## E2 — coleção, decks e arte

48 identidades oficiais originais: 10 por afinidade + 8 neutras; 24 criaturas, 14 feitiços, 10 artefatos. Sem raridade/pacotes pagos/desbloqueios. Quatro decks de 24 cartas (12 identidades × 2), cada qual com dez da tradição e duas neutras distintas. Cartas e baralhos oficiais são imutáveis; decks pessoais mantêm associações globais e contagens próprias. Construtor possui formatos, afinidade, curva de custos, cópias, inspeção e rascunho local. Salvar valida composição integral; rascunho pode permanecer incompleto.

48 gravuras vetoriais individuais: anatomias de criaturas, objetos arcanos e composições mágicas distinguíveis, cinco paletas, hachuras e cenários. Molduras por afinidade e tratamentos por tipo, custo/atributos/texto fora da ilustração. SVGs públicos totalizam 711.545 bytes; carregamento lazy/async, sem RAF ou WebGL novo. [Fontes e procedência](../assets/duel/source/README.md), manifesto de SHA-256 e script reproduzível incluídos. Inspeção de contato local feita; aprovação artística humana permanece pendente. Cartas autorais podem escolher essas artes como tema identificado; upload de arte TCG não é oferecido nesta versão.

Catálogo instala idempotentemente ao entrar no salão; instalação detecta divergência em vez de sobrescrever. Backup omite decks iniciais e conteúdo oficial sem referência pessoal; preserva cadeias compartilhadas necessárias. Restore em base descartável seguido da reinstalação do catálogo foi testado.

Validação E2: 7 testes dirigidos PASS (catálogo/arte/decks + Dexie), verificação exata das 48 artes PASS; 15 testes acumulados antes do teste adicional de reinstalação PASS. TypeScript anterior PASS; rodada consolidada posterior incluirá o construtor.

## E3 — mesa 2D, IA e partidas completas

Rotas próprias no Arcanário: salão, regulamento, baralhos e partida. Campo 2D com vida/energia, criaturas, artefatos, mão, inspeção, alvos e botões explícitos, ataques, ativações, pausa, confirmação de abandono, resultado e histórico por modo. Mão adversária é contagem; registro de compra não revela conteúdo oculto. Cartas podem ser inspecionadas por toque/teclado. Redução de movimento respeita preferência CSS; arte/efeitos não controlam regras nem salvamento. Mesa retrato usa rolagem e navegação compacta, sem drag obrigatório.

Um nível de IA local, determinístico: pondera letal, valor de ameaças/trocas, risco de derrota, Guardião, recursos, cura, compra, buffs e artefatos. `observeDuel` remove mãos/decks ocultos, conteúdo futuro e histórico antes da avaliação; desempates derivam da seed/revisão. Quatro oponentes usam os decks das tradições, sem bônus ocultos. Cadência visual de 380 ms entre decisões; cada decisão é salva individualmente. Background suspende agendamento; retorno reconsulta a persistência, sem reaplicar efeitos. Falha de escrita exige reconsulta explícita, evitando retry cego.

Testes E3: dois testes de IA PASS, incluindo 16 confrontos completos com ações legais e replay; build web PASS. E2E dirigido **2/2 PASS** em 58,8 s: partida completa por controles reais em 390 px, pausa/reload e igualdade do estado persistido, resultado/reload, paisagem, novo histórico e abandono cancelado/confirmado; construtor, rascunho e rejeição de deck curto. Capturas locais fictícias produzidas. Sem aparelho, TalkBack humano ou aceite artístico.

Primeiro ensaio de equilíbrio: 192 partidas, seeds 1–12, 16 pares ordenados. Todos os duelos terminaram; média 19,03 turnos; 185 por vida, 7 por fadiga, sem empate; maior histórico 179 comandos. Entre afinidades distintas: Ruína 57/72 vitórias, Conhecimento 16/72, Florescimento 34/72, Caos 37/72. Primeira posição 67 vs segunda 77. Três artefatos nunca escolhidos pela heurística. Esses sinais exigem uma rodada fundamentada de ajuste na E4; não constituem equilíbrio competitivo aprovado.

## E4 — autoria e integração

Oficina de combate integrada à Oficina existente: criatura/feitiço/artefato; nome, afinidade, custo, atributos aplicáveis, Guardião/Ímpeto, até duas habilidades e dois efeitos por habilidade, momento/custo/valores/alvos/duração, ambientação, gravura e prévia. Feitiços/artefatos não mostram atributos de criatura. Os controles escolhem definições conhecidas; não existe campo de script, função serializada ou expressão executável. Descrição de regras deriva dos efeitos, evitando texto que prometa comportamento inexistente. Rascunho privado é recuperável inclusive quando combinações ainda são semanticamente inválidas; salvar exige validação. Imagem TCG local opcional não foi adotada; gravuras originais são selecionáveis como tema autoral identificado.

Criador exige orçamento aproximado: ataque + 0,65×resistência + 1,5 por palavra-chave + efeitos ponderados por valor, abrangência, duração, momento e custo de ativação, até `2,6×custo + 2`. Compra/invocação até dois por efeito, atributos até ataque 8/resistência 10, custo 1–6, ativação 0–3, cura/escudo/buffs e dano tipados. Efeitos automáticos não exigem alvo manual; conjuração/ativação com classes incompatíveis é rejeitada antes de salvar. A UI explica a razão. Exceder orçamento só é salvo com opção explícita de Livre; mesmo assim schemas/segurança continuam obrigatórios. Cartas acima do orçamento não entram em Criador/Oficial.

Revisões e arquivamento seguem as cartas globais; partidas antigas conservam snapshots e referências. Copiar carta oficial cria nova identidade autoral. Construtor mantém associação muitos-para-muitos, contagens por carta e formatos próprios; comandos de baralho educativo recusam cartas executáveis de combate, e a Oficina educativa não organiza cartas dentro de decks TCG. Nenhum motor educativo/WorldHost/ThreeWorldRuntime foi reescrito.

## Regulamento final e justificativa dos valores

Versão `duelo-arcano/1.0.0`: 20 PV, 24 cartas/duas cópias, mão 4/5 e limite 8, energia 1→6, quatro criaturas e dois artefatos. A curva oferece decisões de gasto/guardar magia e transição até custos altos; 24 cartas dão composição a cada tradição com o acervo de 48; 20 PV produziram cerca de 19–20 turnos no ensaio de IA. Sete finais por fadiga em 192 mostram que o esgotamento existe, sem ser a condição dominante. Esses números são fixados nesta versão, não promessa de equilíbrio. Uma fase principal é persistível; preparação e resolução são atômicas e nunca deixam estado intermediário salvo.

Geração LCG de 32 bits e Fisher–Yates controlam embaralhamento/dano variável; seed, estado PRNG, snapshots e ações permitem replay. Eventos não acionam habilidades recursivas. Limites: 64 ações/turno, 64 efeitos/resolução, 120 turnos, 4096 comandos e 512 snapshots (tokens adicionais não nascem após esse teto). Fim de turno e abandono continuam possíveis nos limites. Habilidades são sempre limitadas por fonte/turno e recursos.

## Quatro afinidades e catálogo

- **Ruína / Samael:** pressão, dano direto/global, resistência, Guardião, drenagem e dano ao próprio duelista como consequência. Negro/lilás/brasas; diabrete, vigia de basalto, serpe, vulto e demônio catedral.
- **Conhecimento / Aryn:** compra, ordenação do topo, exaustão, escudos e eficiência; coruja de papel, cavaleiro, baleia astral, escriba e esfinge. Azul/ouro/runas.
- **Florescimento / Ytha:** cura, sentinelas 1/1, crescimento permanente/global temporário e Guardião. Broto, cervo, mariposa, sentinela vegetal e dríade. Verde/dourado/pétalas.
- **Caos / Lua:** dano variável limitado e registrado, Ímpeto, buffs temporários e compra combinada. Medusa celeste, gato, quimera, ave e leviatã. Violeta/magenta/fragmentos.
- **Neutras:** quatro criaturas, dois feitiços e dois artefatos táticos. Cada starter usa uma dupla neutra distinta, mantendo identidades de tradição.

Fonte canônica dos 48 IDs/nomes/custos/habilidades/revisões e decks: `src/domain/duel/catalogue.ts`. Não há raridade como poder, XP, moeda, desbloqueio educacional ou monetização. Todos acompanham o APK e são reinstaláveis offline. Catálogo se instala ao entrar no salão e recusa divergência de conteúdo oficial, inclusive no início da partida. [Manifesto artístico](../assets/duel/source/manifest.json) lista cada ilustração e hash.

## Simulações e uma rodada de ajuste

Dois lotes de 192 = **384 partidas determinísticas** de equilíbrio, 16 pares ordenados incluindo espelhos, seeds **1–12** em cada par. [Inicial](audits/evidence/bf56e/simulations-initial.json) e [revalidação de equilíbrio](audits/evidence/bf56e/simulations-after-balance.json). Os 16 confrontos de teste também verificam legalidade e replay, separadamente dos lotes estatísticos.

Achados iniciais: domínio da Ruína, fragilidade de Conhecimento e três artefatos nunca escolhidos. A heurística avaliava artefatos direcionados sem alvo, atribuindo valor zero. Uma rodada fundamentada passou a avaliar os alvos legais ao considerar artefatos, reduziu ataque da Serpe 4→3 e dano do Pacto 5→4, aumentou resistência da Coruja 2→3, reduziu custo da Lança 3→2 e ativação do Grimório 2→1. Revalidação, mesmas seeds/pares:

| Medida | Inicial | Após ajuste |
| --- | --- | --- |
| Média de turnos | 19,03 | 19,45 |
| Ruína (contra afinidades distintas) | 57/72 | 59/72 |
| Conhecimento | 16/72 | 19/72 |
| Florescimento | 34/72 | 32/72 |
| Caos | 37/72 | 34/72 |
| Primeira / segunda posição, apenas confrontos distintos | 67 / 77 | 75 / 69 |
| Vida / fadiga | 185 / 7 | 185 / 7 |
| Empates / limites técnicos | 0 / 0 | 0 / 0 |
| Cartas nunca jogadas pela IA | 3 | 0 |
| Máximo de comandos / eventos em uma ação | 179 / 9 | 131 / 9 |

O ajuste corrigiu a inutilidade aparente dos artefatos e melhorou um pouco Conhecimento, **mas não resolveu o domínio da Ruína** (81,9% neste recorte) nem a baixa taxa de Conhecimento (26,4%). Não se fez otimização infinita ou igualdade artificial. Há dívida real de balanceamento e limitações da heurística; avaliação humana e ajuste futuro precisam considerar decisões humanas, cartas situacionais, mãos e matchups. Relatórios incluem usos por carta, sementes, duração, fadiga e energia não gasta por partida; não são ranking ou estatística online. Uma verificação adicional de 192 partidas após acrescentar o evento explícito de rolagem do Caos reproduziu exatamente vencedores, turnos, comandos e fadiga; total executado **576 partidas**, uma única rodada de ajuste. O [relatório final auditado](audits/evidence/bf56e/simulations.json) registra até dez eventos por ação (a rolagem agora é evento separado), com aproximadamente 8,8 s no host, sem equivalência Android. Esse reforço não introduziu nova calibragem.

## Persistência, histórico e backup

Cada partida é uma `combat_match` independente, com IDs de participantes, deck/versão, cartas/revisões, ordem inicial, zonas atuais, habilidades usadas, duração de condições, turno/fase, vida/recursos/fadiga, seed/PRNG, comandos e eventos, modo/regulamento e resultado. Sessão só avança visualmente após commit. Concorrência ou ID repetido rejeitam a ação; UI oferece reconsulta após falha, sem retry cego. Pausa conserva inclusive o turno da IA. Retomar não compra nem resolve novamente. Abandono confirmado é derrota permanente; novo duelo nunca sobrescreve a sessão anterior. Há no máximo um duelo não concluído por vez.

Dexie v19 conserva as 18 tabelas/índices da v18 e acrescenta somente campos opcionais aos agregados e marcador. Backup v11 aceita v6–v10 originais, valida checksum, grafo e replay completo em comparação canônica (ordem de chaves não altera o resultado). Mantém históricos e cadeias necessárias; omite todo asset visual e catálogo/starter não referenciado. Retém deliberadamente história e revisões; não existe limpeza automática. Pode exceder 10 MiB e bloquear exportação explicitamente, sem apagar dados. Restore e rollback só foram ensaiados em bases descartáveis; sem downgrade.

## Evidências, gate e contrato com F

Capturas fictícias em `docs/audits/evidence/bf56e`: salão, coleção, mesa, resultado e Oficina, retrato/paisagem. Foram inspecionadas localmente; não equivalem a aceite humano. [Roteiro Moto G06](audits/evidence/bf56e/MOTO_G06.md) contém sete grupos, todos pendentes de relato físico nesta E. A–D já aprovadas em seus recortes não são declaradas novamente aprovadas pelo agente.

F poderá trocar/ampliar apenas a apresentação: usar `DuelService.get/command`, `DuelMatch` versionado e os eventos da última confirmação. Não inferir regras de animação, alterar cartas vivas para reconstituir história ou salvar estado gráfico transitório. Arena/construção orbital e recursos 3D terão lifecycle e autorização próprios. Nesta candidata não há código de arena, novo mundo WebGL, transformação dos habitantes, campanha RPG, PvP, conta, backend, ranking, analytics ou IA obrigatória online.


## Validação consolidada e separação de falhas

| Verificação | Resultado e escopo |
| --- | --- |
| Motor/catálogo/IA/efeitos/Dexie E final | **44/44 PASS**, cinco arquivos, incluindo integração educativa no mesmo banco e backup de partida completa |
| Regressão dirigida A–D/dados/backup/UI | **158 PASS / 1 FAIL** em 19 arquivos; a espera de UI remanescente passou depois no arquivo isolado **9/9**, sem mudar assert ou timeout |
| E2E consolidado A–E | **13/13 PASS** (1,8 min): dez educacionais + três TCG, por controles reais; cria os três tipos autorais, deck Criador, partida completa, snapshots/reload/resultado e novo histórico |
| Canvas residente | **1/1 PASS**, 14,7 s, cenário B Biblioteca→Arcanário→Biblioteca; não representa toda a suíte gráfica/CI |
| Ampla única `test:run` | **1.144 PASS / 13 FAIL**, 178 arquivos, 146,39 s; não repetida integralmente |
| Artes/coleção | **48/48 PASS**, hashes/procedência/segurança, quatro decks válidos |

Falhas da ampla: sete expectativas antigas de schema/backup atualizadas para v19/v11; três esperas de UI (arquivo isolado posterior 9/9 PASS); um timeout novo no teste que agrupava 16 duelos sob um limite único de 5 s (substituído por 16 casos independentes, preservando todos os asserts, limite e replay); dois timeouts de 5 s em `inhabitantAnimator.test.ts` (envelopes Aryn/Ytha, arquivo/GLBs não alterados pela E). Ytha já constava como dívida; a ocorrência de Aryn nesta rodada não tem baseline isolado comparável e não foi atribuída como regressão física. Não alterar os testes 3D ou aumentar timeout sem hipótese nova.

Problemas novos encontrados e corrigidos nos dirigidos: avaliação sem alvo tornava três artefatos invisíveis à heurística; lint identificou globais Node sem imports, promessas de navegação e escrita síncrona de rascunho; hook de rascunho passou a descarregar em pagehide/unmount e a não recriar após salvar; replay no backup passou a comparar conteúdo canônico em vez de ordem de chaves; a inclusão do evento de rolagem revelou enum incorreto em uma rodada intermediária, corrigido e revalidado 44/44. Nenhum assert removido, teste ignorado ou lint desativado.

Não executados/certificados: CI global remota completa, toda a suíte E2E histórica, TalkBack humano, instalação/aceite artístico no Moto G06, memória/termal/GPU sustentados e restore sobre dados pessoais. O PASS dirigido do Canvas não fecha as demais dívidas gráficas A–D/BF-5.5. Restore foi apenas descartável. Balanceamento residual Ruína/Conhecimento, ausência de upload de arte TCG, um único nível de IA, histórico local sem poda e possível bloqueio do backup em 10 MiB permanecem explícitos.


Verificação final adicional: duelo por controles reais contra **Lua/Caos** após o evento explícito de rolagem, **1/1 E2E PASS** em 33,6 s. Formato, lint, TypeScript, áudio, packs, build, relatório estático de performance, integridade das 48 artes e diff PASS. [Matriz verificável](audits/evidence/bf56e/validation.json) · [bundles](audits/evidence/bf56e/build-performance.json). Build inicial JS: 581.652 B; página Arcanário dinâmica ~151 kB e Three dinâmico 861.399 B; warning de chunk >500 kB preservado. Não são métricas Android.

O commit E4 contém a implementação final usada para gerar o APK. Hash/bytes e comparação dist→Android→ZIP estão registrados em `apk.json` no commit documental posterior, sem alterar código de produção. Publicação: uma única PR draft contra main; sem merge/tag/release/fechamento BF-5.6 ou início de F/G/BF-6.


## APK debug e proveniência final

`npm run android:build:debug` PASS (inclui build web e Android sync); Gradle `assembleDebug` PASS em 35 s. APK local: `android/app/build/outputs/apk/debug/Biblioteca-Viva-BF56E-debug.apk`, **11.647.318 bytes**, SHA-256 **`76de2a5cd3b3e827f939e7e82792a3984f47a579cc792f24fb531d077c8d970b`**. Fonte limpa **`8bc290b0edc7e4d6f32157c1a51a0d91db177e0a`** (E4), árvore `d0fb9a0ef9e78a0c960d41077024d938c78d8651`. Commit posterior altera somente documentação/evidência. [Proveniência completa](audits/evidence/bf56e/apk.json).

Conferência binária **110/110 arquivos web de runtime** iguais entre dist, assets Android e ZIP, incluindo as **48/48 gravuras**, catálogo e GLBs; `.vite/manifest.json` excluído explicitamente por ser metadado de build. Versão JS `0.2.0-alpha.1`, versionName nativo `1.0` e versionCode `1` preservados; nenhum bump, assinatura de release, tag ou publicação de release. Warnings existentes de chunk >500 kB e `flatDir` continuam. APK não versionado e não instalado fisicamente pelo agente.

Checkpoint E1 `9088fb8`; E2 `5c9e30b`; E3 `9d167cd`; E4 `8bc290b`. Branch `feat/bf-5-6e-arcanario-duelo-arcano`. Gate humano/artístico, TalkBack e desempenho sustentado seguem pendentes; nada nesta candidata aprova merge ou inicia F/G/BF-6.
