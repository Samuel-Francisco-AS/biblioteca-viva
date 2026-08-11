# Android, APK e release

## 1. Estratégia

Capacitor entra cedo. O primeiro APK de depuração pertence ao Gate G2; assinatura de release pertence ao Gate G11.

## 2. Identidade

Definir e preservar:

- `appId` estável;
- `appName`;
- orientação aprovada;
- ícone e splash;
- `versionName`;
- `versionCode` crescente;
- requisitos mínimos do Android conforme compatibilidade real da stack.

Mudar `appId` depois da distribuição cria outro aplicativo e deve ser evitado.

## 3. Builds

### Debug

Objetivos:

- provar integração Vite–Capacitor–Android;
- instalar cedo;
- testar navegação, ciclo de vida e persistência;
- permitir iteração.

O processo implementado no Prompt 3 é:

```bash
npm run android:sync
npm run android:build:debug
```

`android:sync` executa o build Vite e `cap sync android`. `android:build:debug` repete essa sincronização e executa `android/gradlew assembleDebug`, sem Gradle global. O artefato local confirmado é `android/app/build/outputs/apk/debug/app-debug.apk` e permanece ignorado pelo Git.

Também existem `npm run android:open` para abrir o projeto no Android Studio e `npm run android:run` para sincronizar e executar quando houver aparelho conectado.

### Diagnóstico interno

O modo Vite `diagnostics` usa `.env.diagnostics` e habilita o painel técnico necessário a gates internos:

```bash
npm run build:diagnostics
npm run android:sync:diagnostics
npm run android:build:diagnostics
```

O último comando gera um APK debug no caminho habitual. Ele é exclusivamente um artefato interno de teste, não uma release pública. Os comandos `build`, `android:sync` e `android:build:debug` continuam sem o painel; builds normais de produção não leem esse modo.

APK diagnóstico validado no G3 em 2026-07-29:

- aparelho: Moto G06;
- sistema: Android 15;
- caminho: `android/app/build/outputs/apk/debug/app-debug.apk`;
- SHA-256: `dec455d72ccba0eaf0b652d9c388097d53678da069bf3f78af73c3c90843c210`;
- resultado: banco `biblioteca-viva` versão 2 aberto, escrita pelo caso de uso real e contagens preservadas após reabertura, reinício do aparelho e instalação de outro APK diagnóstico por cima;
- armazenamento persistente: `denied`, tratado corretamente como não bloqueador;
- regressão: navegação e botão Voltar aprovados, sem defeito bloqueador.

Esse APK é exclusivamente interno para diagnóstico e gates. Não é release pública, não foi assinado para release e não é AAB.

Primeiro APK debug validado em 2026-07-28:

- aparelho: Moto G06;
- sistema: Android 15;
- caminho relativo: `android/app/build/outputs/apk/debug/app-debug.apk`;
- SHA-256: `af45ac6ca5641b634560cf54bef60459b27fab0f367cd3d171e6c0a2fe2497fe`;
- resultado: instalação, abertura, navegação, botão Voltar, ciclo de vida básico e safe areas aprovados, sem defeitos bloqueadores observados.

Este arquivo é um APK de depuração validado localmente, não um artefato público ou uma release Android. A assinatura de release permanece pendente para o Gate G11.

### Release

Objetivos:

- build otimizado;
- assinatura estável;
- sem ferramentas de debug;
- APK para teste direto;
- AAB apenas quando houver distribuição por loja.

Comandos reais devem ser registrados após o scaffold. Não inventar script não existente.

APK release assinado, AAB, keystore e configuração de assinatura continuam pendentes para o Gate G11.

## 4. Keystore

- gerar uma keystore exclusiva;
- nunca versionar arquivo ou senha;
- manter cópia segura em mais de um local controlado;
- documentar alias, validade e procedimento sem registrar senha;
- perder a chave pode impedir atualização do aplicativo distribuído;
- testar assinatura antes da versão final.

Adicionar padrões correspondentes ao `.gitignore`.

## 5. Checklist do APK debug — G2

