# Segurança

## 1. Escopo atual

O protótipo é local-first, sem conta e sem backend. O principal risco não é ataque a servidor inexistente; é perda, exposição ou importação maliciosa de dados pessoais no aparelho e no repositório.

## 2. Ativos protegidos

- livros, notas, citações e histórico;
- backups exportados;
- preferências;
- integridade de migrações;
- chave de assinatura Android;
- cadeia de dependências e build.

## 3. Ameaças iniciais

- arquivo de backup adulterado ou incompatível;
- XSS por texto/Markdown renderizado sem sanitização;
- dados privados em logs, fixtures ou screenshots públicas;
- chave ou senha no Git;
- plugin Capacitor excessivo ou desatualizado;
- dependência comprometida;
- perda por migração ou evicção de armazenamento;
- permissões Android desnecessárias;
- WebView carregando conteúdo remoto inseguro.

## 4. Controles obrigatórios

- nenhuma credencial no bundle;
- `VITE_*` nunca é secreto;
- lockfile versionado;
- validação Zod de importações e fronteiras;
- texto do usuário tratado como texto;
- sanitização explícita antes de qualquer HTML gerado;
- Content Security Policy restritiva;
- HTTPS para futuras integrações;
- permissões Android mínimas;
- logs sem conteúdo pessoal;
- backups somente por ação do usuário;
- keystore e senhas fora do Git;
- migrações e restaurações transacionais;
- dependências novas justificadas e revisadas.

## 5. Armazenamento

IndexedDB/Dexie é persistência inicial, não criptografia. O sandbox do Android reduz exposição, mas não autoriza a mensagem “dados criptografados”.

Avaliar SQLite e armazenamento seguro quando:

- houver perda reproduzível;
- volume ou busca exigirem;
- anexos entrarem;
- criptografia local forte for requisito;
- conta e tokens existirem.

Tokens futuros devem usar armazenamento seguro/Android Keystore, nunca preferências comuns.

## 6. Importação de backup

Antes de modificar dados:

1. limitar tamanho aceitável;
2. validar formato e versão;
3. rejeitar campos inesperados quando apropriado;
4. migrar em memória ou área temporária;
5. apresentar resumo;
6. executar transação;
7. preservar estado anterior em caso de falha;
8. não renderizar conteúdo importado como HTML.

## 7. Android

- `appId` estável;
- keystore única, protegida e com backup seguro;
- `android/` revisado e versionado conforme decisão do projeto;
- nada de cleartext traffic sem justificativa;
- plugins mínimos;
- release sem debug habilitado;
- atualização testada sobre versão anterior assinada.

## 8. Futuro com conta

Antes de backend ou sincronização, criar nova análise de ameaças cobrindo:

- autenticação;
- autorização no servidor;
- PKCE/OAuth quando aplicável;
- sessão e revogação;
- criptografia em trânsito;
- exclusão e exportação;
- conflitos de sincronização;
- abuso e limitação de taxa;
- política de privacidade pública.

## 9. Resposta a incidente

Ao detectar perda ou exposição:

1. interromper release;
2. preservar evidências sem copiar conteúdo pessoal desnecessário;
3. identificar versões afetadas;
4. criar correção e teste de regressão;
5. oferecer instrução de recuperação;
6. registrar no changelog e decisões;
7. revisar controle que falhou.

## 10. Afirmações proibidas

Não usar em README, interface ou portfólio sem implementação verificável:

- “criptografia de ponta a ponta”;
- “segurança militar”;
- “impossível perder dados”;
- “100% privado” quando houver integrações;
- “conforme LGPD” sem avaliação real do tratamento de dados.
