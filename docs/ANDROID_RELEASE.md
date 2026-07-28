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

- [ ] build web concluído;
- [ ] sincronização Capacitor concluída;
- [ ] projeto abre no Android Studio;
- [ ] APK gerado;
- [ ] instalação limpa;
- [ ] abertura;
- [ ] cinco rotas;
- [ ] botão voltar;
- [ ] segundo plano e retorno;
- [ ] fechamento e reabertura;
- [ ] safe areas;
- [ ] resultado registrado em `TEST_PLAN.md`.

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
