# Registro de decisões

Decisões não são apagadas quando substituídas. Altere o status para `substituída` e referencie a decisão nova.

## Formato

- **ID**;
- **data**;
- **status:** proposta, aceita, substituída ou rejeitada;
- **contexto**;
- **decisão**;
- **consequências**.

---

## D-001 — Aplicativo pessoal com qualidade de portfólio

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** não existe perspectiva concreta de produto comercial agora, mas a base deve permitir evolução futura.

**Decisão:** construir um aplicativo real de uso pessoal, visual e sonoro, documentado como portfólio, sem backend no protótipo.

**Consequências:** confiabilidade e UX prática têm o mesmo peso da apresentação; escala comercial não justifica complexidade antecipada.

## D-002 — Stack híbrida web-first

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** TypeScript estrito, React, Vite, Phaser 3 e Capacitor.

**Consequências:** React cuida do app; Phaser da biblioteca; uma base gera web e Android.

## D-003 — Modular monolith em um repositório e pacote

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** um repositório e um pacote no protótipo, com camadas lógicas.

**Consequências:** sem monorepo, microserviços ou pacotes internos antes de necessidade real.

## D-004 — Phaser como view especializada

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Phaser recebe projeção pronta, renderiza e emite interações tipadas. Não acessa banco nem decide marcos.

**Consequências:** coleção continua funcional sem cena; React e Phaser podem ser testados separadamente.

## D-005 — Persistência inicial com Dexie atrás de portas

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Dexie/IndexedDB no protótipo; repositórios isolam tecnologia.

**Consequências:** backup e migrações são obrigatórios; SQLite será avaliado por gatilhos verificáveis.

## D-006 — Capacitor e APK cedo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** criar APK debug no Bloco 2, antes do domínio completo.

**Consequências:** riscos de WebView, Android Studio, safe areas e ciclo de vida aparecem cedo.

## D-007 — Som como serviço desacoplado

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** React e Phaser emitem intenções; um `AudioPort` controla reprodução e preferências.

**Consequências:** sem chamadas de áudio espalhadas ou duplicadas.

## D-008 — Conteúdo orientado a dados

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** diálogos, marcos, recompensas, salas e assets usam IDs, schemas, manifests e fallback.

**Consequências:** adicionar conteúdo não exige alterar motor central.

## D-009 — Somente livros no protótipo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** a união discriminada prevê expansão, mas apenas `BookEntry` será implementado até G11.

**Consequências:** filmes, séries e estudos permanecem no backlog pós-protótipo.

## D-010 — Progresso sem punição

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** sem streak obrigatória, degradação, culpa ou perda por ausência.

**Consequências:** retorno é acolhedor; abandono é status válido; recompensas refletem ações sem coerção.

## D-011 — Backup antes do polimento final

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** exportação, restauração e migrações entram no Bloco 5, antes da sala visual completa.

**Consequências:** dados têm prioridade sobre acabamento.

## D-012 — Decisões aprovadas no Gate G0

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o encerramento do Gate G0 exigia consolidar as definições humanas que orientam o protótipo antes da fundação técnica.

**Decisão:** manter o nome provisório “Biblioteca Viva”; aprovar o primeiro ciclo emocional de `PRODUCT.md`, seus critérios de sucesso e o conjunto documental inicial; adotar uma biblioteca em visão superior, com referências gerais em Pokémon FireRed e Stardew Valley, sem copiar assets ou identidade dessas obras; usar retrato como orientação principal; adotar o Moto G06 como referência primária de testes, sem torná-lo alvo exclusivo; e incluir música ambiente discreta, som de interface, confirmação de cadastro, reação da estante e conclusão ou desbloqueio, com controles separados para música e efeitos.

**Consequências:** o Gate G0 está aprovado e o Bloco 1 pode começar pelo Prompt 1. A interface deve usar layout responsivo, respeitar safe areas e ser testada em diferentes dimensões, proporções e densidades de tela. O aplicativo deve permanecer compatível com diferentes celulares Android; o Moto G06 é um dispositivo principal de validação, não uma restrição de compatibilidade.

