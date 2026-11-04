# BF-5 — candidata integrada de apresentação

Data: 2026-11-03. Base sincronizada: `7ca9043`. Branch: `feat/bf-5-uiux-global-rework`.

**Estado: candidata para revisão, sem encerramento da BF-5 ou aceite artístico/ergonômico.** Não há autorização de merge, release ou publicação. O trabalho muda apresentação nas cinco abas, preservando os motores existentes; a profundidade artística desta primeira proposta precisa ser julgada pelo proprietário.

## Linguagem e implementação

Tinta azul profunda, marfim, luz violeta e acentos espectrais, títulos editoriais em fontes locais, superfícies com gradação discreta e cartões com lombadas por famílias de registro. Dock compartilhado com marca ativa, respostas finitas ao toque e revelação curta. Sem downloads, novas dependências, fontes externas ou mudanças de licença.

- **Biblioteca:** canvas ocupa o viewport acima do dock; cabeçalho convencional removido. Listagens, diagnóstico e seleção sem canvas são superfícies recolhidas. Fallback abre alternativas semânticas. Toque primário BF-4 preservado; ações adicionais de objeto selecionado em faixa contextual. Histórias, diário e escolhas ficam sobre o mundo, com rolagem própria, identificação por nome e sigilo decorativo, saída por Back/Escape e safe areas.
- **Coleção:** introdução editorial inclusive no vazio, categorias diretas dos seis tipos, alternância entre cartões e lista compacta; busca, filtros, parâmetros e links de detalhe preservados.
- **Arquivo:** câmara editorial com campo de busca destacado, notas e citações em composição documental, hierarquia e datas. Sem inventar novas entidades ou operações.
- **Resumo:** observatório com métricas destacadas e gráfico em superfície própria; cálculos, unidades, períodos e histórico reais preservados.
- **Ajustes:** introdução e organização responsiva, atalhos para conforto, áudio, dados e backup; confirmações de restauração preservadas.

Base compartilhada: tokens CSS, `RealmIntro`, componentes existentes de dock/botões/cards, variantes de composição e transições. Nenhum schema, versão de banco, backup, domínio, engine narrativa, seleção Three ou contrato de ownership/disposal foi alterado.

## Gates e falhas

- Typecheck PASS; build web PASS; áudio PASS.
- Format check PASS e lint PASS nas rodadas realizadas.
- Suíte integral: **708 PASS / 1 FAIL, 91 arquivos**. Falha: `inhabitantAgency.test.ts`, encontro autônomo, timeout de 5000 ms. O mesmo teste passou na rodada dirigida inicial. Não se atribui a causa à dívida BF-4; nenhum timeout foi aumentado.
- Rodada dirigida final de React: **56 PASS / 6 arquivos**, cobrindo página, shell, WorldHost, narrativa, feedback e Coleção.
- E2E dirigido: **3 PASS** — RPG pelo canvas, RPG sem WebGL e novo BF-5 de cinco abas/densidade/escape.
- Falhas intermediárias reais: fixture procurava título antigo; painéis recolhidos exigiam abertura nos testes; painel de fallback interceptava Diário; regras responsivas antigas competiam com canvas full-screen. Corrigidas sem remoção de asserts ou skips. O E2E pelo canvas também excedeu 30 s antes da correção de composição; a execução seguinte passou, sem prova isolada da causa do timeout.
- Android debug: build realizado com sucesso; hash do artefato final abaixo.
- Bundle: relatório estrutural emitido; não equivale a FPS, memória física ou desempenho sustentado.
- CI remota e suíte E2E completa não declaradas PASS. Baseline PR #18 (30 PASS, 3 FAIL, 1 flaky), #4/#11/#15, R-19, Lua F3, TalkBack e carga sustentada continuam pendentes.

## Evidências e limites

Capturas em `artifacts/bf5/`: cinco abas em 390×844 e 844×390, mais diálogo em ambas orientações. Conteúdo vazio/fictício, navegador Chromium isolado. Os E2E RPG geram capturas adicionais em `test-results/` (não versionadas). A primeira tentativa de captura falhou no protocolo; capturas posteriores foram obtidas com SwiftShader explícito.

Limites: diagnóstico do runtime permanece recolhido junto ao mundo, não em Ajustes. Capas/miniaturas não foram adicionadas. A densidade da Coleção é preferência de sessão. Arquivo e Resumo conservam suas estruturas funcionais de agrupamento e cálculo, recebendo composição visual; não foram criadas capacidades adicionais. Capturas não comprovam teclado Android, TalkBack, todas as escalas de texto/alto contraste, todas as narrativas nem ergonomia física. Os sigilos são ornamentos, não retratos dos habitantes.

## Roteiro Moto G06

1. Abrir Biblioteca, pan/pinch/tap e girar o aparelho; verificar alcance do dock e ausência de saltos ao conversar.
2. Tocar objeto vivo, executar ação adicional, selecionar registro e abrir detalhe; retornar.
3. Conversar com um habitante, escolher, adiar, abrir diário, retomar e concluir; testar Back em retrato/paisagem.
4. Na Coleção, criar/editar um registro fictício, alternar categorias e densidade, buscar com teclado aberto.
5. No Arquivo, buscar nota/citação; no Resumo, comparar métricas com registros reais; em Ajustes, testar movimento reduzido, texto e contraste.
6. Background/resume, áudio e uso prolongado. Não restaurar dados reais durante avaliação sem estratégia de recuperação.

## APK final

- Caminho local relativo: `android/app/build/outputs/apk/debug/app-debug.apk`
- SHA-256: `9dd9f59535052bc23f5d2b289af6d9af57cf7d65abfaa7fa7db58da9ea17326b`
- Build final: `BUILD SUCCESSFUL`. APK ignorado pelo Git; não publicado.
- As capturas antecedem somente o último ajuste de contraste do feedback e peso do summary de objetos.
