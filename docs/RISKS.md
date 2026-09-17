# Registro de riscos ativos

| ID | Risco | Mitigação atual |
|---|---|---|
| R-01 | documentação divergir do produto | autoridades curtas, histórico separado e revisão junto ao código |
| R-02 | perda ou evicção de dados locais | backup v6, restore transacional e testes |
| R-03 | backup malicioso ou incompatível | limite, schema estrito, duplicatas, checksum e rejeição de legado |
| R-04 | regressão de acessibilidade convencional | HTML semântico, ponte React acessível, cobertura automatizada F6 e dívida humana TalkBack explícita; validar build atual com TalkBack/ordem/leitura/anúncios/foco/ergonomia/contraste/texto antes do fechamento do primeiro recorte real e de beta/release aplicável |
| R-05 | asset sem licença/procedência | registro obrigatório antes de release; cada asset real de prova F4 deverá registrar origem, autoria, licença, fonte editável, transformações, finalidade e estado experimental; o fixture F1 já possui procedência interna clara |
| R-06 | dependência ou plugin quebrar Android | lockfile e plugins mínimos; sync, build Gradle e execução física no Moto G06 passaram na F1 |
| R-07 | chave de assinatura perdida | guarda e recuperação fora do Git |
| R-08 | escopo crescer antes de uma fatia aprovada | roadmap progressivo, STATUS e ADR-009 limitam a aprovação ao renderer da Fundação; F4 fechou somente contrato experimental de assets, F5 foi concluída e F6, bem como as fases posteriores, continuam exigindo escopo próprio |
| R-09 | desempenho 3D em Android modesto | **parcialmente mitigado:** F5 validou no Moto G06 o envelope F1/F4/F4×4, loading/remount, memória, interação, orientação, background/resume e sessão de aproximadamente 15 minutos sem crash, degradação humana percebida ou thermal status acima de `0`; não encontrou teto nem aprova conteúdo real, iluminação, animação, transparências, personagens, memória GPU exata ou mundo final. Gatilho: remedir no aparelho antes de superar materialmente o corpus simultâneo, a ordem de ~1 s de remount interno ou a complexidade de renderização observada |
| R-10 | reabrir ou multiplicar renderers sem evidência estrutural | ADR-009 aprova Three.js para a Fundação e impede testes preventivos de alternativas; reabertura exige evidência nova |

Revisar ao iniciar uma fatia, alterar dados, adicionar dependência ou preparar release.
