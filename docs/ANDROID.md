# Android

O aplicativo web é empacotado com Capacitor. O projeto Android permanece em `android/` e recebe somente a saída gerada por `npm run build` durante a sincronização.

## Comandos

```bash
npm run android:sync
npm run android:build:debug
npm run android:build:diagnostics
```

O APK debug é produzido em `android/app/build/outputs/apk/debug/app-debug.apk`.

Playwright e o emulador web não substituem validação em aparelho real. TalkBack, áudio percebido, temperatura e desempenho físico só podem ser aprovados por evidência humana registrada.

## F6-B — APK candidato ao gate humano

Em 2026-09-17, `npm run android:sync` e `npm run android:build:debug` passaram após a regressão F6-B. O APK debug candidato para F6-C está em `android/app/build/outputs/apk/debug/app-debug.apk`, com 10.568.158 bytes. Permaneceram os warnings conhecidos de chunks Vite acima de 500 kB e `flatDir`; não houve instalação, ADB, TalkBack ou outra validação física.

## F5 — APK de diagnóstico e evidência F5-B

`npm run android:build:diagnostics` gera um APK debug com `VITE_ENABLE_DIAGNOSTICS=true`. Na Biblioteca, ele expõe três botões DOM temporários para `Baseline F1`, `Corpus F4` e `Corpus F4 ×4`; cada troca recria a montagem Three e o diagnóstico informa a conclusão do carregamento. Esse APK é o artefato a instalar no Moto G06 para F5-B. Sua geração não é instalação, execução física, profiling, teste térmico nem aprovação de performance.

Na primeira abertura física do APK F5-A, o antigo `<select>` abriu o picker da WebView como uma superfície branca sem rótulos legíveis/utilizáveis. O app e o runtime continuaram ativos atrás desse diálogo, portanto o defeito ficou restrito ao controle. O fix F5-A removeu o `<select>` em favor dos botões DOM e foi revalidado fisicamente antes da coleta F5-B.

Em 2026-09-15, `android:sync:diagnostics` encontrou os mesmos três plugins Capacitor e `assembleDebug` concluiu com sucesso. O APK de diagnóstico está em `android/app/build/outputs/apk/debug/app-debug.apk` com 13.346.535 bytes. Os warnings conhecidos de `flatDir` persistem. Nenhum aparelho foi conectado, instalado ou avaliado nesta F5-A.

Em 2026-09-17, F5-B gerou o APK de diagnóstico, sincronizou Capacitor e executou `assembleDebug`; o APK final instalado e smoke-testado foi `android/app/build/outputs/apk/debug/app-debug.apk`, com 10.781.761 bytes e SHA-256 `8864ab9f4cf8935cf56b7eea6caaa2318b07a7e250c6cb73d9ee45c0195ce9cd`. A instalação por ADB foi conferida extraindo e comparando o `base.apk` instalado. O pacote/Activity usados foram `com.samuelfrancisco.bibliotecaviva` e `.MainActivity`; o Moto G06 executou Android 15/API 35, build `VVOB35.78-202`.

Durante F5-B, logs da WebView mostraram `GLTFLoader: Couldn't load texture blob:...`: a CSP tinha `img-src blob:`, mas não `connect-src blob:`. Como o loader busca URLs blob para as imagens embutidas, a correção mínima incluiu `blob:` em `connect-src`; ela foi coberta pelo teste de CSP e validada fisicamente com maps visíveis. Não houve mudança Android nativa, novo plugin ou dependência.

F5-C não conectou, instalou ou validou aparelho: apenas consolidou a evidência F5-B e executou gates locais. O Moto G06 permanece a referência física; novo APK só exige sessão no aparelho se uma mudança futura alterar comportamento que dependa de renderização, loading, lifecycle, assets ou diagnóstico físico.

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

## Evidência técnica da F3-F1

Em 2026-09-09, `npm run android:sync` e `npm run android:build:debug` passaram novamente. O sync preservou `@capacitor/app@8.1.1`, `@capacitor/filesystem@8.1.2` e `@capacitor/share@8.0.1`; o Gradle concluiu `assembleDebug` com sucesso e gerou:

