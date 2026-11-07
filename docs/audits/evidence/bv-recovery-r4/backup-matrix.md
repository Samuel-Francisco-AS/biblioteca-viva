# Matriz v6 / Dexie v14 (fixtures fictícias)

Reprodução: `npx vitest run src/infrastructure/backup src/features/settings/SettingsPage.test.tsx src/infrastructure/files/androidBackupFileSave.test.ts src/infrastructure/database/{inhabitantContinuityRepository,nightLightingRepository,entertainmentPersistence,recordImages}.test.ts`.

| Caso | Evidência / resultado |
|---|---|
| 1 vazia | r4Integrity round-trip false, igualdade após reopen PASS |
| 2 seis tipos | round-trip true, seis IDs/entidades preservados PASS |
| 3 notas/citações/vínculos | fixture livro/estudo + igualdade e órfãos rejeitados com checksum válido PASS |
| 4 tags/favoritos/opcionais | tag fictícia, favorito, autor e igualdade PASS |
| 5 sessões distintas | seis sessões manuais, respectivos tipos/kinds PASS |
| 6 quatro habitantes | codec completo + reopen, quatro IDs/posições/intenção/randomState PASS |
| 7 estado mundo/objetos | ledger noturno e continuidade em settings PASS; poses voláteis, leases, narrativas e livro em voo não pertencem ao backup |
| 8 mídia | JPEG fictício 720×1080, bytes e ownership em igualdade PASS |
| 9 ausente/inválido/truncado | string vazia/JSON quebrado/arquivo truncado rejeitados sem escrita PASS; ausência de escolha não inicia operação |
| 10 checksum | texto alterado, checksum ausente e incorreto PASS |
| 11 duplicatas/referências | IDs, notas, tags e sessões incompatíveis rejeitados; conteúdo malformado não altera destino PASS |
| 12 tamanho | limite 10 MiB no codec e UI antes de text/inspect PASS; sem arquivo gigante real |
| 13 cancelar | UI cancela confirmação sem import, seletor Android retorna cancelled normalmente; safety cancel preserva DB PASS |
| 14 falhas I/O | file.text rejeita antes de inspect/import; ExportBackup read failure; seletor/stream/flush/close cobertos PASS |
| 15 rollback | falha injetada em sessions.bulkAdd após clears e inserções anteriores; nove coleções iguais antes/depois/reopen PASS |
| 16 compatibilidade | v6 sem mídia e campos recentes suportado (testes anteriores de persistência); v1–v5 rejeitados deliberadamente, não conversão PASS |
| 17 fechar/reabrir | round-trip vazio/populado e rollback reabrem nova instância Dexie PASS |

Limites: IndexedDB em fake-indexeddb, sem interrupção de energia real, falha de armazenamento Android ou dados reais. Testes UI/adapter não equivalem a cancelamento físico do seletor. E2E restore/reload será registrado separadamente em R4D. O conteúdo de um arquivo host ausente é responsabilidade do seletor; não é arquivo vazio válido.
