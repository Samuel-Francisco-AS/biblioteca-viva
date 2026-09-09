# Registro de riscos ativos

| ID | Risco | Mitigação atual |
|---|---|---|
| R-01 | documentação divergir do produto | autoridades curtas, histórico separado e revisão junto ao código |
| R-02 | perda ou evicção de dados locais | backup v6, restore transacional e testes |
| R-03 | backup malicioso ou incompatível | limite, schema estrito, duplicatas, checksum e rejeição de legado |
| R-04 | regressão de acessibilidade convencional | HTML semântico, testes, ponte React acessível na F1 e gate humano |
| R-05 | asset sem licença/procedência | registro obrigatório antes de release; fixture F1 também exige origem/licença clara |
| R-06 | dependência ou plugin quebrar Android | lockfile e plugins mínimos; sync, build Gradle e execução física no Moto G06 passaram na F1 |
| R-07 | chave de assinatura perdida | guarda e recuperação fora do Git |
| R-08 | escopo crescer antes de uma fatia aprovada | roadmap progressivo, STATUS e ADR-009 limitam a aprovação ao renderer da Fundação; F2–F6 e o mundo real exigem escopo próprio |
| R-09 | desempenho 3D em Android modesto | **parcialmente mitigado:** F1 demonstrou aproximadamente 60 FPS sustentados na cena mínima Three.js no Moto G06, sem regressão física relevante; o risco permanece para densidade, assets, iluminação, personagens e mundo real, e F4/F5 continuarão a prova |
| R-10 | reabrir ou multiplicar renderers sem evidência estrutural | ADR-009 aprova Three.js para a Fundação e impede testes preventivos de alternativas; reabertura exige evidência nova |

Revisar ao iniciar uma fatia, alterar dados, adicionar dependência ou preparar release.
