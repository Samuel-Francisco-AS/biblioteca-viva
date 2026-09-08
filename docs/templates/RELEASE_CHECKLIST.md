# Checklist de release

## Qualidade automática

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:run`
- [ ] `npm run audio:check`
- [ ] `npm run build`
- [ ] `npm run performance:report`
- [ ] `npm run test:e2e`
- [ ] `npm run android:sync`
- [ ] `npm run android:build:debug`
- [ ] `git diff --check`

## Validação humana

- [ ] fluxos convencionais verificados com conteúdo fictício;
- [ ] backup pós-reset exportado e restaurado;
- [ ] APK validado em aparelho Android real;
- [ ] TalkBack, áudio percebido e desempenho físico registrados;
- [ ] documentação e changelog reconciliados;
- [ ] nenhum segredo, backup pessoal ou exportação real incluído.