## D-013 — Fundação técnica mínima na raiz

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 1 precisa tornar o repositório executável sem antecipar a arquitetura ou reformatar a documentação existente.

**Decisão:** manter um único pacote npm privado na raiz, com React 19, Vite 8 e TypeScript 6 estrito; separar as configurações TypeScript de aplicação, ferramentas Node e testes; usar ESLint 10 com configuração flat, Prettier limitado a código e arquivos técnicos, e Vitest 4 com Testing Library e jsdom. Não criar alias enquanto os imports relativos permanecerem simples.

**Consequências:** a fundação pode ser executada, testada e gerada como build web; a documentação Markdown fica fora do formatador automático; camadas e aliases serão adicionados somente quando houver uso concreto. A versão `0.0.0` identifica o pacote privado ainda não lançado e não representa uma release do produto.

## D-014 — Roteamento e navegação responsiva do shell

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 2 requer cinco áreas navegáveis e uma adaptação responsiva sem duplicar sistemas de navegação nem antecipar funcionalidades.

**Decisão:** usar React Router DOM `7.18.1` em modo declarativo SPA, com uma única tabela tipada de rotas; usar o mesmo elemento `nav` como barra inferior no mobile e barra lateral a partir de 768 px; e manter design tokens e estilos do shell em CSS simples global enquanto a apresentação ainda é pequena.

**Consequências:** caminhos, títulos e links são definidos em um só lugar; a rota ativa recebe `aria-current`, contraste e sublinhado; safe areas e altura dinâmica são tratadas por CSS; e componentes ou CSS Modules só serão separados quando responsabilidades reais justificarem. O `npm audit` atual informa um advisory alto do React Router ligado ao modo RSC, não usado por este SPA; a dependência deve ser atualizada assim que existir uma versão corrigida compatível, sem habilitar RSC ou ações de servidor antes disso.

## D-015 — Testes físicos concentrados em gates decisivos

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o isolamento entre dispositivos imposto pelo roteador exige um túnel HTTPS Cloudflare para acessar pelo smartphone o servidor web de desenvolvimento. O shell já pode ser validado com dimensões móveis no modo responsivo do navegador e por teclado.

**Decisão:** concentrar testes físicos nos gates de maior valor, especialmente quando envolverem Android, persistência nativa, toque, desempenho ou release. No shell, usar “Ajustes” como rótulo compacto deliberado da seção cuja rota é `/configuracoes` e cujo título completo é “Configurações”.

**Consequências:** o Gate G1 pode ser aprovado sem teste físico pelo navegador; o Gate G2, por meio do APK Android, será a primeira validação física obrigatória. G2, G3, G6, G9 e G11 são os principais pontos de teste em smartphone.

## D-016 — Capacitor 8 e identidade Android provisória estável

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 3 exige uma versão estável compatível com Node 24, Vite, React, JDK 21 e o ambiente Android instalado, além de comportamento explícito para o botão Voltar.

**Decisão:** instalar versões estáveis exatas `@capacitor/core`, `@capacitor/cli` e `@capacitor/android` `8.4.2`, com o plugin oficial `@capacitor/app` `8.1.1`; usar configuração TypeScript, `appId` provisório estável `com.samuelfrancisco.bibliotecaviva`, `appName` “Biblioteca Viva” e `webDir` `dist`. O plugin App existe somente para o botão Voltar e o ciclo básico futuro: em rota interna usa o histórico ou retorna à Biblioteca quando não houver entrada anterior; na raiz encerra sem confirmação. Não bloquear orientação neste prompt.

**Consequências:** Node 24.18.0 atende ao requisito oficial Node 22+, Android Studio 2026.1.2 supera o mínimo 2025.2.1 e o scaffold usa JDK 21, SDK 36 e API mínima 24. O mesmo build Vite serve web e Android; `android/` e seu Gradle Wrapper são versionados, enquanto builds, APKs, propriedades locais e chaves permanecem ignorados. A orientação principal aprovada continua retrato, mas o manifesto gerado permite rotação até decisão posterior.

Use `templates/ADR_TEMPLATE.md` para novas decisões.