- [x] build web concluído;
- [x] sincronização Capacitor concluída;
- [ ] projeto abre no Android Studio (não verificado nesta execução física);
- [x] APK gerado;
- [x] instalação física;
- [x] abertura;
- [x] cinco rotas;
- [x] botão voltar;
- [x] segundo plano e retorno;
- [x] remoção pelos recentes e reabertura;
- [x] safe areas;
- [x] resultado registrado em `TEST_PLAN.md`.

## 6. Checklist de release — G11

- [ ] versão e changelog;
- [ ] árvore Git limpa;
- [ ] testes automáticos;
- [ ] build web;
- [ ] sincronização Android;
- [ ] assinatura release;
- [ ] verificação de segredos;
- [ ] instalação limpa;
- [ ] atualização sobre versão anterior assinada;
- [ ] persistência preservada;
- [ ] exportação e restauração;
- [ ] áudio e ciclo de vida;
- [ ] acessibilidade essencial;
- [ ] desempenho;
- [ ] ícone, nome e splash;
- [ ] hash do artefato registrado;
- [ ] tag apenas após aprovação.

## 7. Teste de atualização

Antes de cada release relevante:

1. instalar versão anterior assinada;
2. criar dados de teste;
3. instalar nova versão por cima;
4. validar migração e dados;
5. abrir biblioteca e preferências;
6. exportar backup;
7. registrar resultado.

## 8. Distribuição

No protótipo, priorizar:

- APK identificado como teste;
- release no GitHub, caso desejado;
- instruções de instalação e limitações;
- checksum;
- ausência de promessa de suporte comercial.

Publicação em loja exige política de privacidade, materiais, classificação, revisão de permissões e processo próprio.

## 9. Transferência de backup no Prompt 10

Nenhum plugin ou permissão Android foi adicionado. A fachada de arquivos tenta Web Share com `File` quando o WebView oferecer suporte e usa Blob/download como fallback; importação usa o seletor HTML. O APK debug foi gerado, mas usabilidade física de exportação, seleção e restauração permanece obrigatoriamente pendente para o Moto G06/G5. Se o WebView não entregar um fluxo utilizável, a necessidade de plugins oficiais Filesystem/Share será reavaliada com evidência, sem acesso amplo ao armazenamento.

## 10. Correção da exportação após o checkpoint físico

O checkpoint no Moto G06 confirmou que o fluxo web dentro da WebView não produzia uma cópia externa verificável. A correção adiciona os plugins oficiais `@capacitor/filesystem` `8.1.2` e `@capacitor/share` `8.0.1`; `cap sync android` deve registrar ambos no projeto nativo. O teste seguinte validou a folha e o JSON, mas confirmou que seus destinos não equivalem a uma ação explícita de salvar em pasta.

No APK, “Exportar backup” escreve temporariamente o JSON em UTF-8 no cache privado recriável e abre a folha Android com a URI do arquivo `.json`. Os destinos oferecidos dependem dos aplicativos instalados e podem incluir Arquivos, Drive, mensageria ou outros receptores compatíveis. Encerrar a folha não prova que um destino persistente foi concluído: antes de limpar dados ou desinstalar, o usuário deve localizar o arquivo fora do aplicativo, idealmente copiá-lo para outro dispositivo e selecioná-lo novamente para inspeção.

“Salvar backup no dispositivo” usa o plugin local `BackupDocument`, registrado na `MainActivity`. Ele abre `ACTION_CREATE_DOCUMENT`; o usuário escolhe pasta e nome, e o aplicativo escreve apenas na URI concedida por `ContentResolver`. “Compartilhar backup” permanece separado e conserva o fluxo Cache + Share. O temporário de compartilhamento é removido somente depois do encerramento da folha.

Não foi adicionada permissão manual, acesso amplo ao armazenamento, `MANAGE_EXTERNAL_STORAGE`, mudança de `applicationId`, assinatura ou versão. O checklist físico obrigatório é: instalar por cima, confirmar dados, tocar “Salvar backup no dispositivo”, verificar o seletor, escolher a pasta, confirmar nome, localizar o arquivo, copiá-lo para outro local e validar sua importação. Somente depois disso pode ocorrer limpeza controlada. “Compartilhar backup” continua disponível separadamente. Nenhuma limpeza destrutiva deve ser feita enquanto a cópia externa não estiver confirmada.

