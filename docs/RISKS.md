# Registro de riscos ativos

| ID | Risco | Impacto | Mitigação atual | Estado |
|---|---|---|---|---|
| R-01 | documentação divergir do produto | alto | autoridade única, arquivo histórico separado e revisão junto ao código | monitorado |
| R-02 | perda ou evicção de dados | alto | backup v5, leitores v1–v4, restore transacional e testes de migração | mitigado parcialmente |
| R-03 | desempenho ruim em aparelho modesto | alto | lazy load, instrumentação e assets bloqueantes reduzidos | ativo |
| R-04 | Phaser assumir negócio ou persistência | alto | projeção tipada e portas da aplicação | monitorado |
| R-05 | regressão de continuidade estrutural | alto | normal topológica, perfil comparável e matriz 31/31 | monitorado |
| R-06 | correção específica para blueprint | alto | proibição de exceções por coordenada/instância e testes não canônicos | monitorado |
| R-07 | backup malicioso ou incompatível | alto | limite, schema estrito, duplicatas, checksum e transação | mitigado parcialmente |
| R-08 | acessibilidade depender do canvas | alto | alternativa React e validações automáticas/humanas | ativo |
| R-09 | asset sem licença ou procedência suficiente | alto | registro obrigatório e gate antes de release | ativo |
| R-10 | dependência ou plugin quebrar Android | alto | lockfile, plugins mínimos e build local | monitorado |
| R-11 | chave de assinatura perdida | alto | guarda fora do Git e recuperação antes do release | ativo antes do release |
| R-12 | gamificação virar coerção | alto | sem streak/XP/moeda e revisão de conteúdo | monitorado |
| R-13 | escopo crescer antes de uma fatia aprovada | alto | roadmap sem etapa ativa e critérios de autorização | ativo |
| R-14 | dependência excessiva de agente | alto | contratos claros, testes reproduzíveis e revisão humana | mitigado parcialmente |

Revisar este registro ao iniciar uma fatia, alterar dados, adicionar dependência, preparar release ou materializar um risco. Risco encerrado vai para a decisão ou registro histórico correspondente.
