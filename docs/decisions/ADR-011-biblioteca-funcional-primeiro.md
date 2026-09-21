# ADR-011 — Biblioteca Funcional Primeiro

- **Estado:** aceita
- **Data:** 2026-09-20
- **Complementa:** ADR-008, ADR-009 e ADR-010

## Contexto

A FUNDAÇÃO F0–F6 está encerrada no plano técnico/arquitetural. P3D-A definiu o contrato de assets GLB produtivos e P3D-B1 preservou a proveniência do candidato `bookshelf`, sem criar fonte canônica normalizada, GLB produtivo ou ingestão no runtime. Prosseguir sequencialmente por P3D-B2–F antes de exercitar as funções da Biblioteca atrasaria a descoberta de necessidades reais de conteúdo, leitura e associação com os seis tipos de registro.

A cena F1 e os cenários F5 são evidência técnica/diagnóstica descartável; não são arquitetura produtiva de conteúdo. A dívida humana de TalkBack também permanece aberta: F6 não a aprovou no Moto G06.

## Decisão

### Prioridade e escopo

- adotar a trilha Biblioteca Funcional Primeiro (BF): construir primeiro uma Biblioteca funcional com conteúdo 3D procedural/provisório em TypeScript/Three.js;
- registrar BF-0 como este replanejamento e executar depois BF-1 (camada mínima de conteúdo procedural), BF-2 (primeira área de leitura integrada a registros reais), BF-3 (integração dos seis tipos de registro), BF-4 (ambiente habitável, mobília e personagens provisórios) e BF-5 (consolidação do marco funcional);
- decompor BF-1 em checkpoints pequenos antes de implementá-la; esta ADR não implementa BF-1 nem qualquer geometria;
- adiar P3D-B2, B3, B4 e P3D-C–F. Eles não estão concluídos nem cancelados e só voltam à execução se uma necessidade demonstrada exigir ingestão ou substituição por assets GLB definitivos;
- preservar integralmente `bookshelf` como `candidate`, com sua fonte upstream, licença, hashes e evidências. B1 permanece concluída documentalmente.

### Dois caminhos de representação visual

O caminho BF de conteúdo procedural e o caminho produtivo GLB são distintos:

- o caminho procedural cria representação provisória em TypeScript/Three.js para viabilizar a funcionalidade;
- ADR-010 continua sendo a autoridade para fonte, validação, promoção e ingestão de assets GLB produtivos;
- o caminho procedural não promove fixtures F1/F4, cenários diagnósticos F5 ou código experimental diretamente a arquitetura produtiva;
- ele também não aprova novos formatos externos, loaders, `AssetManager`, cache, streaming ou qualquer exceção aos invariantes da ADR-010.

Uma futura troca de representação procedural para GLB é permitida somente quando preservar a identidade lógica definida abaixo e atender a ADR-010.

### Identidade lógica e fronteira semântica

Para qualquer conteúdo funcional futuro, distinguir conceitualmente:

1. **tipo de modelo:** identidade estável do que é representado;
2. **instância no mundo:** ocorrência individual desse tipo na experiência; e
3. **ID de registro convencional associado:** referência opcional ao registro existente quando houver associação.

Essas três identidades não se confundem com nome de arquivo, URL, mesh, root Three, `asset-id`, posição, seleção visual ou representação procedural/GLB. Esta é uma decisão de significado, não introduz tipos TypeScript, schema, tabela, porta, API, backup ou persistência espacial.

React continua sendo a superfície semântica das funções essenciais. Seleção visual é complementar; nenhuma operação essencial pode depender exclusivamente do canvas. A arquitetura vigente continua `React → WorldHost → ThreeWorldRuntime → Three.js`, com domain/application isolados de Three e o runtime isolado de Dexie, backup e casos de uso convencionais.

### Estado espacial, acessibilidade e validação física

Não existe persistência espacial produtiva. ADR-008 continua encerrando os contratos espaciais anteriores; BF não os restaura nem antecipa tabela, schema Dexie, formato de backup ou contrato espacial novo. Isso só poderá ser projetado quando uma necessidade funcional demonstrar o que precisa ser salvo.

A dívida de TalkBack é bloqueante para encerrar o primeiro recorte real da BF. A remediação e a validação física ocorrerão incrementalmente no Moto G06, com build representativo então vigente, cobrindo operação essencial sem canvas e os compromissos assistivos existentes. Não são estabelecidos budgets preventivos: nova densidade ou mudança material de renderização requer medição proporcional à evidência necessária.

## Consequências

- BF pode revelar primeiro quais tipos de modelo, instâncias e associações convencionais realmente são necessários, sem acoplar essa descoberta a assets finais;
- P3D-B1 e a proveniência de `bookshelf` permanecem disponíveis para uma retomada controlada do GLB;
- F1 continua fixture técnica, F5 continua diagnóstico, e seus resultados não viram arquitetura de conteúdo por promoção implícita;
- o primeiro marco funcional não pode ser declarado fechado enquanto a validação humana assistiva obrigatória não tiver evidência adequada;
- não há alteração nesta decisão de runtime, assets, fixtures, domínio, aplicação, persistência, dependências, testes de produção, Dexie v8 ou backup v6.
