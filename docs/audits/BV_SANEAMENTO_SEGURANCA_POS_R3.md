# Saneamento de segurança pós-R3 — 07/11/2026

Missão extraordinária anterior à R4, na branch `perf/bv-recuperacao-integral`,
PR #38 aberta/draft, sem merge. Base conferida e sincronizada:
`a29f2ca42cfd121044bfd8bda8019b01d2467211`; worktree inicialmente limpa.
Fedora 44, Node 24.18.0, npm 12.0.2. A aprovação humana da R3 e melhora de fluidez
no Moto G06 informadas pelo proprietário nesta missão são preservadas; não são
validação física das atualizações de dependências. R4/R5 não executadas.

## Etapa A — produção

`npm ci` do baseline PASS. `npm audit --json` reproduziu 24 ocorrências por
pacote: 14 moderadas, 9 altas, 1 crítica. `npm audit --omit=dev --json`: quatro
ocorrências (1 crítica, 3 altas), correspondentes a três advisories únicos.
A auditoria completa contém **49 advisories GHSA únicos**, não 24; wrappers
herdam alertas e certos pacotes agregam vários problemas. Evidências JSON em
[evidence/bv-security-post-r3](evidence/bv-security-post-r3).

| Dependência | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| @capacitor/android, @capacitor/core, @capacitor/cli | 8.4.2 | 8.4.3 | Correção coordenada patch; Android GHSA-rvm3-566m-v7fv / CVE-2026-103922 |
| react-router-dom → react-router | 7.18.1 | 7.18.5 | GHSA-qwww-vcr4-c8h2, corrigido desde 7.18.2 |
| zod | 4.4.3 | 4.6.7 | GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404, corrigido desde 4.6.6 |

Metadados do registry confirmaram versões estáveis, peer React >=18 e Router
Node >=20. Android requer Core ^8.4.0; App 8.1.1, Filesystem 8.1.2 e Share 8.0.1
aceitam Core >=8.0.0 e permanecem nessas versões. CLI requer Node >=22,
satisfeito pelo ambiente. Não foram alterados permissões, schema Dexie v14,
backup v6, semântica de validação ou runtime R1–R3.

No Android 8.4.3 instalado, `Bridge.launchIntent` bloqueia o caminho do proxy
antes de consultar plugins; `WebViewLocalServer` atende o proxy somente com
CapacitorHttp habilitado e recusa requisições de documento (main frame e
navegações com Upgrade-Insecure-Requests). O app não habilita CapacitorHttp;
isso sozinho não mitigava a versão anterior. A correção nativa exige novo APK.

O app usa BrowserRouter/Routes/Link e hooks convencionais, sem APIs RSC
experimentais, servidor React, actions RSC ou framework SSR. Ausência desse
caminho reduz exposição, mas a atualização foi aplicada mesmo assim.

Backup externo passa pelo limite de 10 MiB antes de JSON.parse e por schema
estrito, integridade, duplicatas e transação. Arrays de registros/notas/tags
não têm limite próprio de cardinalidade; o limite de bytes reduz exposição,
mas não é prova contra todo consumo excessivo. Planos de treino têm máximo 80
e cartas 1000. Regressões novas usam 512 notas inválidas e arquivo de 10 MiB +
1 byte, sem esgotamento real de memória, exigindo erro público e base intacta.

**Gate A: zero vulnerabilidades de produção**, exit 0. Auditoria completa
após A: 20 ocorrências (14 moderadas, 6 altas), investigadas na Etapa B.
