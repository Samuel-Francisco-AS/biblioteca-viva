# Evidências do saneamento pós-R3

Snapshot de 07/11/2026, base `a29f2ca42cfd121044bfd8bda8019b01d2467211`.
Dados exclusivamente técnicos e fixtures fictícias, sem backup ou exportação pessoal.

- `baseline-audit.json` / `baseline-production.json`: respostas npm audit do lock original (exit 1 esperado por alertas).
- `stage-a-production.json`: gate da correção prioritária (exit 0).
- `final-audit.json` / `final-production.json`: auditorias finais (exit 0).
- `baseline-inventory.json` / `final-inventory.json`: todos os nós do lock, dependências, peers e classificação dev/optional, sem caminhos absolutos.
- `dependency-changes.json`: diff de versões por caminho do lock, incluindo relocações/deduplicação.
- `advisory-classification.json`: 49 GHSA únicos com CVE, severidade, versão vulnerável/corrigida/adotada, cadeia e exposição.
- `lint-coverage.json`: os mesmos 427 arquivos examinados antes/depois do override, zero erros/avisos. Caminhos relativos.
- `ci-before.json`: snapshot normalizado dos runs antes do push, sem metadados pessoais.
- `validation-summary.json`: gates, falhas intermediárias, correção do backup, comparação da base e APK.
- `lifecycle.json`: um ciclo dirigido Chromium/SwiftShader com seis categorias, quatro GLBs e um pergaminho; não é Android físico nem estudo de memória sustentada.

Para reproduzir o baseline, criar checkout separado do SHA original e executar
`npm ci`, `npm audit --json`, `npm audit --omit=dev --json`, `npm ls --all --json`
e `npm explain <pacote>`. Não reverter a branch de trabalho nem dados reais.
Auditorias dependem do estado do serviço npm na data da consulta; os JSONs
preservam o snapshot original mesmo se advisories mudarem depois.

Comandos e resultados dos demais gates estão no relatório técnico ao lado.
Logs brutos locais não são versionados: contêm caminhos do ambiente, não são
necessários para reproduzir as auditorias. Nenhum binário APK entra no Git.
