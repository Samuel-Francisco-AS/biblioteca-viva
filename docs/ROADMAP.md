# Roadmap — Reboot espacial

> 2026-08-18. P1/P2 permanecem histórico técnico. O reboot espacial passa a ser o próximo trabalho.

## W0 — Fundação documental
- [x] visão;
- [x] produto;
- [x] arquitetura;
- [x] modelo de mundo;
- [x] fluxos;
- [x] direção artística;
- [x] decisões;
- [x] reconciliação documental executada contra código, testes e histórico durante a correção W1.

## W1 — Spike de mundo e câmera
Mundo maior que viewport, dois espaços conectados, câmera X/Y, gesto mobile, uma instância Phaser e nenhuma migração. Testar no Moto G06.

Critério: exploração natural o bastante para justificar o reboot.

Estado técnico: **implementação corrigida novamente após smoke test físico reprovado**. A planta fixa aproxima B cinco células no eixo Y, reduz o conector vertical para três células e deriva bounds de 832×672 units; não há persistência espacial. Os testes específicos cobrem também os extremos, a curva, a entrada de B e uma regra geométrica contra enquadramento vazio. Estado humano: **nova validação no Moto G06 pendente**. W1 não está aprovada.

## W2 — Objeto posicionável persistente — concluída/aprovada
O primeiro teste no Moto G06 reprovou carregamento do piso interno, pan Y, seleção/ações e repetição exterior. A correção localizada restaura o path real, garante bounds verticais dependentes da viewport, expõe o painel React e reduz macro-tiles por crops determinísticos. Schema v6 e backup v4 não mudaram. Nova validação humana integrada permanece pendente.

Em 2026-08-26, a W2 recebeu a integração limitada de uma escrivaninha e uma cadeira reais, com quatro sprites por orientação, footprint e pivot declarados. Isso valida visualmente o pipeline de `PlacedObject`; não inicia nem conclui a produção artística W5. A validação humana no Moto G06 permanece pendente.

Em 2026-08-26, a correção W2.1 removeu o fundo preto opaco dos PNGs runtime e eliminou a recriação de GameObjects no hot path de drag. A validação humana no Moto G06 continua pendente.

Em 2026-08-26, W2.2 aplicou preview otimista com rollback em falha para Girar e Mover, e substituiu o exterior de crops pequenos por texturas completas maiores. W2 permanece reprovada até nova validação física no Moto G06.

Em 2026-08-26, W2.3 passou a descartar eventos intermediários obsoletos durante drag e a coalescer commits de giros rápidos no último estado desejado. A inspeção do pan não demonstrou lag/backlog técnico nem justificou alterar ganho/deadzone.

**Aprovação humana: 2026-08-26, Moto G06.** Transparência, seleção/Mover/Girar, responsividade suficiente, ausência de snapback, exterior contínuo, câmera aceitável e persistência após reaberturas foram confirmados. W2.4 concluiu o acabamento do cartão/feedback e retirou a fixture procedural da composição. Otimização e refinamento fino de câmera/input/mecânicas espaciais são débito futuro deliberado e não bloqueiam W2.

## W3-A — Sistema arquitetônico de paredes reais — conclusão técnica
O mundo W1/W2 agora compõe paredes por geometria lógica → plano puro → catálogo de assets → Phaser. Os doze PNGs locais foram validados e copiados como PNG32 RGBA; segmentos usam 4/2/1 célula, cantos explícitos e portas exclusivamente horizontais. A entrada B foi movida da parede oeste para a borda norte, preservando os dois espaços/conexão e as áreas W2. Não há schema, backup ou persistência de paredes. Inspeção no Moto G06 (seams, abertura, depth, câmera/pan) continua pendente.

## W3-B — Unlock → disponibilidade
Separar unlock de placement; reaproveitar milestones; objeto desbloqueado pode ser colocado sem sala/categoria obrigatória.

## W4 — Habitantes no mundo
Adaptar scheduler, âncoras globais, deslocamentos entre espaços, balões e reduced motion; sem pathfinding geral inicialmente.

## W5 — Direção visual/assets reais
Decidir top-down versus 2.5D/isométrico; pipeline de sprites; móveis; iluminação; otimização apenas se medida.

## W6 — Reintegração do antigo P3
Reavaliar conexões, revisitas, calendário, metas opcionais, coleções e memória conectada após estabilidade espacial.

## Cota reduzida
Até a renovação: priorizar decisões humanas, mockups e documentação; evitar prompts amplos; usar Codex apenas para spikes pequenos de alto valor; não gastar cota com refactor cosmético.
