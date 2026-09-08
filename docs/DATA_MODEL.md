# Modelo de dados

## Dados convencionais

`LibraryEntry` é uma união discriminada de Livro, Filme, Série, Estudo, Atividade física e Trabalho. Notas e citações referenciam registros; etiquetas e favoritos organizam conteúdo; sessões registram duração e resultados; atividades sustentam histórico; settings guardam preferências.

O schema Dexie v8 possui:

```text
libraryEntries
notes
quotes
activities
tags
sessions
settings
metadata
milestones
```

A migração v7→v8 remove as tabelas espaciais antigas e limpa todos os dados de desenvolvimento anteriores. Novos dados criados em v8 persistem normalmente após fechamento e reabertura.

Marcos guardam apenas dez fatos convencionais, sem rewards, grants, decoração, diálogo ou efeito no mundo.

## Mundo

Nenhum estado espacial é persistido: `PlacedObject` e `WorldStructureState` não existem no schema ativo. O novo contrato espacial será projetado do zero em trabalho futuro.

## Backup

O formato vigente é v6. Ele inclui somente dados convencionais, usa política de substituição, validação estrita, limite de tamanho, detecção de duplicatas e checksum SHA-256 sobre representação canônica. Restore revalida e escreve em transação; backup de segurança continua disponível para destino preenchido.

Backups v1–v5 são deliberadamente incompatíveis com o baseline pós-reset e são rejeitados antes de qualquer escrita.
