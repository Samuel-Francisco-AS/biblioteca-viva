> **R5Q — APK candidato (08/11/2026):** build/sync debug PASS, `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5Q-debug.apk`, 10,641,553 B, SHA-256 `61616603429cb544eaf154e053e021d667261288f5e134b676e300053c9707d7`. Bundles/GLBs conferidos no ZIP, versão inalterada; sem instalação física R5Q e ADB sem aparelho. R5P recebeu relato humano de melhora; R5Q aguarda validação de abertura noturna/quests. [Relatório e roteiro](audits/BV_SANEAMENTO_R5Q.md) · [Proveniência](audits/evidence/bv-r5q/apk.json). Sem merge ou R5 concluída.

> **R5P — APK candidato final (07/11/2026):** sync/build debug PASS; `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5P-debug.apk`, 10,641,553 B, SHA-256 `3e15958db0824a285a1d57cadd3b300e96b4af0189b3feb9e70592d21092c5c0`. Bundle/GLBs conferidos no ZIP. ADB sem aparelhos; não instalado/testado fisicamente pelo agente. [Proveniência](audits/evidence/bv-r5p/apk.json) · [roteiro Moto G06](audits/evidence/bv-r5p/MOTO_G06.md). R5/R5E não aprovadas, fluidez física pendente; sem merge.

# BF-5 Parte 2E — contorno interno dos seletores (2026-11-04)

Relato do proprietário: no Moto G06, duração de foco e seleção de datas abriram superfície branca com símbolo azul, sem opções. Auditoria encontrou duas famílias que delegavam UI ao navegador/WebView: selects e calendários de data, incluindo helpers. A candidata elimina essas dependências dos formulários, filtros, sessões e Ajustes com opções/calendário DOM. Não há comprovação da causa nem de correção física antes da rodada no aparelho. Importação de arquivos e Share/SAF mantêm seus contratos nativos distintos.

Back em capture fecha só o diálogo superior e devolve foco; folhas DOM usam top layer sobre o dock e limites de viewport/safe area. [ADR-019](decisions/ADR-019-controles-internos-capas-atelie.md) · [testes, APK e roteiro físico](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md). Sem instalação, TalkBack ou aprovação física automática.

## BF-5 Parte 2D — PNG cinematográfico

Reutiliza Share/Filesystem e `ImageDocument` da Parte 2, ampliando somente o nome permitido para `biblioteca-viva-cinema.png`; SAF continua separado do backup, sem permissão ampla ou dependência nova. JPEG/PNG importados são locais/validados; compositor exporta PNG real independente do display. [Artefato, checks e roteiro Moto G06](BF-5_PARTE2D_ENTRETENIMENTO.md). Cancelamento/falhas têm tratamento automatizado, ainda sem prova física do seletor, compartilhamento, teclado ou espaço insuficiente.

## BF-5 Parte 2B — timer de estudo

A contagem usa timestamps e limite de foco gravados na sessão Dexie v10. O plugin App v8 já instalado sinaliza retorno da Activity; a montagem após término do processo também reconsulta a sessão. JavaScript não precisa executar com tela desligada. Sem novo plugin, serviço, wake lock ou permissão; **sem notificação/alarme em segundo plano**. Ciclo concluído aguarda registro no retorno, com duração limitada. [Justificativa e limitações](decisions/ADR-016-estudo-folio-pomodoro-cartas.md) · [build e roteiro físico](BF-5_PARTE2B_ESTUDO.md). A simulação automatizada não substitui validação no Moto G06.

# Android

## BF-5R5 — haptic opcional e candidata

O manifesto declara a permissão normal `android.permission.VIBRATE` para `navigator.vibrate` quando a WebView/dispositivo permitir. Não há dependência/plugin novo, prompt de permissão ou prova de vibração percebida. A preferência efetiva de movimento reduzido desliga o recurso. [Relatório R5](BF-5R5_RELATORIO.md) registra APK/SHA-256 e roteiro físico; gerar o APK não equivale a instalá-lo/avaliá-lo no Moto G06.


O aplicativo web é empacotado com Capacitor. O projeto Android permanece em `android/` e recebe somente a saída gerada por `npm run build` durante a sincronização.

## Comandos

```bash
npm run android:sync
npm run android:build:debug
npm run android:build:diagnostics
```

O APK debug é produzido em `android/app/build/outputs/apk/debug/app-debug.apk`.

Playwright e o emulador web não substituem validação em aparelho real. TalkBack, áudio percebido, temperatura e desempenho físico só podem ser aprovados por evidência humana registrada.

## F6-B — APK técnico do fechamento automatizado

Em 2026-09-17, `npm run android:sync` e `npm run android:build:debug` passaram após a regressão F6-B. O APK debug técnico está em `android/app/build/outputs/apk/debug/app-debug.apk`, com 10.568.158 bytes. Permaneceram os warnings conhecidos de chunks Vite acima de 500 kB e `flatDir`; não houve instalação, ADB, TalkBack ou outra validação física. F6-C não acrescentou evidência física: a dívida assistiva deve usar um build futuro atual e representativo da superfície que estiver sendo aprovada, não obrigatoriamente este APK.

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

## BF-5R9 — identidade do launcher

Ícone de códice/chama original integrado nos recursos apontados por `android:icon` e `android:roundIcon`; adaptive v26 e monochrome v33, além dos legados mdpi–xxxhdpi. Fonte e reprodução em [assets/android-icon](../assets/android-icon/README.md). Ao trocar o foreground qualificado antigo por drawable comum, o build incremental local não encontrou o recurso; `./gradlew :app:clean assembleDebug` reconstruiu com sucesso. Não foi necessário limpar dados do app. Build limpo e extração via `aapt2 dump xmltree` confirmam as três camadas no APK; isso não substitui inspeção do launcher físico. [Relatório R9](BF-5R9_RELATORIO.md).
