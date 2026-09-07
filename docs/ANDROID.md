# Android e release

## Stack e identidade

O Android usa Capacitor e o projeto nativo versionado em `android/`. `appId`, `appName`, orientação e requisitos mínimos devem permanecer estáveis depois de distribuição.

## Build debug

```bash
npm run android:sync
npm run android:build:debug
```

Artefato esperado:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Um APK debug prova compilação e empacotamento; não prova instalação, atualização, áudio, toque, TalkBack, desempenho ou segurança de release.

## Validação em aparelho

Registrar:

- modelo e versão do Android;
- commit/build e hash do APK;
- instalação nova ou atualização;
- navegação e Android Back;
- safe areas, teclado e rotação aprovada;
- background/foreground e reabertura;
- persistência, exportação e restore com dados controlados;
- toque, pan, Construção e canvas;
- TalkBack, áudio e desempenho percebido.

R6 foi aprovada no Moto G06 em 2026-09-06 para os fluxos visuais e preservação de dados explicitamente testados. Essa aprovação não inclui desempenho físico resolvido, auditoria completa de TalkBack ou áudio final.

## Release

Release exige autorização explícita e:

1. `versionName` e `versionCode` definidos;
2. changelog e documentação atualizados;
3. assets, licenças, ícone e splash revisados;
4. keystore e senhas fora do Git e com recuperação testada;
5. build assinado reproduzível;
6. instalação e atualização sobre release anterior;
7. backup/restore verificados;
8. matriz física concluída;
9. artefato final, tamanho, SHA-256 e integridade registrados.

## Histórico

Hashes e checkpoints de APKs antigos estão em `history/legacy/ANDROID_RELEASE_CHECKPOINTS.md`; não representam o artefato atual.
