# BF-5.6D — Biblioteca de Pacotes e Acervo Expansível

Candidata autorizada em 09/11/2026 sobre `ab742f8` (main com PRs #43/#44/#45 integradas). Execução contínua D1 → D2 → D3, uma única PR draft, sem merge/release/E–G. Gate físico A+B+C continua parcial; reparos de etiquetagem e contraste aguardam reteste Android.

## D1 — Fundação

Manifesto v1, IDs estáveis por aplicação/caderno/idioma, lotes UTF-8 com SHA-256, validação estrita/limites e operações atômicas de instalação, atualização, remoção e reinstalação. Revisões imutáveis e histórico preservados. Dexie v18 aditivo, backup v10 com importação v6–v9 e limite de 10 MiB. Contrato e retenção: [ADR-028](decisions/ADR-028-pacotes-educacionais-retencao.md).

Testes dirigidos: primeira rodada integrada 93 PASS/1 FAIL (expectativa antiga da lista de tabelas); atualização da expectativa e reforço v9 verificados na rodada final D1. Resultado e commits consolidados no D3.

## D2 e D3

Em execução; resultados, fontes, evidências e roteiro serão registrados nesta mesma missão antes da publicação.

## Verificação D2 em andamento

React: 3/3 novos casos PASS; regressão conjunta inicial 36 PASS/1 FAIL de fixture de rota no teste do Portal, corrigida e 3/3 PASS na suíte nova. Build web PASS. Primeiro E2E foi interrompido por coordenação incorreta com build ainda ativo; não conta como gate. Rodada válida seguinte: 2 PASS/2 FAIL — reparos C de etiqueta/Enter/contraste e arquivos inválidos/recuperação PASS; Canvas histórico expira antes do Arcanário; reinstalação web offline após reload revelou módulo lazy ainda dependente de rede. Correção acrescenta cache web opcional de arquivos públicos, com hashes do envelope fixados no aplicativo; assets do APK continuam locais. Revalidação dirigida do fluxo D após correção registrada adiante. Sem repetição especulativa do Canvas, timeout ampliado ou remoção de asserts.

D2 final: 19/19 pacotes + UI PASS; E2E D 2/2 PASS após cache público e seletor inequívoco do título h2 no último assert. Instalar lote 1, reimportar sem duplicar, acrescentar lote 2, abrir Acervo, responder/pausar/reabrir, praticar offline, remover/reinstalar offline, preservar IDs/respostas e paisagem sem overflow comprovados. Gate físico e Canvas continuam pendentes. Capturas em `docs/audits/evidence/bf56d/`.
