# Manutenção

## Rotina

1. Ler `STATUS.md`, `README.md` e decisões aplicáveis.
2. Inspecionar código, testes e estado Git.
3. Delimitar mudança vertical pequena.
4. Executar teste focado e ampliar conforme o risco.
5. Atualizar documentação e changelog.
6. Registrar validação humana sem inferir o que não foi executado.

## Dados e backup

- Nunca editar migração publicada.
- Nova forma persistida exige versão aditiva, fixtures anteriores, upgrade, reabertura e rollback.
- Mudança no backup exige codec, inspeção sem escrita, restore transacional, checksum e compatibilidade declarada.
- Não usar banco ou backup pessoal em teste.
- Não limpar dados físicos antes de uma estratégia de recuperação confirmada.

## Mundo e Phaser

- Preservar separação entre `WorldStructureState` e `PlacedObject`.
- Não persistir câmera, seleção, preview, ferramenta ou animação.
- Alteração estrutural exige regressões de geometria, continuidade, renderer, input, fallback, depth, backup e Android.
- Não corrigir layout por identidade da sala, coordenada ou instância.
- Confirmar uma instância/canvas e cleanup antes de criar nova arquitetura de lifecycle.

## Conteúdo, áudio e assets

- Conteúdo novo usa ID estável, locale, fallback e teste de referências.
- Áudio novo entra pelo manifesto e degrada para silêncio.
- Asset novo exige fonte, autoria, licença, transformação, estado e registro.
- Fontes e runtimes estruturais passam pelos scripts determinísticos existentes.

## Dependências

Não atualizar React, Vite, Phaser, Capacitor, Dexie e schema no mesmo lote. Toda dependência nova precisa justificar valor, custo de bundle/Android, manutenção e licença.

## CI e E2E

E2E usa dados fictícios e origem controlada. Falha deve ser reproduzida pelo cenário, sem relaxar asserção para obter verde. CI web não substitui build ou aparelho Android.

## Release

Não assinar, instalar, publicar ou mudar versão sem escopo. Use `ANDROID.md`, `SECURITY.md`, `PRIVACY.md` e o template de release.
