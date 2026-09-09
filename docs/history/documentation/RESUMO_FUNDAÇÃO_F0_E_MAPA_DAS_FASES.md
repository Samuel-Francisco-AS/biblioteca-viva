# Resumo da sessão — FUNDAÇÃO do novo mundo

Nesta sessão, partimos do baseline pós-WORLD RESET e estruturamos a etapa **FUNDAÇÃO** do novo mundo 3D da Biblioteca Viva.

A decisão central foi: **não reconstruir o mundo ainda**. A FUNDAÇÃO existe para provar que a base técnica aguenta o mundo que queremos construir, principalmente no Moto G06, antes de começarmos sistemas espaciais permanentes.

Também ficou decidido que o novo mundo seguirá com:

- 3D real;
- apresentação ortográfica/2.5D;
- integração com o aplicativo React existente;
- Three.js como renderer primário;
- WebGL/WebGL2 como baseline inicial;
- GLTF/GLB como caminho experimental para assets;
- R3F como possibilidade futura, não como dependência inicial;
- nenhuma herança da antiga W3-A.

---

# Mapa das fases da FUNDAÇÃO

## F0 — Definição da Fundação
**Estado: CONCLUÍDA**

Foi a fase de planejamento e tomada de decisão antes de escrever código do novo mundo.

Ela foi subdividida em:

### F0-A — Requisitos e não negociáveis
**Concluída.**

Definimos o que qualquer fundação precisa respeitar:

- arquitetura atual React/application/domain;
- 3D real;
- câmera ortográfica/2.5D;
- Android/Capacitor;
- input mobile;
- lifecycle controlável;
- integração acessível com React;
- assets 3D;
- observabilidade;
- nenhuma persistência espacial prematura.

Também definimos o que não poderia ser sacrificado, como acessibilidade e o funcionamento do aplicativo convencional.

### F0-B — Protocolo de prova
**Concluída.**

Definimos como a tecnologia escolhida será testada.

A prova utiliza uma cena pequena e artificial, não uma Biblioteca real, contendo aproximadamente:

- piso;
- paredes;
- alguns móveis;
- pelo menos um GLB;
- objetos repetidos para gerar alguma densidade;
- iluminação básica;
- câmera ortográfica;
- pan, zoom, pinch e seleção;
- integração da seleção com uma superfície React acessível.

Também definimos testes de:

- mount/unmount;
- pause/resume;
- retorno após background;
- criação e destruição limpa do runtime;
- bundle;
- FPS/frame time;
- draw calls;
- triângulos;
- carregamento;
- comportamento no APK;
- Moto G06 físico.

### F0-C — Pesquisa e escolha tecnológica
**Concluída.**

Pesquisamos:

- Three.js;
- PlayCanvas;
- Babylon.js;
- React Three Fiber;
- Godot.

Também analisamos popularidade, mercado, portfólio e aplicações reais semelhantes à Biblioteca Viva.

A conclusão foi:

**Three.js será nossa linha principal.**

PlayCanvas e Babylon deixam de ser implementações paralelas. Só seriam reconsiderados se Three.js demonstrar uma limitação estrutural durante os testes.

Também ficou esclarecido que:

- **R3F não é concorrente do Three.js**; é uma camada React sobre Three;
- começaremos com Three.js direto;
- R3F poderá ser introduzido posteriormente se resolver problemas reais de integração;
- Godot não justifica uma migração completa atualmente, embora continue sendo uma alternativa arquitetural caso a solução web demonstre um limite sério no Android.

Essa decisão evita justamente o paralelismo que queremos evitar.

### F0-D — Contrato do spike
**Concluída.**

Transformamos todas as decisões anteriores em um contrato executável para o Codex.

O contrato determina:

```text
React
  ↓
World Host
  ↓
Three Runtime
  ↓
Three.js
```

com:

- Three.js direto;
- `WebGLRenderer`;
- `OrthographicCamera`;
- `GLTFLoader`;
- host React próprio;
- nenhum R3F inicialmente;
- nenhum WebGPU como requisito;
- nenhuma persistência espacial.

Também foram congelados:

- escopo da cena;
- input;
- lifecycle;
- métricas;
- gates automatizados;
- gate físico;
- requisitos de acessibilidade;
- critérios de aprovação;
- critérios de abandono;
- proibições explícitas.

O contrato produzido nesta sessão é o arquivo:

`F0-D_THREE_FOUNDATION_SPIKE_CONTRACT.md`

---

# F1 — Three.js Foundation Spike
**Estado: PRÓXIMA FASE**

Aqui finalmente começaremos a escrever código do novo mundo.

O objetivo da F1 não será construir a Biblioteca.

Será implementar o **esqueleto executável da fundação Three.js** definido na F0-D.

Ela deverá provar na prática:

```text
React
↓
World Host
↓
Three Runtime
↓
cena 3D real
↓
Android
```

com:

- viewport;
- renderer;
- câmera ortográfica;
- resize;
- lifecycle;
- câmera mobile;
- touch/pan/pinch;
- picking;
- GLB;
- ponte React ↔ mundo;
- instrumentação de desempenho;
- disposal correto.

No final da F1 teremos evidência suficiente para dizer:

> Three.js é tecnicamente viável para a Biblioteca Viva.

ou:

> existe um problema estrutural que exige reconsiderar a escolha.

