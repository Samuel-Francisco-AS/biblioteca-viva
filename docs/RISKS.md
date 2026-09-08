# Registro de riscos ativos

| ID | Risco | Mitigação atual |
|---|---|---|
| R-01 | documentação divergir do produto | autoridades curtas, histórico separado e revisão junto ao código |
| R-02 | perda ou evicção de dados locais | backup v6, restore transacional e testes |
| R-03 | backup malicioso ou incompatível | limite, schema estrito, duplicatas, checksum e rejeição de legado |
| R-04 | regressão de acessibilidade convencional | HTML semântico, testes e gate humano |
| R-05 | asset sem licença/procedência | registro obrigatório antes de release |
| R-06 | dependência ou plugin quebrar Android | lockfile, plugins mínimos e build local |
| R-07 | chave de assinatura perdida | guarda e recuperação fora do Git |
| R-08 | escopo crescer antes de uma fatia aprovada | roadmap curto e ADR para mudança arquitetural |
| R-09 | desempenho da futura implementação 3D em hardware Android modesto | prova técnica e validação física futuras; risco não resolvido |

Revisar ao iniciar uma fatia, alterar dados, adicionar dependência ou preparar release.
