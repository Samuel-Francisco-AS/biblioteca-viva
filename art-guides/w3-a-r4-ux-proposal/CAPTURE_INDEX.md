# Capturas comparativas — estado atual × proposta R4

Todas as imagens abaixo são capturas automatizadas de viewport, sem dados pessoais. “Atual” é o preview de produção do worktree recebido; “Proposta” é o HTML/CSS/JS isolado deste diretório.

## Equivalentes principais

| Fluxo                       | Estado atual                                                               | Proposta                                                                       |
| --------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Biblioteca · 320×640        | ![Biblioteca atual 320×640](captures/current/library-320x640.png)          | ![Biblioteca proposta 320×640](captures/proposal/library-320x640.png)          |
| Biblioteca · 360×800        | ![Biblioteca atual 360×800](captures/current/library-360x800.png)          | ![Biblioteca proposta 360×800](captures/proposal/library-360x800.png)          |
| Biblioteca · desktop        | ![Biblioteca atual desktop](captures/current/library-desktop-1280x800.png) | ![Biblioteca proposta desktop](captures/proposal/library-desktop-1280x800.png) |
| Navegação móvel             | ![Drawer atual](captures/current/navigation-drawer-320x640.png)            | ![Navegação inferior proposta](captures/proposal/library-320x640.png)          |
| Construção · entrada        | ![Construção atual](captures/current/construction-default-320x640.png)     | ![Construção proposta](captures/proposal/construction-explore-320x640.png)     |
| Construção · palette        | ![Palette atual](captures/current/construction-palette-320x640.png)        | ![Palette proposta](captures/proposal/construction-palette-320x640.png)        |
| Construção · seleção        | ![Seleção atual](captures/current/construction-selection-360x800.png)      | ![Seleção proposta](captures/proposal/construction-selection-360x800.png)      |
| Coleção · 320×640           | ![Coleção atual 320×640](captures/current/collection-320x640.png)          | ![Coleção proposta 320×640](captures/proposal/collection-320x640.png)          |
| Coleção · 360×800           | ![Coleção atual 360×800](captures/current/collection-360x800.png)          | ![Coleção proposta 360×800](captures/proposal/collection-360x800.png)          |
| Coleção · desktop           | ![Coleção atual desktop](captures/current/collection-desktop-1280x800.png) | ![Coleção proposta desktop](captures/proposal/collection-desktop-1280x800.png) |
| Cadastro de livro · 320×640 | ![Cadastro atual](captures/current/book-editor-320x640.png)                | ![Cadastro proposto](captures/proposal/book-editor-320x640.png)                |
| Detalhe · 360×800           | ![Detalhe atual](captures/current/detail-360x800.png)                      | ![Detalhe proposto](captures/proposal/detail-360x800.png)                      |
| Sessão ativa · 360×800      | ![Sessão atual](captures/current/session-active-360x800.png)               | ![Sessão proposta](captures/proposal/session-active-360x800.png)               |
| Arquivo · 320×640           | ![Arquivo atual](captures/current/archive-320x640.png)                     | ![Arquivo proposto](captures/proposal/archive-320x640.png)                     |
| Estatísticas · 360×800      | ![Estatísticas atuais](captures/current/statistics-360x800.png)            | ![Estatísticas propostas](captures/proposal/statistics-360x800.png)            |
| Ajustes · 320×640           | ![Ajustes atuais](captures/current/settings-320x640.png)                   | ![Ajustes propostos](captures/proposal/settings-320x640.png)                   |
| Backup · 360×800            | ![Backup atual](captures/current/backup-360x800.png)                       | ![Backup proposto](captures/proposal/backup-360x800.png)                       |

## Estados adicionais da proposta

- [Carregando](captures/proposal/library-loading-320x640.png)
- [Erro recuperável](captures/proposal/library-error-320x640.png)
- [Canvas indisponível](captures/proposal/library-canvas-unavailable-320x640.png)
- [Coleção vazia](captures/proposal/collection-empty-320x640.png)
- [Seletor dos seis tipos](captures/proposal/entry-type-picker-320x640.png)
- [Construção: colocar](captures/proposal/construction-placing-360x800.png)
- [Construção: mover](captures/proposal/construction-moving-360x800.png)
- [Construção: piso](captures/proposal/construction-floor-360x800.png)
- [Construção: confirmação](captures/proposal/construction-confirm-360x800.png)

## Estados adicionais atuais

- [Biblioteca vazia](captures/current/library-empty-320x640.png)
- [Coleção vazia](captures/current/collection-empty-320x640.png)
- [Seletor atual dos seis tipos](captures/current/entry-type-picker-320x640.png)
- [Construção atual: piso](captures/current/construction-floor-360x800.png)
- [Alto contraste + texto maior: Coleção](captures/current/collection-high-contrast-text-larger-320x640.png)
- [Alto contraste + texto maior: Biblioteca](captures/current/library-high-contrast-text-larger-320x640.png)
- [Alto contraste + texto maior: Construção](captures/current/construction-high-contrast-text-larger-320x640.png)

## Implementação real de R4 — primeira entrega

Estas cinco capturas vêm do preview de produção da aplicação real depois da integração do shell. Elas ficam em `captures/implementation/`, separadas das 50 imagens da auditoria/proposta e das evidências oficiais B2:

- [Biblioteca real · desktop 1280×800](captures/implementation/library-desktop-1280x800.png);
- [Biblioteca real · 320×640](captures/implementation/library-320x640.png);
- [Biblioteca real · 360×800](captures/implementation/library-360x800.png);
- [Coleção convencional · 320×640](captures/implementation/collection-320x640.png);
- [Construção real sem dock global · 320×640](captures/implementation/construction-320x640.png).

As capturas da Biblioteca usam o canvas Phaser, a estrutura persistida, os assets e a câmera reais. A etiqueta aparece durante seu ciclo de cinco segundos; a captura de Construção comprova apenas a ausência do dock no estado inicial da tarefa, não a futura máquina completa.
