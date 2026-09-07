# Estado atual

> Referência documental: 2026-09-07. Estado técnico consolidado até 2026-09-06.

## Produto

- Versão declarada: `0.2.0-alpha.1`.
- Stack: React, Phaser, Dexie e Capacitor.
- Operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- Seis tipos de registro: livro, filme, série, estudo, atividade física e trabalho.
- Notas, citações, etiquetas, favoritos, sessões, histórico e estatísticas estão implementados.

## Biblioteca visual

- W3-A e sua rodada corretiva R0–R6 estão encerradas.
- R6 foi aprovada no Moto G06 em 2026-09-06.
- `WorldStructureState` persiste pisos e peças estruturais em `world.main`.
- `PlacedObject` permanece separado da estrutura.
- O editor permite adicionar e remover pisos, colocar, mover, girar e guardar paredes, cantos e porta horizontal.
- A estrutura visual usa transformação canônica, normal topológica e perfis comparáveis; a regressão final passou 9/9 casos e 31/31 junções.
- A navegação usa dock único; Construção oculta o dock sem desmontar o canvas.
- Busca e Filtros iniciam recolhidos nas superfícies correspondentes.

## Dados

- Dexie: schema v7.
- Backup: formato v5.
- Leitura de backups v1 a v4 preservada.
- Estrutura, objetos, preferências, sessões, etiquetas e marcos participam da política de backup conforme seus contratos.
- Inventário estrutural é derivado de reserva inicial, placements e concessões persistidas.

## Validação encerrada

- continuidade estrutural e fallback;
- fluxo web da Construção e do Resumo;
- build web, sync Android e APK debug técnico da rodada final;
- preservação dos dados pessoais observada no Moto G06 durante R6;
- ausência dos controles superiores obsoletos e funcionamento do dock, Busca e Filtros no aparelho.

## Problemas e validações abertas

- demora perceptível na abertura inicial da Biblioteca no Moto G06;
- engasgo perceptível no card do Resumo;
- perfil físico de desempenho ainda não aprovado como resolvido;
- auditoria manual completa com TalkBack e tecnologias assistivas;
- validação auditiva final no aparelho;
- revisão final de procedência/licenças dos assets antes de release;
- assinatura, atualização sobre release anterior e publicação Android.

## Próxima etapa planejada

A sequência de produto já definida continua em **W3-B — Estantes reais**. A etapa deve integrar as quatro orientações de estante, pivôs, footprints, seleção, movimento e rotação sobre a infraestrutura de `PlacedObject` existente.

Depois dela, o roteiro segue nesta ordem:

1. W3-C — livros derivados dos registros;
2. W3-D — primeiro livro e desbloqueio permanente da estante;
3. W3-E — livro ativo e manipulável no mundo;
4. W3-F — painel React em forma de livro para visualização e progresso.

W3-B a W3-F estão planejadas, mas ainda não iniciadas. Cada etapa precisa de contrato executável, fora de escopo, testes e gate humano antes da implementação. A demora inicial da Biblioteca, o engasgo do Resumo, acessibilidade e áudio permanecem preocupações transversais e não substituem a sequência da W3. Ver `W3_PLAN.md`.