A ordem segura confirmada no Moto G06 é:

1. instalar o APK por cima da versão anterior;
2. confirmar que os dados existentes permanecem;
3. salvar um backup externo pelo seletor de documentos;
4. localizar e confirmar o arquivo fora do aplicativo;
5. compartilhar o backup de segurança quando a restauração em banco preenchido o exigir;
6. confirmar esse arquivo no destino escolhido, como o Drive;
7. somente então limpar ou reinstalar de forma controlada;
8. restaurar o backup externo em banco vazio;
9. comparar livros, progresso, status, notas e citações após reabrir.

Os nove passos foram validados no Moto G06 em 2026-08-06. Fechar a folha sem compartilhar cancelou a restauração; compartilhar e confirmar a segurança no Drive permitiu prosseguir. Depois da cópia externa confirmada, a limpeza de cache e armazenamento produziu o estado inicial esperado: banco vazio, Coleção vazia e sala visual com total zero. A restauração recuperou os dois livros e a sala passou para total dois; títulos, autores, status e progresso corresponderam ao estado anterior e permaneceram após fechar e reabrir. Essa evidência aprovou G5 no checkpoint físico do protótipo.

## 11. Checkpoint físico do protótipo — G5 e G6

Em 2026-08-06, o APK debug interno foi usado repetidamente no Moto G06. A instalação por cima preservou os dados; a limpeza controlada produziu o estado vazio; a restauração do backup externo recuperou os dados e persistiu após reabertura. Navegação, botão Voltar, teclado, safe areas, rolagem, toque versus arraste, interações e painéis, saída e retorno, retomada da sala Phaser, canvas único, fluidez e estabilidade foram considerados adequados, sem tela preta persistente. Sam aprovou G5 e G6 com essas evidências.

Esse checkpoint valida o protótipo e não substitui o checklist futuro de release. Continuam pendentes para G11:

- assinatura de produção;
- APK release público e AAB;
- atualização entre builds assinados de produção;
- publicação em loja;
- execução integral do checklist de release final.

APK debug corretivo gerado, mas não instalado, em 2026-08-03:

- caminho: `android/app/build/outputs/apk/debug/app-debug.apk`;
- tamanho: 7.525.449 bytes;
- SHA-256: `c92068db7ccbeffbe892a9acb5fc0050f8ffecd6f7c536259e44d5edc465ef28`;
- integridade ZIP: aprovada;
- plugins empacotados: App, Filesystem e Share;
- permissões de armazenamento amplo: ausentes.

APK debug da continuação corretiva gerado, mas não instalado, em 2026-08-05:

- caminho: `android/app/build/outputs/apk/debug/app-debug.apk`;
- tamanho: 7.525.555 bytes, aproximadamente 7,18 MiB;
- SHA-256: `1eec4278a332a3e883cc1f8c03e92efb2b19743edded752ccbb235426a8e68fb`;
- integridade ZIP: aprovada;
- bridge local `BackupDocument`: compilada e registrada;
- permissões de armazenamento amplo: ausentes.

## 12. Checkpoint técnico do Prompt 18

Em 2026-08-11, `android:sync` e `android:build:debug` passaram sem plugin, permissão ou código nativo novo. O APK debug não foi instalado:

- caminho: `android/app/build/outputs/apk/debug/app-debug.apk`;
- tamanho: 7.526.051 bytes;
- SHA-256: `268a77facb0432985c94bf2185d671553d721123c889f167f0d3aaeba89b667d`;
- integridade ZIP: aprovada;
- plugins: App, Filesystem e Share;
- G9 e o perfil físico no Moto G06: pendentes.

## 13. CI inicial do Prompt 19

A CI valida somente o produto web. `android:sync` e `android:build:debug` continuam obrigatórios localmente: incluir SDK, JDK e Gradle em todo pull request teria custo desproporcional e ainda não provaria lifecycle, áudio, toque ou persistência física. Não há keystore, assinatura, secret, upload de APK ou Play Store no workflow.
