# Plano de refinamento pós-protótipo

> Início da fase: 2026-08-13
> Estado: R1 tecnicamente concluído; R2 é o próximo trabalho
> Base: primeira rodada integrada de uso físico realizada por Sam no Moto G06

## 1. Função e limites

Este é o documento operacional das rodadas posteriores à implementação técnica dos Prompts 1–19. `EXECUTION_PLAN.md` permanece como registro histórico do plano original de construção; nenhuma tarefa abaixo deve ser apresentada como parte retroativa daqueles prompts, nem numerada automaticamente como “Prompt 20”.

Esta fase corrige atritos observados no protótipo funcional e prepara uma revisão extensa de apresentação. Cada implementação futura deve preservar dependências para dentro, dados persistidos como fonte de verdade, transações e eventos pós-commit, TypeScript estrito, acessibilidade e limites de privacidade. Conta, backend, sincronização, CMS, outros tipos de mídia e múltiplas salas continuam fora do escopo.

O registro desta observação é evidência parcial: não aprova automaticamente G4, G7, G8, G9 ou G10. G11 não foi iniciado.

## 2. Primeira rodada integrada no Moto G06

Em 2026-08-13, Sam realizou uma rodada integrada de uso real no Moto G06.

### Comportamentos confirmados

- cadastro, modificação e exclusão de livros funcionaram;
- criação de notas e de citações funcionou;
- a estante reagiu à coleção;
- efeito sonoro e música ambiente funcionaram;
- volume e mute funcionaram;
- o backup foi exportado para o local escolhido;
- a desinstalação removeu os dados locais como esperado;
- a reinstalação iniciou sem os dados anteriores;
- a importação/restauração funcionou e os dados foram restaurados corretamente;
- a primeira conclusão de livro disparou o efeito sonoro;
- o primeiro marco de conclusão foi registrado;
- a luminária de leitura apareceu após o primeiro livro concluído.

### Achados transversais

- **Movimento reduzido:** a política técnica atual deixa os personagens completamente estáticos. No aparelho, isso transmitiu sensação de cena congelada. É uma questão de UX para a rodada visual; não autoriza mudança imediata da preferência.
- **Layout e densidade:** há informação simultânea, cartões, caixas, bordas e textos em excesso; a hierarquia é fraca, a Biblioteca visual ocupa área secundária, e a tela inicial é dominada pela alternativa textual e controles. A aparência permanece estrutural/provisória e sem identidade suficiente. A resposta será redesign amplo, não ajustes cosméticos isolados.
- **Estante:** a projeção atual usa dois grupos visuais para 1–4 livros, cinco para 5–14 e compressão acima disso. Foi pouco intuitiva para coleções pequenas. O refinamento deve inicialmente preferir correspondência 1:1 para os primeiros livros; coleções maiores podem continuar comprimidas por desempenho.
- **Notas e citações:** criar funciona, mas a utilidade fica limitada sem editar, excluir e compartilhar cada tipo.
- **Áudio:** foi percebido pequeno atraso no efeito sonoro ao navegar de outra aba para `Biblioteca`. Tratar como defeito funcional a investigar, sem alterar previamente a arquitetura.

## 3. Regras aprovadas para implementação futura

### 3.1 Progresso dirige início e conclusão

Ao atualizar um livro planejado para `currentPage > 0`, a implementação futura deve mudá-lo para `in_progress`. Se ainda não houver data de início, deve registrá-la conforme a política temporal do domínio, sem exigir a ação separada “Iniciar leitura”.

Quando `totalPages` for conhecido e `currentPage == totalPages`, o livro deve mudar automaticamente para `completed` e reutilizar exatamente a cadeia existente:

```text
progresso
→ domínio
→ persistência
→ evento de conclusão
→ milestone
→ áudio
→ diálogo
→ projeção
→ feedback React
```

Não deve existir uma segunda implementação de conclusão; o marco permanece idempotente. Sem `totalPages`, progresso pode iniciar a leitura, porcentagem não é calculada e conclusão automática não ocorre. Nenhum total será inventado. Regras de `paused` e `abandoned` não serão ampliadas sem nova decisão.

### 3.2 Primeira apresentação do progresso

No detalhe de livro com total conhecido, mostrar porcentagem concluída, páginas lidas, total, páginas restantes e barra horizontal. Não usar gráfico de rosquinha nesta etapa.

```text
38% concluído

████████░░░░░░░░░░░░

50 de 132 páginas
82 páginas restantes
```

Porcentagem e páginas restantes são derivadas, não persistidas. A apresentação deve tratar zero e 100%, nunca ultrapassar 100%, funcionar em alto contraste, não depender apenas de cor, possuir texto equivalente e respeitar escala de texto. Para total desconhecido, mostrar a página atual e informar que o total não foi definido, sem porcentagem enganosa. A solução inicial deve permanecer simples por anteceder o redesign.

### 3.3 Restauração e backup de segurança

Em banco vazio:

```text
selecionar backup
→ validar
→ confirmar
→ restaurar
```

