# Manutenção e evolução

## 1. Rotina base

Leia `STATUS`, `AGENTS`, o documento da área e `DECISIONS`. Instale com `npm ci`, mantenha o lockfile e faça mudanças verticais pequenas. Não atualize React, Vite, Phaser, Capacitor, Dexie e o banco no mesmo lote.

## 2. Conteúdo e diálogos

Nova fala no contexto existente:

1. crie a chave em `src/content/locales/pt-BR.ts`;
2. adicione a definição em `src/content/prototypeContent.ts` com ID estável, personagem, evento, prioridade, `once` e cooldown;
3. valide referências em `src/content/schemas.ts` e execute `src/content/content.test.ts` e `src/application/dialogue.test.ts`.

Novo contexto exige primeiro um fato estruturado realmente conhecido. Amplie os contratos em `src/application/dialogue.ts`, forneça fallback, integre pela aplicação/React e teste cooldown/once. Não envie título, autor ou anotações ao selector; Phaser continua emitindo somente interação tipada.

## 3. Áudio

Adicione ou substitua arquivos em `public/audio/`, atualize somente `sources` do cue estável em `src/infrastructure/audio/audioManifest.ts`, o gerador determinístico quando aplicável e `docs/ASSET_REGISTRY.md`. Para música adicional, acrescente cue musical e seu ID na ordem desejada de `AUDIO_PLAYLISTS`; a validação rejeita referências ausentes, duplicadas, não musicais ou playlist vazia. Execute `npm run audio:check` para os WAVs físicos atuais e testes de manifesto/backend/serviço. Ausência de asset degrada para silêncio. Para duplicação, confira `AudioService.diagnostics()`, `useAudioExperience.ts`, música desejada, índice/geração, players ativos e eventos visibility/Capacitor; reproduza término natural, wrap-around, entrada, pause, resume, saída e dispose antes de mudar a arquitetura.

## 4. Decorações e marcos

Decoração: registre ID e recompensa em `src/content/prototypeContent.ts`, valide referências, projete somente o ID em `LibraryViewModel` e desenhe fallback procedural na cena. Registre asset/licença.

Marco: acrescente definição declarativa ao conteúdo, condição suportada pelo `MilestoneEngine` e teste domínio, transação, concorrência e idempotência. `DexieMilestoneStore` usa chave estável e `add`; evento/reação somente após commit. Se a forma persistida mudar, siga também migração e backup.

## 5. Dexie e backup

Migração:

1. não edite versões publicadas em `src/infrastructure/database/database.ts`/`schema.ts`;
2. adicione nova versão e migração aditiva;
3. valide toda leitura;
4. crie fixtures de versão anterior e testes de upgrade/reabertura/rollback;
5. atualize `DATA_MODEL`, `DECISIONS`, backup e checklist Android.

Formato de backup: altere contratos em `src/application/backup.ts`, codec em `src/infrastructure/backup/backupCodec.ts` e store em `dexieBackupStore.ts`. Preserve versões anteriores quando houver política segura, checksum canônico, inspeção sem escrita, limite de 10 MiB e restauração transacional. Atualize fixtures/testes v1/v2 e documentação.

Para restaurar, use Configurações → Arquivo de backup → inspecionar → confirmar. Em base preenchida, escolha explicitamente criar backup de segurança pelo fluxo existente ou continuar sem ele após a confirmação adicional; em base vazia, não crie backup artificial. Nunca limpe dados físicos antes de confirmar cópia externa. Em erro de persistência, registre apenas código sanitizado; verifique suporte/origem, schema, validação na leitura, transação e `navigator.storage.persist()`, sem copiar conteúdo pessoal.

## 6. Phaser e performance

Confirme primeiro `npm run performance:report`. Para regressão visual, verifique import lazy em `LibraryVisualHost.tsx`, uma instância/canvas, observer/listener, `SpatialWorldScene.shutdown`, zonas, tweens, pan e resize. W1 mantém `World/Space/Connection` efêmeros; não adicione persistência espacial, `PlacedObject` ou Dexie sem iniciar W2 com migração/backup/testes. Use o build diagnóstico e os testes de 20 ciclos. Não force context loss ou split manual sem evidência. Phaser nunca recebe entidades completas.

## 7. E2E e CI

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

`playwright.config.ts` inicia `vite preview` em `127.0.0.1:4173`. `e2e/fixtures.ts` limpa apenas IndexedDB dessa origem via CDP. Fixtures são pequenas e fictícias. Falha gera trace em `test-results/`; reproduza pelo nome do teste e use `npx playwright show-trace <arquivo>`.

`.github/workflows/ci.yml` usa Node 22, `npm ci`, Chromium, formatação, lint, tipos, Vitest, áudio, build, relatório de performance e E2E. Workflow hospedado só é comprovado após push. Falha de CI deve ser reproduzida no mesmo comando, sem relaxar check. Android permanece local para evitar SDK/Gradle na CI inicial.

## 8. APK e release futura

```bash
npm run android:sync
npm run android:build:debug
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Registre tamanho, SHA-256 e integridade ZIP; não instale ou assine sem escopo. Release futura exige `docs/ANDROID_RELEASE.md`, checklist G11, keystore fora do Git, versão/changelog, atualização sobre build assinado anterior e testes físicos completos.

## 9. Débitos classificados

Antes de G11: checkpoint humano G4/G7–G10, nova restauração física, identidade/ícone/splash, revisão de assets/licenças, assinatura e checklist release.

Pós-W1: W2 só começa após validação humana da composição; editor, salas temáticas novas, conta e backend seguem fora de escopo. Avaliar retenção/apresentação de atividades históricas somente se surgir um consumidor; SQLite somente se gatilhos documentados ocorrerem.

Opcionais condicionados a evidência: preservar offset da música, comprimir WAVs, dividir o chunk lazy do Phaser, segunda configuração Android. Visual procedural e fallback local são decisões deliberadas até revisão artística, não defeitos automáticos.

## P1-B — manutenção

Ao evoluir sessões, preservar a regra de uma aberta globalmente, o `Clock` como verdade e a política de restore `active → paused`. Novos detalhes específicos entram na união e no schema correspondente, nunca em payload amorfo. Mudança de `normalizedName`, índice único, duração ou status exige migração e testes de colisão/rollback. Backup v1/v2 continua sendo validado no formato original.
