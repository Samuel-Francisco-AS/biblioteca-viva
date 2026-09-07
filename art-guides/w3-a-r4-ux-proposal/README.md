# Biblioteca Viva — proposta navegável R4

Este diretório é um artefato de avaliação isolado. Ele não importa código da aplicação, não grava dados, não altera rotas de produção e não representa redesign aprovado.

## Abrir

Sirva a raiz do repositório com qualquer servidor HTTP local e abra:

`/art-guides/w3-a-r4-ux-proposal/index.html`

Exemplo, sem instalar dependências:

```text
python3 -m http.server 4180 --bind 127.0.0.1
```

Depois acesse `http://127.0.0.1:4180/art-guides/w3-a-r4-ux-proposal/index.html`.

O seletor “PROPOSTA R4” permite saltar entre todas as telas e estados. Dentro da interface, a navegação inferior, os registros, as ações de sessão, Ajustes, backup e todos os estados da Construção também são clicáveis. Escape fecha primeiro o contexto mais interno.

## Roteiro curto de revisão

1. Biblioteca → `Resumo` → `Abrir Coleção`.
2. Coleção → `Filtros` → um registro → `Iniciar sessão` → `Concluir`.
3. Coleção → `Novo registro` → escolher tipo → preencher/salvar.
4. Arquivo e Resumo/Estatísticas pela navegação inferior.
5. Ajustes → Experiência, Áudio e Backup/restauração.
6. Biblioteca → Construir → Estruturas → Parede longa → Colocar.
7. Construção → Peças colocadas → selecionar → Mover, Girar ou Guardar.
8. Em cada subestado da Construção, usar Escape para conferir a ordem de retorno.

## Estados diretos

- `?screen=library`
- `?screen=library-loading`
- `?screen=library-error`
- `?screen=library-canvas`
- `?screen=collection` e `?screen=collection-empty`
- `?screen=editor` e `?screen=editor&variant=book`
- `?screen=detail`, `?screen=session`, `?screen=archive`
- `?screen=statistics`, `?screen=settings`, `?screen=backup`
- `?screen=construction-explore`
- `?screen=construction-palette`
- `?screen=construction-placing`
- `?screen=construction-select`
- `?screen=construction-moving`
- `?screen=construction-floor`
- `?screen=construction-confirm`

Acrescente `&clean=1` para ocultar a barra exclusiva de revisão, como nas capturas automatizadas.

## Evidências

- [Relatório de auditoria e proposta](AUDIT_AND_PROPOSAL.md)
- [Índice comparativo de capturas](CAPTURE_INDEX.md)
- `captures/current/`: interface atual em preview de produção, com origem descartável e dados fictícios.
- `captures/proposal/`: proposta estática nos mesmos viewports.
- `captures/*/audit-metrics.json`: medidas automatizadas de viewport, overflow, controles e painéis.

## Limites honestos

As capturas foram produzidas em Chromium headless. Elas não comprovam toque real, teclado virtual, safe areas físicas, TalkBack, percepção de contraste, áudio ou desempenho no Moto G06. O mapa do protótipo é uma composição CSS estática para avaliar hierarquia e oclusão; não propõe alteração de Phaser, câmera, geometria ou assets.
