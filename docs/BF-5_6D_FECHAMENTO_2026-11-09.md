# BF-5.6D — Encerramento da etapa por gate físico dirigido (09/11/2026)

## Decisão e escopo

O proprietário autorizou expressamente a integração da BF-5.6D após a validação física dirigida no Moto G06, com **6/6 grupos PASS**. A [PR #46](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/46), branch `feat/bf-5-6d-arcanario-pacotes-oficiais` e head `405b6c8c52b3b90281142d92e21e3dbf33457d5c`, foi **integrada na `main`** por merge commit **`b3db5d87ce7e327e2ab88420681c4feaf99b1d6e`**.

Trabalho D1 → D2 → D3: manifesto e importação validada, instalação incremental e idempotente, atualização por lotes, catálogo, remoção/reinstalação, Provações offline e retenção de histórico. O marco educacional A–D está integrado, **mas não significa release, certificação global ou encerramento da BF-5.6**. Etapas E (TCG), F (arena/arte 3D) e G (auditoria/fechamento global) permanecem futuras e requerem implementação e validação próprias.

## Gate físico do proprietário — Moto G06

| Grupo | Resultado |
| --- | --- |
| 1. Atualização e preservação | **PASS** |
| 2. Reparos anteriores (BF-5.6C) | **PASS** |
| 3. Biblioteca de Provas | **PASS** |
| 4. Provações offline | **PASS** |
| 5. Atualização e remoção | **PASS** |
| 6. Interface e Canvas | **PASS** |

Não foram reportados novos defeitos neste gate. A verificação física inclui a correção de etiquetas/contraste da C e o retorno ao mundo 3D. [Comentário de evidência na PR #46](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/46#issuecomment-6737816545). **O gate foi humano, não CI verde nem substituto para testes assistivos e de longa duração.**

## Integridade e compatibilidade

- Dexie **v18**; backup pessoal **v10**, importando v6–v9; limite 10 MiB e sem downgrade garantido.
- Pacotes oficiais/reinstaláveis são separados do backup privado; histórico e revisões necessárias permanecem interpretáveis após remoção ou restauração.
- A remoção desativa seleção de novos exercícios, mas **retém deliberadamente revisões locais**, logo não promete liberar armazenamento físico.
- Distribuição inclui **4 questões originais** em **2 lotes**; ENEM 2024 e CPNU 2024 são **referências, com 0 questões oficiais redistribuídas**. Direitos e conferência editorial não demonstrados suficientemente para a inclusão de enunciados/imagens de terceiros. Não confundir catálogo de referência com pacote instalado.
- Fontes, modelo, ensaios, hash do APK, riscos e detalhes técnicos: [Relatório BF-5.6D](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md) e [ADR-028](decisions/ADR-028-pacotes-educacionais-retencao.md).

## Ressalvas que permanecem abertas

- Rodada ampla local: **1.120 PASS / 11 FAIL**, com correções verificadas em testes dirigidos, sem uma nova alegação de suíte integral PASS.
- E2E de **Canvas headless** permaneceu FAIL/timeout; **Canvas físico PASS** no Moto G06 não altera automaticamente o resultado E2E.
- CI remota global não executada/sem PASS; TalkBack especializado, consumo sustentado de memória e termal não certificados.
- Restore destrutivo do backup deve ser feito somente em base descartável, nunca sobre dados pessoais do proprietário.
- Não há pacote autêntico de provas instalado/distribuído; eventual liberação editorial exige prova de direitos e fidelidade de enunciados, gabaritos e anexos.
- Dívidas anteriores A–C/BF-5.5 não deixam de existir apenas pelo aceite desta etapa.

## Encaminhamento

BF-5.6D **fechada por aceite funcional dirigido e merge autorizado**, com ressalvas. A próxima etapa planejada é **BF-5.6E — TCG estratégico**, com motor determinístico de duelistas, quatro afinidades e cartas fantásticas; construir após autorização específica, em branch da `main` consolidada, PR draft sem merge automático. A etapa F conserva construção orbital/arena 3D; G é o fechamento e a auditoria global.
