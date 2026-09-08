# Estratégia de testes

## Camadas

- Domínio: factories, transições e regras puras.
- Aplicação: casos de uso, concorrência, transações e erros públicos.
- Persistência: schemas, Dexie v8, upgrade v7→v8, reabertura e backup v6.
- React: shell, navegação, formulários, foco e estados acessíveis.
- E2E: fluxos convencionais e placeholder da Biblioteca com dados fictícios.
- Android: build técnico; instalação e percepção continuam humanas.

## Comandos

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
```

Dados e backup exigem round-trip v6, rejeição segura de formato legado, checksum, duplicatas, transação e reabertura. O upgrade v7→v8 deve abrir sem erro, remover o mundo anterior e permitir criar/persistir novos registros.

Somente uma pessoa pode aprovar TalkBack, áudio percebido, toque, ergonomia, desempenho físico, instalação e atualização em aparelho real.
