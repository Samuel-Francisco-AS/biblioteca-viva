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

O banco `biblioteca-viva` valida registros na leitura e usa transações para entidade/anotação e atividade, mas isso não protege contra acesso a um aparelho comprometido. `navigator.storage.persist()` é apenas uma solicitação: mesmo concedida, não substitui backup e não garante preservação absoluta pelo sistema. O diagnóstico restrito ao desenvolvimento e a builds internos expõe somente versão, estado, contagens e falha sanitizada e permanece fora da produção normal.

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

## 11. Controles implementados no Prompt 10

O arquivo externo é não confiável. O fluxo rejeita antes do parse conteúdo acima de 10 MiB, JSON malformado, raiz ou entidades fora dos schemas Zod estritos, formato desconhecido, versões não suportadas ou futuras, IDs duplicados e SHA-256 ausente ou divergente. O digest usa serialização canônica recursiva e exclui `integrity`; detecta corrupção ou alteração acidental, mas não é assinatura, autenticação ou criptografia.

A inspeção não escreve. A restauração valida novamente antes de uma única transação Dexie que substitui `libraryEntries`, `notes`, `quotes`, `activities` e `settings`; `metadata` técnico do destino não é apagado. No formato v2, `milestones` também é validado e restaurado por união monotônica de IDs: um marco legítimo local não é apagado por backup antigo, e a repetição não duplica recompensa. Backups v1 mantêm checksum e estrutura estritos e não inventam marcos. Base não vazia exige antes a entrega de um backup de segurança. A restauração não publica eventos de conquista, não cria atividades extras e não registra conteúdo pessoal em logs.

A CSP inicial é entregue por meta tag com origem própria por padrão, scripts locais sem `unsafe-eval`, objetos bloqueados e HMR limitado às origens locais padrão. `unsafe-inline` permanece apenas em estilos por compatibilidade atual. Meta CSP não equivale a cabeçalho HTTP. Riscos residuais: JSON e IndexedDB são legíveis a quem obtiver acesso; alguém pode recalcular o digest; o destino externo fica sob guarda do usuário; Android ainda requer validação física.

Em uma origem HTTP insegura, o navegador pode indisponibilizar UUID e integridade criptográfica necessários para criar registros e conferir backups. A interface informa a limitação e orienta abrir por `localhost`, HTTPS ou APK Android; não reduz validações, não migra dados entre origens e não limpa IndexedDB. IndexedDB é isolado por origem: a ausência de livros em outro endereço não significa perda dos dados existentes.

## 12. CI e E2E

O workflow usa somente actions oficiais de checkout/setup Node, `permissions: contents: read`, `npm ci` e lockfile. Não recebe secrets, não assina Android e não publica artefatos. Fixtures E2E são fictícias; o reset usa CDP somente contra a origem local controlada do preview e não adiciona endpoint ao build. Resultados e traces ficam ignorados pelo Git. A execução hospedada depende de push posterior.

## 13. Fronteiras de P1-A

Cada variante persistida passa por schema Zod estrito; localizações de anotação são discriminadas e devem corresponder ao tipo do registro. A migração v3 → v4 é aditiva, não eleva revisão nem timestamps e foi exercitada com reabertura. Eventos e atividades genéricos não contêm título, direção, disciplina, modalidade, organização, descrição ou próxima ação. Nenhuma dependência, plugin ou permissão foi adicionada.

### Auditoria npm em 2026-08-11

`npm audit` reportou quatro ocorrências high, sem critical: `brace-expansion@5.0.8` via ESLint/minimatch, `nanoid@3.3.16` via Vite/PostCSS e React Router `7.18.1`. As duas primeiras pertencem ao toolchain com entradas controladas; o caso do nanoid exige custom generator de tamanho zero, não usado pelo produto. O advisory do Router afeta actions em RSC mode; esta aplicação é SPA estática, sem RSC, servidor ou actions remotas. Não houve upgrade fora de escopo apenas para zerar o contador. Reavaliar versões patch antes de G11 e imediatamente se algum desses caminhos passar a receber entrada não confiável.
