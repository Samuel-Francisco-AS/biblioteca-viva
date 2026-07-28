# Contribuindo com a Biblioteca Viva

O projeto começa como uso pessoal e portfólio, mas adota disciplina de manutenção desde a fundação.

## Fluxo de trabalho

1. Consulte `docs/STATUS.md` e o próximo prompt.
2. Crie uma branch curta quando a mudança tiver risco ou duração relevante.
3. Execute um prompt do Codex por vez.
4. Revise o relatório e o diff antes do teste manual.
5. Aprove o gate antes de avançar.
6. Faça commit apenas após revisão humana.
7. Atualize documentação no mesmo commit do comportamento descrito.

## Commits

Mensagens devem descrever o resultado. Prefixos recomendados:

- `feat:` funcionalidade;
- `fix:` correção;
- `refactor:` reorganização sem mudança de comportamento;
- `test:` testes;
- `docs:` documentação;
- `build:` build, Android ou dependências;
- `chore:` manutenção.

Exemplo: `feat(storage): add versioned Dexie persistence`.

## Pull requests e revisões

Mesmo trabalhando sozinho, trate mudanças substanciais como revisão:

- objetivo claro;
- escopo delimitado;
- diff compreendido;
- testes automáticos concluídos;
- teste manual registrado quando necessário;
- screenshots ou vídeo para mudanças visuais;
- migração e restauração testadas quando dados mudarem;
- documentos atualizados.

## Dependências

Uma dependência nova precisa de:

- problema real que resolve;
- alternativa simples considerada;
- impacto no bundle e no Android;
- licença compatível;
- manutenção ativa;
- decisão registrada quando afetar arquitetura.

## Código gerado por IA

Código do Codex não é aceito por autoridade. Ele precisa ser lido, testado e explicado por uma pessoa antes do commit. Não mantenha abstração que ninguém consiga explicar apenas porque “os testes passaram”.

## Conteúdo e assets

Todo asset deve ter origem, licença e autoria registradas. Não adicione capas, músicas, fontes, sprites ou efeitos sem permissão de uso clara. Consulte `docs/ART_DIRECTION.md`, `docs/AUDIO.md` e `docs/CONTENT_GUIDE.md`.
