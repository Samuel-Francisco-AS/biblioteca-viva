# Changelog

Mudanças relevantes da Biblioteca Viva serão registradas neste arquivo.

O formato segue a ideia de **Keep a Changelog** e o projeto utilizará versionamento semântico quando houver artefatos executáveis.

## [Não lançado]

### Adicionado

- nada registrado.

### Alterado

- nada registrado.

### Corrigido

- nada registrado.

### Removido

- nada registrado.

## [0.2.0-alpha.1] — 2026-07-29

### Adicionado

- domínio puro de livros, progresso, status, notas e citações, com operações imutáveis e erros tipados;
- schemas Zod de fronteira, eventos mínimos sem conteúdo pessoal e suíte de domínio em ambiente Node;
- camada de aplicação com portas assíncronas, oito casos de uso, atividades mínimas e erros públicos estáveis;
- testes Node de orquestração, ordem dos efeitos e falhas de repositórios, atividades e eventos;
- persistência local Dexie/IndexedDB com seis tabelas, migração v1 → v2, repositórios concretos e validação na leitura;
- transações para entidade e atividade, event bus local pós-commit, Clock e IDs de plataforma e composition root;
- diagnóstico técnico interno para desenvolvimento e APKs de gate, ausente do build normal;
- validação automatizada com 140 testes e validação manual de persistência no navegador e no Moto G06 com Android 15.

### Alterado

- documentação do modelo de dados, arquitetura e testes alinhada aos contratos dos Prompts 4–6;
- comandos de escrita passaram a usar a porta transacional, com publicação de eventos somente após o commit.

### Corrigido

- disponibilidade do painel técnico em APKs internos por um modo diagnóstico explícito, sem incluí-lo no build normal de produção.

### Removido

- nada registrado.

## [0.1.0] — 2026-07-28

### Adicionado

- fundação React, Vite e TypeScript estrito, com lint, formatação, testes e build web;
- shell responsivo e navegável com Biblioteca, Coleção, Novo livro, Arquivo e Configurações;
- integração Capacitor 8.4.2, plataforma Android e geração do primeiro APK debug;
- tratamento do botão Voltar nativo e das safe areas no shell Android;
- prova física no Moto G06 com Android 15, aprovando instalação, abertura, navegação, ciclo de vida e encerramento pela raiz.

### Alterado

- Gates G0, G1 e G2 aprovados; Blocos 0, 1 e 2 concluídos.

## Como atualizar

- registre mudanças observáveis, não cada arquivo tocado;
- mova itens de “Não lançado” para uma versão somente após gate aprovado;
- use datas absolutas no formato `AAAA-MM-DD`;
- nunca reescreva versões antigas para esconder decisões ou regressões.
