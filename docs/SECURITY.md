> **R4 — candidata de 07/11/2026:** main base `d5eb469` integra PRs #32–#38 e aceites físicos dirigidos R2/R3/segurança. R4A–D implementadas na PR draft #39; gates estáticos, 935 unitários, web e APK debug locais PASS. Dados/sessões separados, diagnóstico opt-in e integridade v6 reforçada. Playwright dirigido **3 PASS/1 FAIL** (seleção R2 por deadline, causa não atribuída); sem aprovação física R4 ou CI global verde. [Autoridade canônica e evidências](audits/BV_RECUPERACAO_R4.md). BF-5.5 parcial; R5, F2B/F2C e BF-5.5G não iniciadas. Notas anteriores são cronologia.

## Saneamento pós-R3 — 07/11/2026

Auditorias npm de produção e completa: zero alertas conhecidos no snapshot validado. As 24 ocorrências anteriores correspondiam a 49 advisories únicos. [Classificação, versões, exposição e evidências](audits/BV_SANEAMENTO_SEGURANCA_POS_R3.md). Capacitor exige redistribuição do APK corrigido; não basta atualizar JavaScript. Overrides de minimatch 11.0.5 limitados a ESLint/config-array/typescript-estree foram examinados quanto às APIs usadas; rever ao atualizar esses pais. Ferramentas de desenvolvimento também são superfície de ataque: manter servidores locais sem exposição desnecessária e tratar checkout, XML, mapas e respostas externas como não confiáveis. Auditoria limpa não certifica ausência de falhas futuras ou desconhecidas.

# Segurança

- Todo arquivo importado é não confiável e passa por limite de tamanho, parsing estrito, validação de schema, detecção de IDs duplicados e checksum antes de qualquer escrita.
- Restore é transacional e exige uma decisão explícita quando a base atual contém dados.
- O aplicativo não registra conteúdo pessoal, URI de documentos ou o conteúdo de backups.
- Credenciais, tokens, keystores, senhas, backups pessoais e exportações reais não entram no repositório.
- APIs nativas ficam na infraestrutura, atrás das portas da aplicação.

O checksum SHA-256 do backup detecta alterações acidentais; ele não é assinatura, autenticação nem criptografia.

## Governança do repositório e evidências

As regras para dados pessoais, evidências públicas, resposta a exposição de credenciais e proveniência/licenças de materiais estão em [REPOSITORY_GOVERNANCE.md](REPOSITORY_GOVERNANCE.md). Os comandos `privacy:test` e `privacy:check` são controles auxiliares limitados aos arquivos textuais de `docs/audits/evidence/`; não substituem revisão humana, varredura do histórico Git ou inspeção de binários/metadados.
