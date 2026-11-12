# BF-5.7B2.4 — remoção estrutural do TCG

## Estado da entrega

- Base solicitada: `feat/bf-5-7b2-retire-duel-ui`
- SHA inicial confirmado: `02c9251e866c64606023f8d80838776c9093a56c`
- Branch desta missão: `feat/bf-5-7b2-remove-tcg-engine`
- PR: [#56](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56), draft, encadeada à B2.3
- Merge, Actions e validação Android: não realizados

## Matriz de dependências

| Área | Evidência | Classificação | Ação |
| --- | --- | --- | --- |
| Motor, IA, efeitos, catálogo e simulação | `src/domain/duel/`, `src/application/duels.ts` | Exclusiva do TCG | Removidos |
| Arena, editor, salão, regras, decks e replay visual | `src/features/duel/` | Exclusiva do TCG | Removidos |
| Bootstrap e runtime | `src/app/createApplication.ts` | Exclusiva do TCG | `DuelService` e `application.duels` removidos |
| Cartas comuns, flashcards, questões, Provações e baralhos educativos | `src/domain/arcanarium.ts`, `src/application/arcanarium*.ts` | Compartilhada | Contratos de combate removidos; fluxo educativo preservado |
| Persistência Dexie e identidade da base | `src/infrastructure/database/` | Compartilhada | Dexie v19 e `biblioteca-viva-bf57` preservados |
| Codec de backup | `src/infrastructure/backup/backupCodec.ts` | Compartilhada com descarte explícito | Formato atual v12; dados TCG rejeitados |
| Lua orbital e interação Three.js | `src/features/library/three/orbitalArena.ts`, `WorldHost.tsx` | Necessária à lua | Mantida; textura realocada para `public/assets/arcanarium/` |
| `portal:duelo-arcano` | raycast, seletores e redirects legados | Identificador técnico/histórico | Mantido temporariamente; destino é `/arcanario` |
| PNG de auditoria | `docs/audits/evidence/bf56f-refinement/lua-no-mundo.png` | Alteração preexistente | Preservado fora desta missão |

## Remoções produtivas

Foram removidos o motor e os contratos em `src/domain/duel/`, o serviço
`src/application/duels.ts`, toda a apresentação em `src/features/duel/`, o
teste de banco `src/infrastructure/database/duels.test.ts`, o fixture
`src/test/duelFixtures.ts`, os scripts de arte/simulação e os diretórios
`assets/duel/` e `public/assets/duel/`.

Também foram retirados do modelo ativo `type: "combat"`,
`kind: "combat_match"`, decks de combate, atributos e validações de replay.
A Oficina, o Acervo, os contadores e as apresentações agora trabalham apenas
com os contratos educativos restantes.

## Schema e backup

O banco não foi reiniciado nem migrado novamente: a identidade
`biblioteca-viva-bf57` e o Dexie v19 permanecem inalterados. A mudança foi
necessária no contrato de backup, portanto a versão gerada passou de v11 para
v12. Backups v11 continuam legíveis somente quando o conteúdo é compatível
com o Arcanário atual; cartas `combat`, decks de combate e sessões
`combat_match` são rejeitados explicitamente com `INVALID_BACKUP_DATA`.

Checksum SHA-256, validações de ownership, vínculos, revisões, transações e
política de substituição foram preservados. Não há reset implícito nem
aceitação silenciosa de dados parcialmente restaurados.

## Lua orbital

A lua continua orbitando a Biblioteca, interativa pelo Canvas e pelos
controles acessíveis, respeitando o ciclo de vida do mundo e abrindo
`/arcanario`. A dependência exclusiva `duelArtUrl` foi removida; a textura
necessária foi realocada para `public/assets/arcanarium/unwritten-book.webp`.
O motor de combate não é importado pelo runtime orbital. O identificador
`portal:duelo-arcano` permanece apenas como dívida técnica de compatibilidade
com raycasts, seletores e redirects.

## Assets e apresentação

Assets SVG/WebP, atlases, manifestos e scripts exclusivos do TCG foram
apagados. Recursos compartilhados do mundo, habitantes, Arcanário educativo
e lua orbital foram preservados. A limpeza de estilos removeu regras de
arena/combate sem remodelar a lua nem alterar a arte educacional.

## Testes e validação

Resultados desta rodada:

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; aviso preexistente de chunks acima de 500 kB |
| `npm run test:run` | PASS — 181 arquivos, 1203 testes |
| Suítes dirigidas de Arcanário, backup, persistência e lua | PASS — 44 testes |
| E2E B2.3/B2.4 dirigido | 7/10 PASS; 3 falhas de timeout/estabilidade documentadas |
| Android/Moto G06, TalkBack, termal e memória sustentada | Não executados |
| GitHub Actions/CI | Não executado; cota indisponível |

As falhas E2E restantes envolvem instabilidade/timeout no fluxo orbital e no
retorno/lifecycle do Canvas; não foram convertidas em PASS por retry. O
seletor ambíguo do teste de criação de carta de combate aposentada foi
corrigido para um alvo estrutural, mas a suíte completa ainda não foi
certificada. O build não mostrou dependências produtivas do motor ou assets
exclusivos do duelo; o chunk Three.js grande permanece esperado.

## Dívidas para B2.5

- Executar a suíte E2E dirigida em ambiente estável e investigar os timeouts
  orbital/lifecycle sem ampliar prazos ou remover asserts.
- Avaliar a renomeação futura de `portal:duelo-arcano` após estabilizar
  seletores e raycasts.
- Fazer gate físico do Arcanário e da lua no Moto G06.
- Não reintroduzir o TCG, nem iniciar B2.5 automaticamente nesta entrega.

## Revisão R1 — 12/11/2026

A leitura de v19 intermediária com TCG foi reproduzida como incompatível.
A R1 acrescenta reparo seletivo/transacional e testes de reabertura, além de
fixture v11 validada pelo codec histórico. A afirmação anterior sobre ausência
de migração descreve somente a entrega original: agora existe reparo de dados
com marcador, sem mudança de nome/schema. Ver [relatório R1](BF-5_7B2_4_R1_SANEAMENTO.md)
para resultados atuais e bloqueadores; os resultados acima são históricos.