```text
android/app/build/outputs/apk/debug/app-debug.apk
7.525.817 bytes (7,2 MiB em disco)
```

Os warnings conhecidos de `flatDir` persistem. Este checkpoint confirmou o empacotamento técnico; a validação humana ampla posterior da F3 está registrada abaixo.

## Evidência física da F1-F — Moto G06

O APK Three.js foi instalado e executado fisicamente. O aplicativo abriu, a Biblioteca carregou piso, paredes, proxies e fixture GLB, e pan, pinch, picking, highlight e a ponte React ↔ Three passaram sem crash, travamento, corrupção ou artefato gráfico relevante.

Depois da F1-F-FIX, os botões `Anterior`/`Próximo` ficaram visíveis e funcionais, alteraram seleção e highlight e preservaram canvas → React e React → Three. Eles permanecem controles experimentais, não UX final.

Dez ciclos `Biblioteca → outra rota → Biblioteca` reconstruíram a cena corretamente, em menos de aproximadamente um segundo, segundo a percepção humana, sem degradação progressiva ou duplicação observável. Um breve quadro preto apareceu antes de cada reconstrução e fica registrado como comportamento atual do spike, não como defeito estrutural comprovado.

Background/resume passou enquanto o processo permaneceu vivo: o aplicativo voltou ao estado em que estava e permaneceu funcional. Ao abrir outro aplicativo pesado, o Android eventualmente encerrou a Biblioteca Viva sob pressão de memória. No retorno, o aplicativo iniciou um novo processo e recuperou-se de forma limpa, sem corrupção ou crash. Android pode encerrar processos em background; o requisito não é permanência indefinida, mas reinicialização limpa.

A cena simples estabilizou em aproximadamente 60 FPS. Valores iniciais de aproximadamente 8–12 FPS ocorreram enquanto a janela diagnóstica era preenchida e não representam desempenho sustentado. O teste curto de aproximadamente cinco minutos não revelou comportamento térmico anormal ou throttling percebido; isso não substitui teste prolongado.

TalkBack completo não foi executado na F1 e permanece pendente para F6 ou outro gate humano específico.

## Evidência física da F2 — revalidação curta no Moto G06

Após os gates técnicos da F2-F, a revalidação humana curta confirmou renderização normal, pan, pinch, seleção por toque, seleção/highlight, sincronização React ↔ Three e os botões React sincronizados com seleção e highlight. O canvas permaneceu alinhado com a interface React; background/resume e rotação/orientação continuaram funcionais.

Na rotação/orientação, houve queda transitória de aproximadamente 37–45 FPS, seguida de recuperação e estabilização em aproximadamente 60 FPS. Na sequência extrema de zoom-out até o máximo e zoom-in até o máximo, houve queda transitória de aproximadamente 45–48 FPS, com a mesma recuperação para aproximadamente 60 FPS. Não houve crash, travamento, degradação sustentada, perda de interação, dessincronização React ↔ Three ou evidência de regressão funcional associada à F2.

As quedas são observações não bloqueantes, não falhas comprovadas nem benchmark formal, e não têm causalidade atribuída à F2 sem evidência. Esta validação curta não aprova TalkBack, temperatura prolongada, desempenho do mundo final, densidade real da Biblioteca ou budget artístico.

## Fechamento físico da F3 — Moto G06

A validação humana ampla da F3 foi positiva: o aplicativo abriu normalmente; framing inicial, pan, tap/seleção sem confusão com pan, pinch fluido sem seleção acidental, pinch → um pointer → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume permaneceram funcionais. O FPS ficou aproximadamente em 60 ou muito próximo durante interações e rotação; não houve crash, travamento ou regressão funcional perceptível. Isto não é benchmark científico nem garantia para o mundo final.

Depois dessa validação, o APK posterior ao fix matemático dos bounds foi gerado por sync e debug build aprovados. Esse APK **não foi revalidado fisicamente** no Moto G06. A limitação foi aceita como não bloqueante no fechamento da F3 e não deve ser interpretada como prova física do fix.
