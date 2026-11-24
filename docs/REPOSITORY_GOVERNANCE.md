# Governança de dados, privacidade e licenças do repositório

Este documento define como colaboradores devem tratar dados, evidências, dependências e materiais de terceiros ao trabalhar no repositório público da Biblioteca Viva. Ele complementa [Privacidade do aplicativo](PRIVACY.md), [Segurança](SECURITY.md) e [Contribuição](../CONTRIBUTING.md).

## 1. Dois contextos diferentes

A privacidade do aplicativo e a privacidade do repositório são assuntos relacionados, mas não equivalentes.

- **Aplicativo:** a Biblioteca Viva é local-first. Registros e backups ficam no dispositivo, conforme a documentação de produto em [PRIVACY.md](PRIVACY.md).
- **Repositório:** código, documentação, issues, pull requests, commits, workflows e arquivos versionados podem ser públicos. Não inclua neles informações pessoais, credenciais ou dados reais de usuários.

A característica local-first do aplicativo não torna automaticamente seguro publicar um arquivo exportado, uma captura de tela ou um relatório de diagnóstico.

## 2. Dados que não devem ser publicados

Nunca versionar nem anexar a commits, issues, pull requests ou artefatos públicos:

- Senhas, tokens, chaves de API, cookies, cabeçalhos de autorização, certificados privados, keystores ou material de assinatura.
- Backups reais, bancos de dados de usuários, exports, arquivos de perfil ou dados de restauração.
- CPF, endereço residencial, telefone, e-mail pessoal, identificadores de conta ou outros dados pessoais não necessários.
- Capturas de tela, vídeos, logs ou relatórios que revelem notificações, nomes de usuário, diretórios locais, dispositivos, contas ou conteúdo privado.
- Dados de saúde, financeiros ou outros dados sensíveis, mesmo que apareçam incidentalmente em uma evidência.

Use exclusivamente dados fictícios e sintéticos nas fixtures, exemplos, testes, screenshots e relatórios públicos. Não use dados reais mascarados parcialmente como fixture: gere dados fictícios desde a origem.

## 3. Evidências e caminhos locais

Evidências versionadas devem ser reproduzíveis, mínimas e sanitizadas. Remova caminhos absolutos, nomes de usuário, nomes de máquinas, diretórios de laboratório, URIs locais e metadados desnecessários. Prefira referências relativas ou marcadores neutros, como `<repo-root>` e `<lab-root>`.

Para os arquivos textuais em `docs/audits/evidence/`, há ferramentas auxiliares:

```bash
npm run privacy:sanitize
npm run privacy:test
npm run privacy:check
```

- `privacy:sanitize` substitui caminhos conhecidos do repositório e do laboratório em arquivos textuais rastreados nessa pasta. Revise o diff depois da execução.
- `privacy:test` executa testes unitários do sanitizador.
- `privacy:check` procura padrões de caminhos locais, e-mails, CPF/telefone formatados e alguns formatos conhecidos de credenciais.

**Limite importante:** essas ferramentas não são um scanner universal. O verificador cobre somente arquivos de texto em `docs/audits/evidence/`; não examina o histórico Git completo, outros diretórios, conteúdo binário, EXIF, screenshots, PDFs, arquivos compactados, artefatos externos, issues ou configurações privadas do GitHub. Expressões regulares podem produzir falsos positivos e falsos negativos. Uma execução aprovada não certifica que o repositório esteja livre de dados pessoais ou segredos.

Antes de publicar uma evidência, faça também revisão humana do conteúdo e dos metadados. Se houver dúvida, não publique o arquivo até esclarecer sua origem e conteúdo.

## 4. Segredos e resposta a incidentes

Se uma credencial for publicada ou suspeita de exposição:

1. Interrompa a publicação e informe o mantenedor por canal privado apropriado, sem repetir o segredo em issue, comentário ou log.
2. Revogue ou rotacione a credencial imediatamente no serviço emissor. Apagar o arquivo do último commit não invalida uma credencial exposta.
3. Identifique commits, branches, releases, artefatos e cópias potencialmente afetados.
4. Combine com o mantenedor a remoção do conteúdo público e a avaliação de limpeza do histórico. Reescrever histórico pode afetar clones e referências; não faça isso unilateralmente.
5. Registre o incidente sem reproduzir o valor secreto nem dados pessoais.

Não inclua credenciais em mensagens de commit, nomes de branch, fixtures, exemplos, screenshots ou relatórios.

## 5. Licenças, autoria e proveniência

A ausência de uma declaração de licença no repositório não deve ser interpretada como autorização para reutilizar, redistribuir ou modificar o projeto. Até que uma licença seja formalmente escolhida e publicada pelo titular dos direitos, não presuma que o código esteja sob MIT, Apache-2.0 ou qualquer outra licença open source.

Para cada dependência, fonte de dados, fonte tipográfica, imagem, áudio, modelo 3D, textura, ícone ou outro material de terceiros introduzido:

- Registre nome, versão ou identificação, origem e URL de referência.
- Registre titular/autoria quando conhecida e a licença/termos aplicáveis.
- Confira permissões de uso, modificação, distribuição, atribuição e uso comercial, quando relevante.
- Registre alterações, conversões, recortes, geração derivada e localização do material no projeto.
- Preserve avisos de copyright, LICENSE e NOTICE exigidos pela origem.
- Não trate disponibilidade pública, download gratuito, resultado de busca ou geração por IA como prova de licença ou de domínio público.

Não adicione material quando a licença for desconhecida, incompatível ou não permitir o uso pretendido. Solicite esclarecimento ao mantenedor antes de integrar.

Esta política documenta o processo; ela não concede licenças sobre o código, marcas, conteúdo ou assets da Biblioteca Viva, nem substitui análise jurídica de casos específicos.

## 6. Revisão antes de cada contribuição

Antes de abrir ou atualizar uma contribuição, confirme:

- O diff não contém dados pessoais, segredos, backups ou caminhos absolutos.
- Fixtures e evidências usam dados inteiramente fictícios.
- Arquivos binários e imagens foram revisados quanto a metadados e conteúdo incidental.
- Dependências e materiais de terceiros têm origem e licença verificáveis.
- Os testes de privacidade aplicáveis foram executados e o diff foi revisado.
- A documentação descreve corretamente o escopo e as limitações dos controles executados.

Em caso de dúvida, prefira omitir a evidência ou dependência até que ela possa ser revisada com segurança.
