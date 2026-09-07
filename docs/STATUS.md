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

## Próxima decisão

Não há etapa de implementação autorizada. Antes de iniciar trabalho de produto, escolher e especificar uma fatia entre as possibilidades já registradas:

- estantes reativas;
- livros visuais vinculados às atividades;
- livro aberto manipulável;
- leitor com apresentação em forma de livro;
- estabilização de desempenho percebido.

A escolha deve definir objetivo, fora de escopo, evidência e impacto em dados antes de entrar em `ROADMAP.md` como trabalho aprovado.
