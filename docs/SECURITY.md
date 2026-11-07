> **R4C (07/11):** backup v6 preserva e valida as chaves existentes de continuidade/ritual e rejeita referências inválidas de anotações/tags/sessões antes da escrita. Schema v14/envelope v6 preservados; rollback/reabertura com fixtures no [relatório R4](audits/BV_RECUPERACAO_R4.md).

## Saneamento pós-R3 — 07/11/2026

Auditorias npm de produção e completa: zero alertas conhecidos no snapshot validado. As 24 ocorrências anteriores correspondiam a 49 advisories únicos. [Classificação, versões, exposição e evidências](audits/BV_SANEAMENTO_SEGURANCA_POS_R3.md). Capacitor exige redistribuição do APK corrigido; não basta atualizar JavaScript. Overrides de minimatch 11.0.5 limitados a ESLint/config-array/typescript-estree foram examinados quanto às APIs usadas; rever ao atualizar esses pais. Ferramentas de desenvolvimento também são superfície de ataque: manter servidores locais sem exposição desnecessária e tratar checkout, XML, mapas e respostas externas como não confiáveis. Auditoria limpa não certifica ausência de falhas futuras ou desconhecidas.

# Segurança

- Todo arquivo importado é não confiável e passa por limite de tamanho, parsing estrito, validação de schema, detecção de IDs duplicados e checksum antes de qualquer escrita.
- Restore é transacional e exige uma decisão explícita quando a base atual contém dados.
- O aplicativo não registra conteúdo pessoal, URI de documentos ou o conteúdo de backups.
- Credenciais, tokens, keystores, senhas, backups pessoais e exportações reais não entram no repositório.
- APIs nativas ficam na infraestrutura, atrás das portas da aplicação.

O checksum SHA-256 do backup detecta alterações acidentais; ele não é assinatura, autenticação nem criptografia.
