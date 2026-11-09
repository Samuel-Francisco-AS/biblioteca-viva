# BF-5.6E — Fechamento funcional da primeira versão do Duelo Arcano

- **Data:** 09/11/2026.
- **Decisão do proprietário:** após testes físicos breves no **Moto G06** e sete capturas, **aprovar a E como primeira versão funcional e integrar PR #47 à `main`**, sem exigir a resolução imediata da identidade artística, do balanceamento ou da UI/UX.
- **PR:** [#47 — BF-5.6E Duelo Arcano](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/47). Head `44fa2c9718f408fc7c41348ae9bb09bb8a0bf0d8`; merge `19eb076a949c8d7e8728bc2b1ecff9186bd333b9`.
- **Relato e evidência:** [comentário do gate físico e dívidas na PR #47](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/47#issuecomment-6740400638). Capturas foram fornecidas na conversa com o proprietário e inspecionadas. Não são evidência de validação exaustiva do roteiro inteiro.
- **Estado:** BF-5.6E **integrada/aceita funcionalmente como versão inicial**, **sem aprovação da UI/UX e arte final**. BF-5.6 continua **aberta** para etapas F/G e **um trabalho posterior transversal de reformulação da interface do Arcanário**, cuja sequência e escopo ainda devem ser definidos.

## O que foi aceito

O proprietário testou o Duelo Arcano em aparelho físico e **não percebeu defeitos técnicos ou mecânicos** no escopo experimentado. Observou criaturas, feitiços/artefatos, mão, invocação, estados de campo e navegação. Isso é um PASS funcional inicial relatado, **não certificação de todos os sete grupos** do roteiro E, nem de TalkBack, backups destrutivos, memória/GPU/termal e CI.

Entrega E1–E4: regulamento v1 de 20 PV/decks 24/energia até 6, motor determinístico e replay, 48 cartas autorais oficiais e 48 SVGs individuais, quatro decks/tradições, IA local PvE, Oficina autoral, modos Oficial/Criador/Livre, persistência e histórico. Dexie **v19**, backup **v11**, leitura de versões anteriores **v6–v10**, 10 MiB e sem downgrade. [Relatório original](BF-5_6E_TCG_DUELO_ARCANO_IMPLEMENTACAO.md); [ADR-029](decisions/ADR-029-duelo-arcano-regulamento.md).

## Dívida prioritária: retrabalho global da UI/UX do Arcanário

O proprietário avaliou **toda a experiência atual do Arcanário** como ruim de navegar, com partida difícil e cansativa por causa da tela, e manifestou intenção explícita de executar **fase posterior de refinamento/retrabalho global da interface**. Isso **não foi aprovado visualmente**, apesar do aceite do motor.

Sintomas visíveis nas capturas:
1. **Sobreposição e competição entre controles:** dock global inferior e barra de ações do duelo aparecem simultaneamente; controles da inspeção/ação ficam encobertos ou fragmentados.
2. **Mão e cartas cortadas:** visualização horizontal no retrato mostra cartas e nomes truncados nas bordas, exigindo navegação desconfortável.
3. **Rolagem longa e excesso de alternâncias:** campo, mão, inspeção da carta, botões de ação e histórico estão distribuídos verticalmente; invocar uma carta exige localizar seleção/ação por grandes distâncias de scroll.
4. **Safe areas/barra do Android:** conteúdos/títulos aparecem sob a barra de status em algumas capturas; conferir insets e responsividade.
5. **Hierarquia e densidade:** ações permanentes competem com ações contextuais; falta uma apresentação concisa do estado da partida em retrato.
6. **Escopo transversal:** Portal, Acervo, Baralhos, Oficina, Ecos, Provações, Biblioteca de Provas, Diagnóstico, Relicário, Duelo e navegação compartilhada devem ser auditados como sistema, não reparados em CSS isolado.

**Critério futuro:** fluxo curto e tátil, cards legíveis, ações sempre alcançáveis e sem sobreposição, acessibilidade, retorno seguro, retrato/paisagem, texto ampliado, transições suaves e Canvas residente preservado. Planejar redesign coeso em fase/rodada específica, não confundir com a arena 3D da F nem tratar como resolvido na E.

## Dívida artística

As 48 artes atuais são **gravuras SVG autorais geradas proceduralmente**, descritas como **abstratas** pelo proprietário, aceitáveis como primeira versão mas não como direção artística final. Refinamento futuro deverá considerar silhuetas, anatomia/objetos reconhecíveis, coesão e personalidade por carta, sem sacrificar desempenho no Moto G06 nem direitos/procedência. O retrabalho artístico é **pendente**, sem novas artes implementadas por esta aprovação.

## Dívida de equilíbrio e demais testes

- Simulação IA local: Ruína **59/72 vitórias** contra outras afinidades; Conhecimento **19/72** (Florescimento 32/72, Caos 34/72). Não há equilíbrio competitivo aprovado; investigar cartas/heurística e realizar validação humana maior.
- Ampla local: **1.144 PASS/13 FAIL**; reparos dirigidos revalidados, dois timeouts 3D Aryn/Ytha permaneceram na rodada ampla. E2E dirigido da E/Canvas PASS não certifica CI global.
- TalkBack humano, métricas sustentadas Android de FPS/memória/GPU/temperatura, restore destrutivo apenas em base descartável, regressões extensivas e fluxo visual global permanecem pendentes.
- Não iniciar automaticamente F/G, nem encerrar BF-5.6 pelo merge. O planejamento da reformulação de UX deve considerar a F para evitar retrabalho na arena e ser explicitamente autorizado.

## Encaminhamento

A `main` passa a conter **A–E**, com o marco educacional A–D e o primeiro TCG E. O próximo trabalho precisa ser escolhido conscientemente: implementar a F (arena/construção orbital) ou antecipar parte do retrabalho global de UI/UX para evitar construir a arena sobre uma experiência de navegação já considerada inadequada. O proprietário deseja retrabalho posterior; nenhuma ordem definitiva além da integração da E foi imposta nesta decisão.
