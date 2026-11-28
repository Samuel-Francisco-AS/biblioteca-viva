# Contribuindo com a Biblioteca Viva

Antes de começar, leia [docs/STATUS.md](docs/STATUS.md) para entender o estado vigente e [docs/README.md](docs/README.md) para navegar pela documentação. Documentos históricos preservam decisões e evidências, mas não autorizam trabalho novo por si só.

## Fluxo de contribuição

1. Delimite uma mudança pequena e verificável e confirme seu escopo com o mantenedor quando necessário.
2. Inspecione o checkout real, os contratos existentes e os testes antes de editar.
3. Execute verificações proporcionais ao risco e revise o diff completo.
4. Atualize documentação e changelog junto ao comportamento alterado.
5. Registre evidência humana quando a conclusão depender de aparelho, áudio, acessibilidade ou leitura visual.
6. Não declare gates como aprovados se não foram executados; diferencie resultado local, CI remota e validação física.

## Privacidade e evidências

O repositório pode ser público. Não inclua dados pessoais, backups reais, exports de usuários, credenciais, tokens, chaves, cookies, keystores ou material de assinatura em código, fixtures, logs, commits, issues, pull requests ou artefatos.

Use dados fictícios gerados para esse propósito. Antes de publicar capturas, vídeos, logs ou relatórios, revise conteúdo visível, metadados e caminhos locais. Não confie apenas em `.gitignore` ou em verificações automatizadas.

Para evidências textuais em `docs/audits/evidence/`, os comandos disponíveis são:

```bash
npm run privacy:sanitize
npm run privacy:test
npm run privacy:check
```

O sanitizador altera arquivos: revise o diff antes de commitar. O verificador cobre somente arquivos textuais nessa pasta e padrões conhecidos; não examina todo o repositório, o histórico Git ou arquivos binários. Uma aprovação automatizada não substitui revisão humana nem garante ausência de dados sensíveis.

Consulte [Governança de dados, privacidade e licenças](docs/REPOSITORY_GOVERNANCE.md) para o escopo, limitações, resposta a incidentes e regras de proveniência/licenciamento. Se um segredo for exposto, solicite rotação/revogação imediatamente; remover o texto do último commit não invalida a credencial.

## Dependências, assets e conteúdo de terceiros

Dependência nova exige justificativa de valor, impacto em bundle, Android, licença e manutenção. Assets e conteúdo novos exigem origem, autoria, licença, transformação e registro verificável. Não presuma que conteúdo encontrado publicamente ou gerado por IA esteja liberado para redistribuição.

A ausência de uma licença explícita no repositório não concede permissão de reutilização. Não atribua uma licença ao projeto ou a materiais sem autorização do titular.

## Qualidade e responsabilidade

- Execute os comandos relevantes do projeto, incluindo formatação, lint, tipos, testes e build quando aplicável.
- Não reduza asserts, desative verificações ou aumente timeouts apenas para obter PASS sem justificativa e registro.
- Código gerado por IA precisa ser compreendido, testado e revisado por uma pessoa antes de integrar o projeto.
- Não publique evidências ou dados de produção para facilitar depuração; construa uma reprodução sintética.
