# BF-5.5B — Tarefas, reservas e manipulação física de objetos

**Data:** 05/11/2026. **Estado:** candidata na [PR draft #33](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/33), encadeada à BF-5.5A (#32); sem merge, aceite físico ou CI global verde.

## Diagnóstico confirmado na auditoria da BF-5.5B

A auditoria confirmou que a A usa o contrato versionado `world.inhabitants.continuity.v1`, valida IDs/valores com Zod, restaura posições antes de intenções e mantém os dados em `settings`, sem nova versão Dexie ou backup. A geometria restaurada é validada pela navegação e por separação entre habitantes; checkpoints são periódicos e acionados em visibilidade, `pagehide`, pausa e descarte. A recuperação de snapshot inválido é segura porque o parser rejeita o valor e a agência permanece no baseline.

Foram confirmadas três inconsistências localizadas na B:

- **Transporte visual:** `living:book` mantinha a identidade original, mas o ciclo seguia a âncora apenas como projeção horizontal, forçava `root.position.y = 0` e passava de `placing` para `returning` sem repousar efetivamente na superfície intermediária.
- **Interrupção e retomada:** checkpoints da A não persistem leases nem coreografia, como desejado, mas a restauração podia reativar uma tarefa física como `work` sem recurso reservado. Interrupção manual, conversa e reação a evento também não liberavam explicitamente uma interação ativa.
- **Exclusividade:** `InteractionCoordinator` permitia que o mesmo personagem substituísse uma lease com outro `taskId` e não oferecia renovação; um percurso longo podia perder a reserva antes da chegada.

Esta rodada confirmou duas causas-raiz adicionais na execução autônoma:

- **Identificador:** `InhabitantAgency` comparava `c-study`, embora o layout canônico publique `bf4-point:c-study`; a tarefa nunca era construída com a interação do livro.
- **Aproximação/retorno:** o ponto de estudo ficava distante da origem do livro e a origem visual está sobre a mesa, portanto não é um destino navegável para o personagem. A tarefa precisava de um ponto seguro de aproximação, usado tanto antes do gesto quanto no retorno após recolher o livro.

Não foi confirmado objeto duplicado no código: a seleção já aponta para o mesmo grupo Three. A falha de clipping/teleporte não era coberta pelo teste existente; foi reproduzida por inspeção do ciclo e corrigida com estados e asserts físicos dirigidos. A PR #32 permanece aberta/draft; a CI consultada em 05/11/2026 teve `Static, unit and build gates` **PASS** e os dois shards E2E **FAIL**. Essas falhas continuam dívida não classificada, sem declarar CI verde.

## Correções implementadas

- `InteractionCoordinator` mantém um lease por recurso e tarefa, rejeita outra tarefa mesmo do mesmo personagem, renova somente a propriedade correta e recupera leases expirados.
- `InhabitantAgency` continua sendo a única autoridade de movimento. A tarefa do livro agora usa orientação, pegar, transportar, posicionar, recolher, devolver e conclusão/falha; a lease é renovada durante o percurso.
- A interação referencia o ID canônico `bf4-point:c-study`, deriva o ponto de aproximação lateral a partir da origem e do ponto espacial existente, valida o alcance antes de pegar e retorna ao ponto seguro em vez de tentar caminhar sobre a mesa.
- Restauração nunca reativa tarefas físicas `work`/`navigate`; elas são canceladas recuperavelmente. Manual, conversa, evento, modelo indisponível, pausa, movimento reduzido e descarte liberam a reserva e deixam o objeto em estado visual conhecido.
- O estado transitório não cria tabela, migração Dexie ou backup novo. O checkpoint A continua compatível.
- A seleção conserva `living:book` e seu grupo Three original. Nenhum livro pessoal é incluído.

## Interação física demonstrável

O livro cenográfico `living:book` é reservado por um habitante, recebe gesto de pegar, acompanha um ponto de transporte durante o deslocamento até uma superfície válida e retorna ao ponto original. A cena move o grupo selecionável original, não uma duplicata; a seleção e o ciclo de vida permanecem os mesmos.

Os GLBs atuais não expõem ossos nomeados de mão/pulso. A implementação usa um ponto de transporte estável anexado ao personagem e procura primeiro um osso futuro `hand`/`wrist`/`grip`. O livro acompanha a transformação mundial da âncora com offset derivado do volume real, repousa com sua caixa inferior na altura da superfície de destino e só então é recolhido. A pose da mão continua sendo uma aproximação de rig, não uma integração corporal final.

## Testes e resultados

- Testes dirigidos de leases, renovação, expiração e tarefa diferente: **PASS** (2 testes).
- Teste de identidade Three.js, offset espacial, repouso intermediário, recolhimento e restauração do objeto original: **PASS** (2 testes).
- Continuidade da agência, incluindo checkpoint durante interação física cancelada: **PASS** (3 testes).
- Total da rodada dirigida desta correção: **8 testes PASS** na agência, além dos testes de leases, continuidade e Three.js listados acima.
- Teste integrado determinístico da agência real: **PASS**, com Aryn isolado por `setAvailable`, seed controlada e observação pública dos estados `orienting → picking → carrying → placing → recollecting → returning → release`.
- `npm run lint`, `npm run typecheck`, `npm run format:check` e `git diff --check`: **PASS**.
- `npm run build`: **PASS**, com o aviso preexistente de chunks minificados acima de 500 kB.
- CI remota consultada para a #33: gate estático/unitário/build **PASS**; E2E shard 1/2 e 2/2 **FAIL**.
- Moto G06, TalkBack e teste físico integrado: **PENDENTES**, conforme decisão do proprietário.

## Dívidas, riscos e próximos gates

O ciclo usa somente o livro decorativo e não cobre assentos, sessões reais, pergaminhos, luminárias ou livros pessoais. Ainda é necessário refinar o ponto de mão com assets/rig compatíveis, testar interrupção durante cada fase em Android, validar câmera/picking em retrato e paisagem e acumular o gate físico no Moto G06. Não houve teste físico, TalkBack, aprovação de CI global ou alteração de Dexie/backup. BF-5.5C, D e F não foram antecipadas.
