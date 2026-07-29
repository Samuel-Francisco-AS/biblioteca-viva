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
