# Segurança

- Todo arquivo importado é não confiável e passa por limite de tamanho, parsing estrito, validação de schema, detecção de IDs duplicados e checksum antes de qualquer escrita.
- Restore é transacional e exige uma decisão explícita quando a base atual contém dados.
- O aplicativo não registra conteúdo pessoal, URI de documentos ou o conteúdo de backups.
- Credenciais, tokens, keystores, senhas, backups pessoais e exportações reais não entram no repositório.
- APIs nativas ficam na infraestrutura, atrás das portas da aplicação.

O checksum SHA-256 do backup detecta alterações acidentais; ele não é assinatura, autenticação nem criptografia.
