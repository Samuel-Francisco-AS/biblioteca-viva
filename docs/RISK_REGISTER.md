# Registro de riscos

Escala: probabilidade e impacto `baixo`, `médio` ou `alto`.

| ID | Risco | Prob. | Impacto | Mitigação | Gatilho | Estado |
|---|---|---|---|---|---|---|
| R-01 | escopo crescer antes do ciclo principal | alta | alto | gates, fora de escopo e um prompt por vez | novo tipo/sala proposto antes de G11 | ativo |
| R-02 | app bonito, mas cadastro ruim | média | alto | G4 antes da sala completa; uso pessoal real | cadastro demorado ou abandono de uso | ativo |
| R-03 | perda ou evicção de dados | média | alto | backup v2 retrocompatível, restauração transacional e marcos monotônicos implementados; nova validação Android pendente | dado some após reinício/atualização | mitigado parcialmente |
| R-04 | Phaser assumir regras de negócio | média | alto | projeção e ponte tipada; testes de dependência | cena importa repositório ou domínio mutável | ativo |
| R-05 | desempenho ruim em aparelho modesto | média | alto | lazy load, sala pequena, modo reduzido e perfil | FPS instável ou memória crescente | ativo |
| R-06 | produção de arte e áudio atrasar | alta | médio | fallback geométrico, assets mínimos e manifests | código pronto sem conteúdo disponível | ativo |
| R-07 | dependência excessiva do Codex | alta | alto | diffs pequenos, relatório, documentação e revisão | usuário não consegue explicar alteração | ativo |
| R-08 | documentação divergir do código | média | alto | docs no mesmo commit e STATUS volátil | comportamento contradiz documento | ativo |
| R-09 | segurança exagerada ou falsa | média | médio | afirmações honestas e ameaça local | promessa de criptografia sem implementação | ativo |
| R-10 | plugin/dependência quebrar Android | média | alto | APK cedo, plugins mínimos, lockfile | sync/build nativo falha | ativo |
| R-11 | backup importar conteúdo malicioso | baixa | alto | Zod estrito, 10 MiB, checksum e transação replace testados | arquivo externo aceito sem validação | mitigado parcialmente |
| R-12 | chave de assinatura perdida | baixa | alto | backup seguro e fora do Git | release sem cópia verificada | ativo |
| R-13 | gamificação virar culpa | média | alto | guia de conteúdo e revisão ética | streak, punição ou degradação sugerida | ativo |
| R-14 | arquitetura inchada antes do uso | média | médio | modular monolith e pastas sob demanda | abstração sem implementação real | ativo |

## Revisão

Revisar este arquivo:

- em cada gate;
- antes de dependência estrutural;
- antes de migração;
- antes de release Android;
- quando um risco se materializar.

Quando materializado, registrar defeito, decisão e teste de regressão. Risco encerrado permanece no histórico com justificativa.
