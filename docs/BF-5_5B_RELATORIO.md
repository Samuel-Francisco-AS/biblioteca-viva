# BF-5.5B — Tarefas, reservas e manipulação física de objetos

**Data:** 05/11/2026. **Estado:** candidata na PR draft encadeada à BF-5.5A (#32); sem merge, aceite físico ou CI global verde.

## Auditoria da BF-5.5A

A auditoria confirmou que a A usa o contrato versionado `world.inhabitants.continuity.v1`, valida IDs/valores com Zod, restaura posições antes de intenções e mantém os dados em `settings`, sem nova versão Dexie ou backup. A geometria restaurada é validada pela navegação e por separação entre habitantes; checkpoints são periódicos e acionados em visibilidade, `pagehide`, pausa e descarte. A recuperação de snapshot inválido é segura porque o parser rejeita o valor e a agência permanece no baseline.

Limitações confirmadas: o salvamento em encerramento abrupto é best effort; reservas ainda não existiam; a restauração não persistia uma tarefa física em andamento; e o runtime continuava dependente de callbacks assíncronos de armazenamento, embora ordenados pelo repositório. Não houve correção estrutural na A: não foi encontrado defeito pequeno inequívoco que exigisse alteração separada antes de B. A PR #32 permanece aberta/draft; CI em 05/11/2026 teve `Static, unit and build gates` **PASS** e `E2E shard 1/2`/`2/2` **FAIL**. As falhas E2E foram preservadas como dívida do runner/produto não classificada, sem declarar CI verde.

## Contratos implementados

- `InteractionCoordinator` mantém um lease por recurso, rejeita donos concorrentes, libera somente pelo dono/tarefa e recupera leases expirados.
- `InhabitantAgency` continua sendo a única autoridade de movimento. A tarefa de leitura do livro decorativo usa estados explícitos de orientação, pegar, transportar, posicionar, devolver e conclusão/falha.
- O estado transitório não cria tabela, migração Dexie ou backup novo. O checkpoint A continua compatível; tarefas em curso são reconstruídas com segurança ou liberam o recurso após interrupção.
- A seleção conserva `living:book` e seu grupo Three original. Nenhum livro pessoal é incluído.

## Interação física demonstrável

O livro cenográfico `living:book` é reservado por um habitante, recebe gesto de pegar, acompanha um ponto de transporte durante o deslocamento até uma superfície válida e retorna ao ponto original. A cena move o grupo selecionável original, não uma duplicata; a seleção e o ciclo de vida permanecem os mesmos.

Os GLBs atuais não expõem ossos nomeados de mão/pulso. A implementação usa um ponto de transporte estável anexado ao personagem e procura primeiro um osso futuro `hand`/`wrist`/`grip`. Portanto o ciclo é fisicamente observável, mas a pose da mão ainda é uma aproximação de rig, não uma integração corporal final.

## Testes e resultados

- Testes dirigidos de leases: **PASS**.
- Teste de identidade, transporte e restauração do objeto Three original: **PASS**.
- Continuidade da agência A: **PASS**.
- TypeScript e lint: **PASS**.
- `git diff --check`: **PASS**.
- CI remota da #32: gates estáticos/unitários/build **PASS**; dois shards E2E **FAIL**.
- Moto G06, TalkBack e teste físico integrado: **PENDENTES**, conforme decisão do proprietário.

## Dívidas, riscos e próximos gates

O ciclo usa somente o livro decorativo e não cobre assentos, sessões reais, pergaminhos, luminárias ou livros pessoais. Ainda é necessário refinar o ponto de mão com assets/rig compatíveis, testar interrupção durante cada fase em Android, validar câmera/picking em retrato e paisagem e acumular o gate físico no Moto G06. BF-5.5C, D e F não foram antecipadas.
