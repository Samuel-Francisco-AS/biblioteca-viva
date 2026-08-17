# Plano da fase de produto

> D-049 inicia formalmente a fase de produto. O protótipo e R1–R3 permanecem baseline técnico; gates humanos pendentes não são aprovados por este plano.

## P1 — Vida Registrada

Objetivo: tornar a Biblioteca Viva capaz de registrar o que a pessoa lê, assiste, aprende, pratica e constrói. Tipos oficiais: Livro, Filme, Série, Estudo, Atividade física e Trabalho.

### P1-A — Registros múltiplos e migração segura — tecnicamente concluído

- união discriminada de seis `LibraryEntry`;
- progresso especializado e invariantes por variante;
- CRUD, rotas, Coleção, busca e formulários unificados;
- notas generalizadas e citações em Livro, Filme, Série e Estudo;
- exclusão transacional;
- schema Dexie aditivo com preservação integral dos livros existentes;
- Phaser continua projetando somente livros.

### P1-B — Etiquetas, favoritos e sessões

- `Tag` como entidade normalizada;
- favoritos em registros, notas e citações;
- sessões tipadas, manuais ou cronometradas, com uma sessão aberta global;
- timer por timestamps e `Clock`, persistente e sem serviço em background;
- Arquivo generalizado;
- milestones históricos preparatórios para P2;
- backup v3, importando v1, v2 e v3, com sessão restaurada em estado seguro.

### P1-C — Histórico, timeline e estatísticas

- Estatísticas derivadas, sem tabela própria;
- janelas de 7 dias, 30 dias e todo o período;
- timeline por atividades e sessões concluídas;
- métricas honestas por tipo, sem score, ranking ou streak;
- resumo global na Biblioteca;
- fatos derivados reutilizáveis por P2, sem implementar salas.

## P2 — Biblioteca Evolutiva

Fase futura de múltiplas salas: Sala de Estudos, Sala de Projeção, Sala de Treino e Escritório. Inclui reputação das salas, desbloqueios, personagens e rotinas. P1 não implementa essa apresentação.

## P3 — Memória Conectada

Fase futura de calendário avançado, metas opcionais, ritmos, conexões entre registros, revisão, coleções e memória conectada. Não inclui coerção, streak punitiva ou julgamento de produtividade.

## Limites permanentes nesta operação

- local-first, privado e offline;
- sem conta, backend, sincronização, cloud ou social;
- sem múltiplas salas ou nova cena Phaser;
- sem saúde, calorias, GPS, sensores ou aconselhamento médico;
- sem gestão empresarial, timesheet corporativo ou colaboração;
- sem alteração automática da versão `0.2.0-alpha.1`.
