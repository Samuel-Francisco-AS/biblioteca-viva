# ADR-010 — Pipeline 3D v1

- **Estado:** aceita
- **Data:** 2026-09-17
- **Complementa:** ADR-008 e ADR-009

## Contexto

A FUNDAÇÃO encerrou F0–F6. F4 produziu evidência experimental sobre autoria, normalização, materiais, `GLTFLoader`, lifecycle e custo; F5 mediu um corpus diagnóstico no Moto G06 sem encontrar teto ou justificar otimizações preventivas. Essa evidência permite definir o contrato de entrada de um asset produtivo, mas não autoriza antecipar seu loader, gerenciamento de assets, mundo real ou persistência espacial.

## Decisão

### Escopo v1

O Pipeline 3D v1 atende inicialmente assets 3D rígidos e estáticos. Seu primeiro perfil suportado é o de prop estático apoiado no chão (`grounded/static`).

Esta versão não cobre skinned meshes/personagens, animação, morph targets, shader customizado, partículas, persistência espacial, streaming, catálogo do mundo, LOD, atlas, instancing ou merge como política, Draco, Meshopt, KTX2/Basis, nem `AssetManager` ou cache global. Esses itens não estão proibidos permanentemente: dependem de necessidade concreta e evidência futura.

### Runtime e autoria

- O formato de runtime v1 é GLB 2.0 autocontido.
- O carregamento continua pelo Three.js e pelo `GLTFLoader` instalado. Nenhum outro formato de runtime ou renderer é introduzido.
- `ThreeWorldRuntime` não muda nesta decisão. O caminho F1/F4 continua fixture/diagnóstico técnico e não é uma implementação produtiva de loading ou ownership.
- Blender 3.3.21 é a ferramenta de autoria de referência/suportada: o preflight técnico e humano F4 foi suficiente para essa escolha. Continua substituível, não é dependência do aplicativo nem requisito arquitetural do runtime.
- Flags, CLI e configurações exatas de exportação não são congeladas antes da prova do primeiro asset produtivo. A receita reproduzível será consolidada em P3D-B/P3D-D.

### Fonte, runtime e identidade

Quando P3D-B introduzir o primeiro asset produtivo, a estrutura planejada será:

```text
assets/3d/source/<asset-id>/
src/features/library/three/assets/
```

- `assets/3d/source/<asset-id>/` guarda fonte editável normalizada/reproduzível e evidências locais pertinentes; não pertence ao bundle/runtime.
- `src/features/library/three/assets/` conterá somente GLBs aprovados para uso produtivo.
- `src/features/library/three/fixtures/` permanece exclusivamente técnico/teste. Nenhum fixture F1/F4 é promovido implicitamente.
- Os diretórios não são criados vazios nesta etapa. Não se adota Git LFS ou repositório separado de assets agora.
- Pacotes brutos completos de fornecedores não precisam ser versionados por padrão. O projeto preserva a fonte editável normalizada necessária para reproduzir o asset, mais origem, autoria, licença e transformações que permitam rastrear sua derivação.

O `asset-id` é estável, único, semântico e em kebab-case. A origem/fornecedor não deve ser necessária no ID consumido pelo mundo. Os estados produtivos documentais mínimos são `candidate`, `validated` e `production`; fixtures técnicos e experimentais permanecem fora deles. Esta decisão não cria schema persistido, enum de produção ou código para materializá-los.

### Invariantes bloqueantes para promoção

Um asset só pode ser promovido quando demonstrar:

1. origem conhecida;
2. autoria conhecida;
3. licença conhecida e compatível;
4. fonte editável preservada;
5. transformações/preparações registradas;
6. GLB 2.0 válido e autocontido;
7. parse bem-sucedido pelo `GLTFLoader` instalado;
8. root lógico previsível, com transforms corretivos incorporados ao asset;
9. root sem scale, rotação ou offset corretivo exigido pelo runtime;
10. dimensões/bounds finitos e positivos;
11. uma unidade física de autoria normalizada correspondente a um metro;
12. no perfil `grounded/static`, apoio no plano de chão runtime `Y=0` e footprint coerentemente normalizado;
13. preservação do significado material relevante no caminho glTF/Three;
14. UV necessário em material texturizado;
15. ausência de textura ou referência necessária faltante;
16. ausência de branch ou patch específico por asset no runtime; e
17. ausência de recurso v1 que exija decoder/extensão ainda não configurado pelo produto.

Um asset pode ter múltiplos meshes sob um root lógico. Não há convenção universal de “frente” nesta versão: ela continua aberta até o primeiro uso real em P3D-B/P3D. Não se transformam número de meshes, materiais, triângulos ou resolução de textura em hard budget.

### Métricas informativas

O tooling posterior poderá relatar, sem reprovar automaticamente: tamanho do GLB; nodes; meshes; primitives; vértices; triângulos; materiais; texturas/imagens; dimensões e MIME de imagens; bounds/dimensões físicas; e estimativas estruturais de custo, claramente separadas de RAM/GPU real. Permanece o princípio F4/F5: medir antes de otimizar, sem budgets preventivos.

## Consequências

- P3D-A formaliza somente o contrato e a estrutura planejada; não adiciona assets, diretórios, scripts, dependências, testes, schema ou código de produção.
- P3D-B deverá atravessar manualmente a pipeline ponta a ponta com um único asset canônico, antes de qualquer automação geral. A preferência inicial é reutilizar o espécime Quaternius Bookshelf conhecido da F4 como fonte de trabalho, por sua fonte `.blend`, licença CC0, geometria pequena e normalização estudada. Isso não promove o fixture F4: P3D-B criará ID produtivo e fonte/runtime nas novas áreas, conforme este contrato.
- Se a fonte editável local esperada não estiver disponível no checkout, P3D-B dependerá de recuperá-la do laboratório F4; não deve inventar nem baixar arquivos como substituição.
- P3D-C tratará validação e relatório automatizados; P3D-D, preparação/exportação reproduzível; P3D-E, ingestão produtiva, ownership e unload; e P3D-F, gate integrado e fechamento.