---

# F2 — Integração e endurecimento da Fundação
**Estado: PLANEJADA, ainda não executada**

Na nossa estrutura inicial, essa fase corresponde ao momento em que o spike deixa de ser apenas uma experiência isolada e começa a se transformar numa fundação confiável.

O foco deverá estar em:

- limites definitivos entre React e runtime;
- lifecycle;
- erros;
- recuperação;
- resize/orientation;
- input;
- ownership de recursos GPU;
- organização interna;
- testabilidade.

A nomenclatura e subdivisão exatas ainda podem ser refinadas depois da F1, porque os problemas reais encontrados no spike devem influenciar essa etapa.

---

# F3 — Câmera e interação mobile
**Estado: PLANEJADA**

Temos esse domínio previsto dentro da Fundação:

- comportamento final da câmera ortográfica;
- pan;
- zoom;
- pinch;
- limites;
- enquadramento;
- relação entre toque e seleção;
- ergonomia em tela pequena.

Parte disso já aparece no spike, mas F3 representa o endurecimento dessa experiência para algo utilizável como fundação do produto.

---

# F4 — Contrato experimental de assets 3D
**Estado: PLANEJADA**

Depois que o runtime estiver aprovado, começamos a estabelecer como assets reais entram nele.

Ainda não é o grande pipeline artístico.

É a prova técnica de:

```text
fonte editável
↓
GLTF/GLB
↓
normalização
↓
runtime
↓
otimização
```

Aqui começaremos a aprender concretamente sobre:

- escala;
- pivôs;
- eixos;
- materiais;
- texturas;
- compressão;
- loading;
- unload;
- custo em GPU.

---

# F5 — Performance e Android físico
**Estado: PLANEJADA / gate obrigatório**

Essa é uma das fases mais importantes.

O objetivo é criar o primeiro **baseline real de desempenho do mundo**.

O Moto G06 será autoridade física.

A Fundação não será considerada plenamente aprovada apenas porque:

- compila;
- roda no desktop;
- passa Playwright;
- gera APK.

Precisamos testar no aparelho:

- FPS;
- frame time;
- estabilidade;
- carregamento;
- temperatura;
- background/resume;
- memória/comportamento após algum tempo;
- interação.

O piso provisório estabelecido para o spike é **30 FPS sustentados**, com 45–60 FPS desejáveis em uma cena simples. Esse número ainda não é um contrato permanente do produto; será recalibrado com evidência.

---

# F6 — Acessibilidade e fechamento arquitetural
**Estado: PLANEJADA**

Última fase da Fundação.

Aqui verificaremos se a arquitetura 3D consegue coexistir com o compromisso de acessibilidade da Biblioteca Viva.

A regra central será:

> O canvas 3D não pode ser a única representação semântica de uma função essencial.

Portanto o estado relevante do mundo deverá conseguir alimentar superfícies React acessíveis.

Exemplo:

```text
objeto 3D selecionado
        ↓
estado compartilhado
   ↙             ↘
highlight       React acessível
```

No fechamento dessa fase consolidaremos as decisões comprovadas pela implementação em documentação/ADR.

Só então a **FUNDAÇÃO inteira estará aprovada**.

---

# Visão geral

```text
FUNDAÇÃO

F0 — Planejamento e contrato                ✅ CONCLUÍDA
 │
 ├─ F0-A Requisitos                         ✅
 ├─ F0-B Protocolo de prova                 ✅
 ├─ F0-C Escolha tecnológica                ✅
 └─ F0-D Contrato Three.js                  ✅
 │
 ▼
F1 — Three.js Foundation Spike              ← PRÓXIMO
 │
 ▼
F2 — Runtime / integração / endurecimento
 │
 ▼
F3 — Câmera e interação mobile
 │
 ▼
F4 — Contrato experimental de assets 3D
 │
 ▼
F5 — Performance + Android físico
 │
 ▼
F6 — Acessibilidade + fechamento
 │
 ▼
FUNDAÇÃO APROVADA
```

---

# Depois da FUNDAÇÃO

Foi estabelecida apenas uma sequência geral, ainda sem planejamento formal de fases, nomes ou gates:

```text
FUNDAÇÃO
   ↓
PIPELINE 3D
   ↓
PRIMEIRO RECORTE DO MUNDO
   ↓
PERSISTÊNCIA ESPACIAL
   ↓
SISTEMAS MAIORES
```

## Pipeline 3D

Formalização do fluxo de produção, normalização, otimização e validação dos assets depois que o runtime estiver comprovado.

## Primeiro recorte do mundo

Primeira fatia que realmente começa a construir a Biblioteca, em vez de apenas provar tecnologia.

## Persistência espacial

Só será projetada quando o primeiro recorte demonstrar concretamente quais estados espaciais precisam ser salvos.

## Sistemas maiores

Etapas posteriores poderão incluir construção, decoração, personagens, comportamento, animações, progressão e, mais adiante, a camada opcional de IA.

Essas etapas ainda **não foram formalmente planejadas** e deverão ser definidas depois que a Fundação fornecer evidência suficiente sobre o comportamento real do novo mundo.

---

# Ponto de retomada

A próxima sessão pode começar com a referência:

> **F0 concluída. Próxima ação: executar F1 — Three.js Foundation Spike conforme o contrato F0-D.**
