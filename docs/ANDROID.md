# Android

O aplicativo web é empacotado com Capacitor. O projeto Android permanece em `android/` e recebe somente a saída gerada por `npm run build` durante a sincronização.

## Comandos

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug é produzido em `android/app/build/outputs/apk/debug/app-debug.apk`.

Playwright e o emulador web não substituem validação em aparelho real. TalkBack, áudio percebido, temperatura e desempenho físico exigem evidência humana registrada.
