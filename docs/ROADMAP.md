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

## W2 — Objeto posicionável persistente — correção técnica após reprovação física
O primeiro teste no Moto G06 reprovou carregamento do piso interno, pan Y, seleção/ações e repetição exterior. A correção localizada restaura o path real, garante bounds verticais dependentes da viewport, expõe o painel React e reduz macro-tiles por crops determinísticos. Schema v6 e backup v4 não mudaram. Nova validação humana integrada permanece pendente.

## W3 — Unlock → disponibilidade
Separar unlock de placement; reaproveitar milestones; objeto desbloqueado pode ser colocado sem sala/categoria obrigatória.

## W4 — Habitantes no mundo
Adaptar scheduler, âncoras globais, deslocamentos entre espaços, balões e reduced motion; sem pathfinding geral inicialmente.

## W5 — Direção visual/assets reais
Decidir top-down versus 2.5D/isométrico; pipeline de sprites; móveis; iluminação; otimização apenas se medida.

## W6 — Reintegração do antigo P3
Reavaliar conexões, revisitas, calendário, metas opcionais, coleções e memória conectada após estabilidade espacial.

## Cota reduzida
Até a renovação: priorizar decisões humanas, mockups e documentação; evitar prompts amplos; usar Codex apenas para spikes pequenos de alto valor; não gastar cota com refactor cosmético.
