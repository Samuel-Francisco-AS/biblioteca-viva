# Arquitetura

## Visão de dependências

```text
presentation (React e Phaser) -> application -> domain
infrastructure ----------------> application ports
```

- `domain` contém entidades, invariantes, transições, erros e regras puras.
- `application` coordena casos de uso, transações e portas.
- `infrastructure` implementa persistência, plataforma, áudio e outros adapters.
- React apresenta fluxos convencionais e acessíveis.
- Phaser apresenta o mundo visual e emite intenções tipadas.

Domain não importa React, Phaser, Dexie, Capacitor, DOM ou browser. React e Phaser não acessam Dexie diretamente.

## Composição

O composition root cria adapters e casos de uso. Entradas externas passam por validação antes de chegar ao domínio. Entidade, atividade e marco aplicável são confirmados na mesma fronteira transacional; eventos são publicados somente após commit.

## Estado do mundo

`WorldStructureState` é a fonte persistida para pisos e peças estruturais de `world.main`. `PlacedObject` é outro agregado. Estrutura e objetos não compartilham placement, revisão ou regras de ocupação.

O bootstrap cria o blueprint somente quando a estrutura está ausente. Não reconhece uma edição pessoal como candidata a reset e não regrava restore válido.

Edição usa revisão esperada. Em conflito, a aplicação recarrega a projeção antes de uma nova intenção.

## Fronteira React–Phaser

React controla navegação, modo Construção, painéis, seleção acessível, mensagens e feedback. Phaser recebe `LibraryViewModel` e estado de cena, renderiza e emite interações. Entidades pessoais completas não atravessam essa fronteira quando uma projeção mínima é suficiente.

Há uma instância Phaser, uma cena e um canvas. Entrar e sair de Construção alterna estado e overlays sem desmontar o host. Sair da rota encerra o lifecycle.

## Autoridades estruturais

- `worldStructure.ts`: spans, intervalos, endpoints, cantos, ocupação e porta.
- `worldStructureAnalysis.ts`: perímetro, fechamento diagnóstico e identidade normalizada.
- `worldStructureEditing.ts`: colocar, mover, girar, guardar e editar piso.
- `structureVisualGeometry.ts`: metadado e transformação visual canônicos.
- `structureVisualTopology.ts`: normal interior derivada do piso.
- `structureVisualContinuity.ts`: comparação de perfis entre junções.
- `structureVisualDepth.ts`: depth pela base visível e desempate estável.
- `structureVisualFallback.ts`: fallback derivado da mesma geometria.
- `structureRenderPlan.ts`: transformação e depth materializados por placement.
- `constructionInput.ts`: interação baseada nas mesmas regiões do renderer.
- `SpatialWorldScene.ts`: aplicação do plano ao sprite ou fallback.

Campos visuais legados podem permanecer para compatibilidade, mas não são autoridade do renderer ativo. `wallComposition.ts` é histórico e não deve receber correção destinada ao runtime atual.

## Invariantes

- Nenhuma correção depende de blueprint, coordenada ou `instanceId`.
- Sprite, fallback, hit area, preview, seleção e depth derivam da transformação canônica.
- Normal interior depende apenas da adjacência do piso.
- Estado efêmero não entra no banco ou no backup.
- Mudança persistente exige migração aditiva e compatibilidade de backup.

## Decisões

Consulte `decisions/README.md`. O registro anterior, incluindo decisões substituídas, está em `history/legacy/DECISIONS_LEGACY.md`.
