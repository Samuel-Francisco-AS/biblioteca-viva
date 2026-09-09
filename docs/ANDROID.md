# Android

O aplicativo web é empacotado com Capacitor. O projeto Android permanece em `android/` e recebe somente a saída gerada por `npm run build` durante a sincronização.

## Comandos

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug é produzido em `android/app/build/outputs/apk/debug/app-debug.apk`.

Playwright e o emulador web não substituem validação em aparelho real. TalkBack, áudio percebido, temperatura e desempenho físico só podem ser aprovados por evidência humana registrada.

## Evidência técnica da F1-E

Em 2026-09-09, `npm run android:sync` concluiu com os plugins existentes `@capacitor/app@8.1.1`, `@capacitor/filesystem@8.1.2` e `@capacitor/share@8.0.1`. `npm run android:build:debug` concluiu `assembleDebug` com sucesso e gerou:

```text
android/app/build/outputs/apk/debug/app-debug.apk
7.525.817 bytes (7,2 MiB em disco)
```

O APK contém o chunk dinâmico do runtime Three.js e o fixture GLB. Os warnings Gradle sobre `flatDir` permanecem conhecidos. Nenhum APK foi instalado ou executado em aparelho nesta etapa.

## Evidência técnica da F2-F

Em 2026-09-09, a regressão de fechamento repetiu `npm run android:sync` e `npm run android:build:debug`. O sync encontrou novamente `@capacitor/app@8.1.1`, `@capacitor/filesystem@8.1.2` e `@capacitor/share@8.0.1`; o Gradle concluiu `assembleDebug` com sucesso. O artefato gerado é:

```text
android/app/build/outputs/apk/debug/app-debug.apk
7.525.817 bytes (7,2 MiB em disco)
```

Os warnings conhecidos de `flatDir` persistem. Esta evidência confirma o empacotamento técnico, não instalação, execução, toque, pinch, orientation, background/resume, desempenho ou temperatura no Moto G06.

## Evidência física da F1-F — Moto G06

O APK Three.js foi instalado e executado fisicamente. O aplicativo abriu, a Biblioteca carregou piso, paredes, proxies e fixture GLB, e pan, pinch, picking, highlight e a ponte React ↔ Three passaram sem crash, travamento, corrupção ou artefato gráfico relevante.

Depois da F1-F-FIX, os botões `Anterior`/`Próximo` ficaram visíveis e funcionais, alteraram seleção e highlight e preservaram canvas → React e React → Three. Eles permanecem controles experimentais, não UX final.

Dez ciclos `Biblioteca → outra rota → Biblioteca` reconstruíram a cena corretamente, em menos de aproximadamente um segundo, segundo a percepção humana, sem degradação progressiva ou duplicação observável. Um breve quadro preto apareceu antes de cada reconstrução e fica registrado como comportamento atual do spike, não como defeito estrutural comprovado.

Background/resume passou enquanto o processo permaneceu vivo: o aplicativo voltou ao estado em que estava e permaneceu funcional. Ao abrir outro aplicativo pesado, o Android eventualmente encerrou a Biblioteca Viva sob pressão de memória. No retorno, o aplicativo iniciou um novo processo e recuperou-se de forma limpa, sem corrupção ou crash. Android pode encerrar processos em background; o requisito não é permanência indefinida, mas reinicialização limpa.

A cena simples estabilizou em aproximadamente 60 FPS. Valores iniciais de aproximadamente 8–12 FPS ocorreram enquanto a janela diagnóstica era preenchida e não representam desempenho sustentado. O teste curto de aproximadamente cinco minutos não revelou comportamento térmico anormal ou throttling percebido; isso não substitui teste prolongado.

TalkBack completo não foi executado na F1 e permanece pendente para F6 ou outro gate humano específico.
