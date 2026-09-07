# Segurança

## Escopo

O produto é local-first, sem conta e sem backend. Os riscos principais são perda ou exposição de dados no aparelho, importação maliciosa, migração defeituosa, dependências comprometidas e vazamento de credenciais de release.

## Ativos

- registros, notas, citações, sessões e histórico;
- estrutura e objetos do mundo;
- backups exportados;
- integridade de migrações;
- preferências;
- keystore e credenciais Android;
- cadeia de dependências e build.

## Controles

- nenhuma credencial no bundle ou no Git;
- lockfile versionado e dependências novas justificadas;
- validação Zod ou equivalente em fronteiras externas;
- texto do usuário tratado como texto, sem HTML não sanitizado;
- CSP restritiva dentro dos limites de uma meta tag local;
- permissões Android mínimas;
- logs e diagnósticos sem conteúdo pessoal;
- migração e restore transacionais;
- exportação e compartilhamento somente por ação explícita;
- fixtures e evidências públicas fictícias.

## Backup não confiável

Antes de escrever, rejeitar tamanho acima do limite, JSON inválido, schema desconhecido, versão futura, IDs duplicados e integridade divergente. A inspeção não altera o banco. O restore revalida dentro da transação e não dispara eventos de conquista.

SHA-256 detecta alteração acidental; não autentica origem, não assina e não criptografa. JSON e IndexedDB continuam legíveis para quem obtiver acesso ao arquivo ou perfil local.

## Android e release

Keystore, alias, senha e arquivos de assinatura ficam fora do repositório. Release exige versão crescente, atualização sobre build anterior, revisão de permissões, origem local da WebView e checklist própria. APK debug não deve ser apresentado como pacote de distribuição.

## Dependências e CI

CI não recebe backup pessoal, segredo ou chave de assinatura. Actions e pacotes devem ser fixados/revisados segundo o risco. Advisory sem caminho explorável no produto ainda precisa ser registrado, mas não deve gerar alegação falsa de segurança total.

## Resposta a incidente

1. Interromper distribuição ou mudança de dados afetada.
2. Preservar evidência mínima sem copiar conteúdo pessoal.
3. Identificar versões e caminhos atingidos.
4. Criar correção e regressão.
5. Orientar recuperação.
6. Atualizar changelog, risco e decisão aplicável.

## Afirmações proibidas

Não afirmar “100% privado”, “impossível perder dados”, “criptografia de ponta a ponta”, “segurança militar” ou conformidade legal sem implementação e avaliação verificáveis.
