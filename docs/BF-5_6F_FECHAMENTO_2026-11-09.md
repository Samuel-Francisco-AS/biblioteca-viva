# BF-5.6F — Fechamento da Arena Viva (F1 + F2 + R1–R4)

**Data:** 09/11/2026. **Estado:** etapa F **aprovada pelo proprietário e integrada à `main` com ressalvas**; a fase global **BF-5.6 continua aberta**, aguardando a etapa G de auditoria integrada/decisão de fechamento. Não há declaração de release nem aprovação de CI global.

## Decisão do proprietário e integração

Após atualizar e experimentar a primeira Arena Viva 3D no **Moto G06**, o proprietário informou que a experiência de duelo melhorou bastante e não percebeu defeitos mecânicos, mas considerou abstratos o objeto orbital, a arena, as cartas e os efeitos. Foi então realizada uma nova rodada artística R1–R4. Após a candidata refinada, o proprietário declarou: **“melhorou bastante, então vamos aprovar essa etapa e você pode integrar as PRs em aberto na main e fechar as etapas.”**

- **Única PR aberta na consulta pré-merge:** [#48 — BF-5.6F Arena Viva 3D, lua orbital e refinamento artístico](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/48). As etapas anteriores A–E já estavam na `main`.
- **Branch:** `feat/bf-5-6f-arena-orbital`.
- **Head integrado:** `e56497b7915cb957b87ac62f4dc01408d33cfce9`.
- **Merge na `main`:** **`690be5b5798d34e6436610bf9d209ede38629fd7`**, realizado mediante autorização expressa e conferência de SHA.
- [Comentário na PR com o gate e as ressalvas](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/48#issuecomment-6746970287).
- **Fecham-se conjuntamente:** F1 (fundação técnica), F2-A–D (arena 3D, integração, construção orbital), R1–R4 (refinamento visual/artístico). Não iniciar automaticamente a G.

## Escopo incorporado

- **Duelo Arcano como game em uma tela:** apresentação Three.js em viewport fixo, HUD contextual, mão, campos, zonas e seleção por toque, cartas e alvos, regras e inspeção em overlay sob demanda, sem scroll da página ou dock global na batalha; composição adaptada a retrato/paisagem. Motor determinístico, IA e `DuelService` da E são as únicas autoridades de regras/ações.
- **Arena artística:** observatório ritual tridimensional, mármore/mosaico, bronze, galerias/portais, focos das quatro afinidades, efeitos diferenciados de invocação/ataque/feitiço/cura/escudo/destruição/resultado; 48 novas pinturas WebP originais e molduras/apresentação de TCG, preservando IDs/revisões e SVG legados.
- **Lua arcana do Arcanário:** grimório encadernado e giratório, anéis/precessão, brilho/poeira estelar, órbita de **raio 28** com período nominal **420 s** em torno da Biblioteca; mesmo objeto selecionável `portal:duelo-arcano`, scheduler existente, pausa/redução de movimento, sem RAF nem luz residente adicional.
- **Integração e segurança:** mundo residente pausado fora da Biblioteca; renderer efêmero da arena libera recursos ao sair; geometrias/materiais agrupados e efeitos reutilizados, DPR adaptativo. Sem alterações de motor, gameplay, regras, Dexie **v19** ou backup **v11** (importação v6–v10).
- Fontes e evidências: [Relatório F2 e R1–R4](BF-5_6F_ARENA_VIVA_IMPLEMENTACAO.md), [Handoff F1](BF-5_6F_F1_HANDOFF.md), [ADR-030](decisions/ADR-030-arena-viva-apresentacao-lifecycle.md), [Registro de assets](ASSET_REGISTRY.md).

## Aceite e limitações de validação

**Aceite humano explícito:** avaliação favorável e aprovação da etapa F pelo proprietário após testes em **Moto G06**. O feedback não é uma certificação de cada cenário do roteiro; **não inventar PASS individuais para verificações não reportadas**. O aceite artístico é relativo à candidata atual e não elimina oportunidades futuras de aprimoramento.

**Evidências locais do Codex na rodada refinada:**
- Testes dirigidos **139/139 PASS** (execuções complementares sobrepostas 29/29, 21/21 e 4/4 não devem ser somadas como casos únicos).
- E2E de partida completa **PASS** e gate de campo cheio nos viewports **390×844, 360×640 e 844×390 PASS**, sem scroll da página ou colisões críticas reportadas.
- Build web/Android, TypeScript e lint dirigido **PASS**; 161/161 assets web conferidos.
- **E2E novo de acesso ao orbital FAIL por timeout de 30 s em duas tentativas**, embora testes dirigidos de órbita/geometria/raycast/picking tenham PASS. A seleção real/acessível em todas as fases da órbita permanece uma dívida de cobertura; o aceite físico geral **não deve ser reescrito como E2E PASS**.
- Suíte ampla **não repetida** no refinamento. Histórico anterior da F2: **1.174 PASS / 12 FAIL**, seis timeouts gráficos ainda pendentes após reparos dirigidos.
- **GitHub Actions sem execução por cota esgotada**, CI global **não verde/não certificada**. Lint global final da F2 foi interrompido, não certificado.
- TalkBack humano, métricas sustentadas de FPS/memória/temperatura e longa duração não confirmadas pelo aceite. Risco de desempenho em Moto G06 a acompanhar.

**APK de referência da candidata aprovada:** `android/app/build/outputs/apk/debug/Biblioteca-Viva-BF56F-Refinamento-debug.apk` (arquivo local do Codex, não versionado); origem produtiva `a6f8bb3a0393f1f388e706e4b5742b0737b9a2df`; 13.040.885 bytes; SHA-256 `a68b3ecad2388f3b3df2a7cbad8064c763431acc83749c6c6e1dc814ad0f606e`. [Proveniência](audits/evidence/bf56f-refinement/apk.json). Não confundir esse artefato anterior à documentação final com APK refeito do HEAD do merge; não houve novo build neste fechamento documental.

## Dívidas mantidas para G e trabalho posterior

1. **Cobertura orbital:** diagnosticar o E2E de navegação acessível do portal (timeout); assegurar pickability em diferentes posições/fases e caminho acessível.
2. **Gates integrais/CI:** classificar seis timeouts gráficos e falhas remanescentes; quando houver cota de Actions, CI global real; não mascarar timeouts nem reinterpretar testes dirigidos como globais.
3. **Performance/acessibilidade:** avaliação prolongada no Moto G06, TalkBack, texto ampliado, condições de pouca memória, rotação/retomada.
4. **Balanceamento TCG:** Ruína **59/72** vitórias contra outras afinidades nas simulações da E, Conhecimento **19/72**; sem mudança de regras nesta F.
5. **Reforma transversal da UI/UX do restante do Arcanário** (Portal, Acervo, Oficina, Provações, Biblioteca de Provas etc.) continua escopo futuro separado da arena e não foi resolvida pelo merge.
6. **Dívidas editoriais:** ENEM/CNU permanecem referências sem questões oficiais redistribuídas enquanto licenças/fidelidade não forem resolvidas; não relacionar esse fato à entrega da arena.

## Próximo marco

BF-5.6A/B/C/D/E/F integradas à `main`. A **BF-5.6G** permanece **planejada, não iniciada**, para auditoria integrada, saneamento/riscos e decisão consciente de fechamento global, preservando o registro das dívidas que não forem bloqueantes. Nenhuma autorização implícita de merge de trabalho novo, publicação Play Store ou alteração de regras.