Não exigir backup de segurança quando não houver dados atuais. Em banco preenchido, oferecer explicitamente `Criar backup antes de restaurar`, `Continuar sem criar backup` e `Cancelar`. Continuar sem backup exige aviso claro de que os dados atuais serão substituídos. A decisão permanece com o usuário e proteções contra restauração acidental permanecem obrigatórias.

### 3.4 Áudio modular e playlist

A evolução deve permitir:

```text
arquivo de áudio no repositório
→ entrada no manifesto
→ ID na playlist
→ AudioService reproduz sequência
```

O fluxo deve aceitar arquivo compatível com a política técnica, inclusive MP3 quando suportado, registrar a fonte no manifesto, ordenar IDs em playlist e substituir/remover faixas sem modificar React, Phaser ou regras centrais. A primeira versão será uma playlist sequencial declarativa, configurável pelo código, sem editor no aplicativo, streaming ou biblioteca remota. Efeitos sonoros também devem continuar simples de substituir.

## 4. Rodada R1 — Coerência funcional

**Objetivo:** corrigir atritos do uso real antes do redesign.

1. início automático pela atualização do progresso;
2. conclusão automática ao atingir o total, reutilizando a cadeia atual;
3. barra horizontal, porcentagem e páginas restantes;
4. representação mais direta da estante para pequenas coleções;
5. backup de segurança opcional na restauração conforme estado do banco;
6. investigação e correção do delay sonoro ao entrar na Biblioteca.

R1 deve preservar arquitetura em camadas, dados existentes, milestones, backup e acessibilidade. Mudança de schema só poderá ocorrer com migração e teste; nenhuma é presumida por este plano.

Em 2026-08-13, os itens 1–4 foram concluídos tecnicamente como R1-A. Em 2026-08-16, R1-B concluiu os itens 5–6: a aplicação deriva o estado vazio das seis coleções substituídas, sem contar metadata técnica; a interface oferece os três caminhos explícitos quando há dados. A investigação sonora provou que a intenção de rota já precedia e independia do Phaser, mas o backend repetia busca e decodificação do WAV em cada entrada. A música local agora é preparada após unlock e o buffer é reutilizado no lifecycle do backend. A percepção no Moto G06 e a restauração física específica continuam pendentes; nenhum gate foi aprovado.

## 5. Rodada R2 — Utilidade de conteúdo e áudio

1. editar, excluir e compartilhar nota;
2. editar, excluir e compartilhar citação;
3. playlist musical declarativa;
4. suporte simples a várias músicas no manifesto;
5. ordem configurável pelo código;
6. substituição simples de efeitos sonoros.

Excluir anotação exigirá confirmação e consistência transacional conforme a arquitetura. Compartilhamento será explícito e não cria conta ou sincronização. Evitar editor complexo, streaming, backend, biblioteca musical remota, conta, sincronização e CMS.

## 6. Rodada R3 — UX/Layout v2 — Glow-up geral

Esta é uma revisão extensa da apresentação, não pequeno polimento. Seus objetivos são redesign completo, redução agressiva da densidade, hierarquia clara, identidade consistente e tema escuro como direção principal.

Revisar paleta, tipografia, espaçamento, superfícies/cartões, formulários, navegação inferior, Coleção, detalhe do livro, Novo livro, Arquivo, Configurações, estados vazios, mensagens e feedbacks de sucesso/erro. A Biblioteca visual deve ser protagonista.

### Biblioteca

- canvas ocupando a maior parte da tela inicial, sem grande bloco textual acima;
- informações secundárias progressivas e ações contextuais em bottom sheets ou solução equivalente;
- navegação inferior preservada;
- alternativa React acessível preservada sem dominar visualmente a interface;
- estante, bibliotecária, criatura, luminária e futuras decorações integradas e legíveis.

### Tema e acessibilidade

O tema escuro não será mera troca para fundo `#111` e texto branco. Deve formar um sistema coerente de superfícies, fundo, texto, madeira, iluminação, destaque, foco, estados e contraste. A direção inicial pode explorar madeira escura, verdes profundos, âmbar/dourado, luz aconchegante e ambiente noturno, sem fixar uma paleta final.

O redesign deve preservar e revisar alto contraste, redução de movimento, escala de texto, semântica, teclado, leitor de tela e touch targets. A política de movimento reduzido deve evitar a sensação de cena congelada sem reintroduzir desconforto ou remover informação. Acessibilidade existente não pode ser removida.

## 7. Checkpoint integrado posterior

Não se exige validação física a cada microalteração. Automação proporcional ao escopo continua obrigatória durante R1–R3. Depois das três rodadas, um novo checkpoint integrado Android deve verificar:

- regressões de CRUD;
- início e conclusão automáticos;
- barra percentual e estados sem total;
- estante;
- notas, citações e compartilhamento;
- playlist e áudio, inclusive delay;
- backup e restauração;
- milestone e luminária;
- novo layout e tema escuro;
- responsividade e acessibilidade;
- lifecycle e desempenho.

Somente depois desse checkpoint devem ser avaliados explicitamente os gates ainda abertos e a preparação para G11. Observações parciais não fecham gates.
