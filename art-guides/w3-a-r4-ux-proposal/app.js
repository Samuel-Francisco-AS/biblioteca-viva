/* global document, history, HTMLElement, location, requestAnimationFrame, URLSearchParams, window */

const app = document.querySelector("#proposal-app");
const header = document.querySelector("#proposal-header");
const main = document.querySelector("#proposal-main");
const overlayRoot = document.querySelector("#overlay-root");
const sessionRibbon = document.querySelector("#session-ribbon");
const toastRegion = document.querySelector("#toast-region");
const screenSelect = document.querySelector("#review-screen");
const contrastButton = document.querySelector("#review-contrast");
const textButton = document.querySelector("#review-text");

const params = new URLSearchParams(location.search);
const knownScreens = new Set(
  [...screenSelect.options].map(({ value }) => value),
);
const initialScreen = knownScreens.has(params.get("screen"))
  ? params.get("screen")
  : "library";

const state = {
  editorType: params.get("variant") === "book" ? "book" : null,
  highContrast: false,
  overlay: null,
  screen: initialScreen,
  textLarger: false,
};

if (params.get("clean") === "1") document.body.classList.add("clean-capture");

const entries = [
  {
    mark: "M",
    meta: "Livro · 86 de 240 páginas",
    status: "Em andamento",
    title: "A Casa das Marés",
  },
  {
    mark: "J",
    meta: "Filme · Lia Avelar, 2024",
    status: "Planejado",
    title: "Jardim de Vidro",
  },
  {
    mark: "O",
    meta: "Série · 4 de 10 episódios",
    status: "Em andamento",
    title: "Órbita Norte",
  },
  {
    mark: "B",
    meta: "Estudo · 6 sessões",
    status: "Em andamento",
    title: "Botânica Urbana",
  },
  {
    mark: "C",
    meta: "Atividade física · caminhada",
    status: "Em andamento",
    title: "Caminhada da Lagoa",
  },
  {
    mark: "A",
    meta: "Trabalho · pesquisa",
    status: "Planejado",
    title: "Atlas de Pesquisa",
  },
];

const navigationScreens = {
  archive: "archive",
  collection: "collection",
  library: "library",
  settings: "settings",
  statistics: "statistics",
};

function headerMarkup(title, options = {}) {
  const action = options.action
    ? `<button class="header-action" type="button" data-action="${options.action.id}">${options.action.label}</button>`
    : "";
  const back = options.back
    ? `<button class="header-back" type="button" data-screen="${options.back}" aria-label="Voltar">←</button>`
    : "";
  if (options.brandOnly) {
    return `${back}<div class="header-title header-title--brand"><h1>Biblioteca Viva</h1></div>${action}`;
  }
  return `${back}<div class="header-title"><p>Biblioteca Viva</p><h1>${title}</h1></div>${action}`;
}

function worldMarkup({
  floor = false,
  placing = false,
  selected = false,
} = {}) {
  return `<div class="world" aria-hidden="true">
    <div class="room">
      <span class="shelf-shape"></span>
      <span class="table-shape"></span>
      <span class="lamp-shape"></span>
      ${selected ? `<span class="selected-piece${placing ? " placement-preview" : ""}"></span>` : ""}
      ${floor ? '<span class="floor-grid"></span>' : ""}
    </div>
  </div>`;
}

function libraryMarkup() {
  return `<section class="library-screen" aria-labelledby="library-screen-title">
    <h2 id="library-screen-title" class="visually-hidden">Biblioteca visual</h2>
    ${worldMarkup()}
    <p class="world-label">Biblioteca principal · fim de tarde</p>
    <div class="library-quick-actions">
      <button class="button" type="button" data-action="library-summary">Resumo</button>
      <button class="button button--primary" type="button" data-action="construction">Construir</button>
    </div>
  </section>`;
}

function libraryStateMarkup(kind) {
  if (kind === "loading") {
    return `<section class="status-state" aria-labelledby="loading-title" role="status">
      <span class="status-state__mark" aria-hidden="true">⌛</span>
      <h2 id="loading-title">Preparando sua Biblioteca</h2>
      <p>Carregando o espaço e os registros deste dispositivo.</p>
      <div class="skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>`;
  }
  if (kind === "canvas") {
    return `<section class="status-state" aria-labelledby="canvas-title" role="status">
      <span class="status-state__mark" aria-hidden="true">▦</span>
      <p class="eyebrow">Alternativa completa</p>
      <h2 id="canvas-title">A Biblioteca visual não está disponível</h2>
      <p>Seus dados continuam seguros e todas as ações essenciais permanecem acessíveis.</p>
      <dl class="metric-story"><strong>6 registros</strong><span>2 em andamento · 1 sessão hoje</span></dl>
      <button class="button button--primary" type="button" data-screen="collection">Abrir Coleção</button>
      <button class="button button--quiet" type="button" data-screen="library">Tentar o mapa novamente</button>
    </section>`;
  }
  return `<section class="status-state" aria-labelledby="error-title" role="alert">
    <span class="status-state__mark" aria-hidden="true">!</span>
    <p class="eyebrow">Falha recuperável</p>
    <h2 id="error-title">Não foi possível abrir a Biblioteca agora</h2>
    <p>O restante do aplicativo continua disponível. Nenhum dado foi apagado.</p>
    <button class="button button--primary" type="button" data-screen="library">Tentar novamente</button>
    <button class="button button--quiet" type="button" data-screen="collection">Ir para Coleção</button>
  </section>`;
}

function collectionMarkup(empty = false) {
  if (empty) {
    return `<section class="empty-state" aria-labelledby="empty-title">
      <span class="empty-state__mark" aria-hidden="true">＋</span>
      <p class="eyebrow">Coleção vazia</p>
      <h2 id="empty-title">Comece por algo que importa agora</h2>
      <p class="muted">Leitura, filme, série, estudo, prática ou trabalho: todas as funções continuam disponíveis.</p>
      <button class="button button--primary" type="button" data-action="new-entry">Criar primeiro registro</button>
    </section>`;
  }
  return `<section aria-labelledby="collection-title">
    <div class="page-intro">
      <p class="eyebrow">Sua memória</p>
      <h2 id="collection-title">Coleção</h2>
      <p>6 registros · 2 em andamento</p>
    </div>
    <div class="content-column">
      <label class="search-field"><span aria-hidden="true">⌕</span><span class="visually-hidden">Buscar na Coleção</span><input type="search" placeholder="Título, autor ou tema" /></label>
      <div class="chip-row" aria-label="Filtros rápidos">
        <button class="chip" type="button" aria-pressed="true">Todos</button>
        <button class="chip" type="button" aria-pressed="false">Em andamento</button>
        <button class="chip" type="button" aria-pressed="false">Favoritos</button>
        <button class="chip" type="button" data-action="filters">Filtros · 0</button>
      </div>
    </div>
    <ul class="entry-list">
      ${entries
        .map(
          ({ mark, meta, status, title }, index) => `<li>
          <button class="entry-row" type="button" data-screen="${index === 0 ? "detail" : "detail"}" aria-label="Abrir ${title}">
            <span class="entry-mark" aria-hidden="true">${mark}</span>
            <span class="entry-copy"><strong>${title}</strong><span>${meta}</span></span>
            <span class="entry-status">${status}</span>
          </button>
        </li>`,
        )
        .join("")}
    </ul>
    <button class="fab-extended" type="button" data-action="new-entry">＋ Novo registro</button>
  </section>`;
}

function typePickerMarkup() {
  const types = [
    ["book", "Livro", "Páginas, notas e citações"],
    ["movie", "Filme", "Direção, ano e duração"],
    ["series", "Série", "Episódios e plataforma"],
    ["study", "Estudo", "Área, objetivo e progresso"],
    ["physical", "Atividade física", "Prática e duração"],
    ["work", "Trabalho", "Projeto e próxima ação"],
  ];
  return `<section aria-labelledby="type-title">
    <div class="page-intro"><p class="eyebrow">Novo registro</p><h2 id="type-title">O que você quer guardar?</h2><p>Escolha um tipo. Você poderá mudar antes de salvar.</p></div>
    <ul class="type-grid">${types
      .map(
        ([id, title, description]) =>
          `<li><button class="type-option" type="button" data-entry-type="${id}"><strong>${title}</strong><span>${description}</span></button></li>`,
      )
      .join("")}</ul>
  </section>`;
}

function editorMarkup() {
  if (!state.editorType) return typePickerMarkup();
  return `<section aria-labelledby="editor-title">
    <div class="page-intro">
      <p class="eyebrow">Livro</p>
      <h2 id="editor-title">Novo registro</h2>
      <button class="button button--quiet" type="button" data-action="change-type">Trocar tipo</button>
    </div>
    <form class="form-stack" data-form="entry">
      <section class="form-section" aria-labelledby="essential-fields">
        <div class="section-heading"><h3 id="essential-fields">Essencial</h3><span class="muted">1 de 2</span></div>
        <div class="field"><label for="proposal-title">Título</label><input id="proposal-title" value="A Casa das Marés" required /></div>
        <div class="field"><label for="proposal-author">Autor <span class="muted">· opcional</span></label><input id="proposal-author" value="Lia Fontes" /></div>
        <div class="field"><label for="proposal-status">Status</label><select id="proposal-status"><option>Planejado</option><option selected>Em andamento</option><option>Concluído</option></select></div>
      </section>
      <details class="form-section" open>
        <summary>Progresso e detalhes opcionais</summary>
        <div class="form-stack">
          <div class="field"><label for="proposal-pages">Total de páginas</label><input id="proposal-pages" inputmode="numeric" type="number" value="240" /></div>
          <div class="field"><label for="proposal-current">Página atual</label><input id="proposal-current" inputmode="numeric" type="number" value="86" /></div>
          <div class="field"><label for="proposal-rating">Avaliação</label><select id="proposal-rating"><option>Sem avaliação</option><option>4 de 5</option></select></div>
        </div>
      </details>
      <div class="sticky-actions"><button class="button" type="button" data-screen="collection">Cancelar</button><button class="button button--primary" type="submit">Salvar registro</button></div>
    </form>
  </section>`;
}

function detailMarkup() {
  return `<article aria-labelledby="detail-title">
    <section class="detail-hero">
      <p class="status-line">Em andamento</p>
      <h2 id="detail-title">A Casa das Marés</h2>
      <p class="muted">Lia Fontes · Livro</p>
      <div class="progress-rail" aria-label="36% concluído"><span></span></div>
      <p><strong>86 de 240 páginas</strong> · 36%</p>
    </section>
    <section class="section-block" aria-labelledby="continue-title">
      <div class="section-heading"><h3 id="continue-title">Continuar</h3><span class="muted">Hoje</span></div>
      <div class="quick-actions">
        <button class="button button--primary" type="button" data-screen="session">Iniciar sessão</button>
        <button class="button" type="button" data-action="note">Adicionar nota</button>
        <button class="button" type="button" data-action="quote">Guardar citação</button>
      </div>
    </section>
    <section class="section-block" aria-labelledby="recent-memory">
      <div class="section-heading"><h3 id="recent-memory">Memórias recentes</h3><button class="text-action" type="button" data-screen="archive">Ver todas</button></div>
      <div class="annotation-row"><p class="eyebrow">Nota · hoje</p><p>A cartografia muda quando a narradora aceita não controlar a maré.</p></div>
      <div class="annotation-row"><p class="eyebrow">Citação · pág. 72</p><blockquote>“Toda casa guarda uma maré que ninguém vê.”</blockquote></div>
    </section>
    <details class="form-section"><summary>Mais informações e organização</summary><p class="muted">Datas, avaliação, etiquetas e histórico de alterações.</p></details>
    <section class="section-block"><button class="button button--danger-outline" type="button" data-action="delete-entry">Excluir registro</button></section>
  </article>`;
}

function sessionMarkup() {
  return `<section aria-labelledby="session-title">
    <div class="page-intro"><p class="eyebrow">A Casa das Marés</p><h2 id="session-title">Sessão em andamento</h2><p>Uma ação por vez, com os controles sempre ao alcance.</p></div>
    <section class="metric-story" aria-label="Duração da sessão"><strong>24:18</strong><span>Iniciada às 18:42 · página 86</span></section>
    <section class="section-block">
      <div class="field"><label for="session-note">Anotação rápida <span class="muted">· opcional</span></label><textarea id="session-note" placeholder="O que vale lembrar desta sessão?"></textarea></div>
    </section>
    <div class="sticky-actions"><button class="button" type="button" data-action="pause-session">Pausar</button><button class="button button--primary" type="button" data-action="finish-session">Concluir</button></div>
  </section>`;
}

function archiveMarkup() {
  return `<section aria-labelledby="archive-title">
    <div class="page-intro"><p class="eyebrow">Notas e citações</p><h2 id="archive-title">Arquivo</h2><p>2 memórias em 1 registro</p></div>
    <div class="content-column">
      <label class="search-field"><span aria-hidden="true">⌕</span><span class="visually-hidden">Buscar no Arquivo</span><input type="search" placeholder="Palavra, obra ou autor" /></label>
      <div class="chip-row" aria-label="Tipo de anotação"><button class="chip" aria-pressed="true" type="button">Tudo</button><button class="chip" aria-pressed="false" type="button">Notas</button><button class="chip" aria-pressed="false" type="button">Citações</button><button class="chip" type="button" data-action="filters">Filtros</button></div>
    </div>
    <div class="annotation-stream">
      <article class="annotation-row"><p class="eyebrow">Nota · A Casa das Marés</p><p>A cartografia muda quando a narradora aceita não controlar a maré.</p><p class="muted">Hoje, 19:07</p><button class="text-action" type="button" data-screen="detail">Abrir registro</button></article>
      <article class="annotation-row"><p class="eyebrow">Citação · A Casa das Marés</p><blockquote>“Toda casa guarda uma maré que ninguém vê.”</blockquote><p class="muted">Página 72 · hoje</p><button class="text-action" type="button" data-screen="detail">Abrir registro</button></article>
    </div>
  </section>`;
}

function statisticsMarkup() {
  const heights = [28, 45, 18, 72, 52, 88, 64];
  return `<section aria-labelledby="statistics-title">
    <div class="page-intro"><p class="eyebrow">Ritmo sem cobrança</p><h2 id="statistics-title">Estatísticas</h2><p>Últimos 30 dias · todos os registros</p></div>
    <div class="chip-row" aria-label="Período"><button class="chip" aria-pressed="true" type="button">30 dias</button><button class="chip" type="button">90 dias</button><button class="chip" type="button">Tudo</button><button class="chip" type="button" data-action="filters">Filtrar</button></div>
    <div class="statistics-layout">
      <section class="metric-story" aria-labelledby="rhythm-title"><p class="eyebrow">Tempo dedicado</p><strong>3h 40min</strong><p id="rhythm-title">Você registrou 6 sessões em 4 dias, principalmente à noite.</p><div class="rhythm-bars" aria-hidden="true">${heights.map((height) => `<span style="height:${height}%"></span>`).join("")}</div><div class="rhythm-labels" aria-hidden="true"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div></section>
      <section class="section-block"><div class="section-heading"><h3>Memória do período</h3></div><p><strong>86 páginas</strong><br><span class="muted">registradas em leitura</span></p><p><strong>2 registros</strong><br><span class="muted">avançaram de status</span></p><p><strong>2 anotações</strong><br><span class="muted">preservadas no Arquivo</span></p></section>
    </div>
    <section class="section-block"><div class="section-heading"><h3>Atividade recente</h3><button class="text-action" type="button">Ver histórico</button></div><div class="annotation-row"><p class="eyebrow">Hoje · 19:18</p><p>Sessão de 35 min em <strong>A Casa das Marés</strong></p></div><div class="annotation-row"><p class="eyebrow">Ontem</p><p>Progresso atualizado em <strong>Botânica Urbana</strong></p></div></section>
  </section>`;
}

function settingsMarkup() {
  return `<section aria-labelledby="settings-title">
    <div class="page-intro"><p class="eyebrow">Seu aplicativo</p><h2 id="settings-title">Ajustes</h2><p>Preferências organizadas pelo que afetam.</p></div>
    <ul class="settings-list">
      <li><button class="settings-row" type="button" data-action="experience"><span class="settings-icon" aria-hidden="true">Aa</span><span class="settings-copy"><strong>Experiência</strong><span>Movimento, contraste e tamanho do texto</span></span><span aria-hidden="true">›</span></button></li>
      <li><button class="settings-row" type="button" data-action="audio"><span class="settings-icon" aria-hidden="true">♫</span><span class="settings-copy"><strong>Áudio</strong><span>Música 45% · efeitos 70%</span></span><span aria-hidden="true">›</span></button></li>
      <li><button class="settings-row" type="button" data-screen="backup"><span class="settings-icon" aria-hidden="true">⇄</span><span class="settings-copy"><strong>Backup e restauração</strong><span>Crie uma cópia recuperável dos dados</span></span><span aria-hidden="true">›</span></button></li>
      <li><button class="settings-row" type="button" data-action="storage"><span class="settings-icon" aria-hidden="true">●</span><span class="settings-copy"><strong>Dados neste dispositivo</strong><span>Armazenamento local ativo</span></span><span aria-hidden="true">›</span></button></li>
      <li><button class="settings-row" type="button"><span class="settings-icon" aria-hidden="true">i</span><span class="settings-copy"><strong>Sobre</strong><span>Versão 0.2.0-alpha.1</span></span><span aria-hidden="true">›</span></button></li>
    </ul>
  </section>`;
}

function backupMarkup() {
  return `<section aria-labelledby="backup-title">
    <div class="page-intro"><p class="eyebrow">Dados locais</p><h2 id="backup-title">Backup e restauração</h2><p>As operações permanecem explícitas e separadas.</p></div>
    <section class="backup-option"><h3>Salvar uma cópia</h3><p class="muted">Inclui 6 registros, 2 anotações, 6 sessões e suas preferências.</p><button class="button button--primary" type="button" data-action="backup-export">Exportar backup</button></section>
    <section class="backup-option"><h3>Restaurar de um arquivo</h3><p class="muted">O arquivo é validado antes de qualquer alteração.</p><label class="field"><span>Arquivo de backup</span><input type="file" accept="application/json" /></label><button class="button" type="button" data-action="restore-preview">Revisar arquivo selecionado</button></section>
    <aside class="restore-warning"><strong>Nada é substituído sem revisão.</strong><p>Se houver dados atuais, você escolherá criar uma cópia de segurança, continuar sem cópia ou cancelar.</p></aside>
  </section>`;
}

function constructionActions(screen) {
  if (screen === "construction-explore") {
    return `<div class="construction-actions" role="toolbar" aria-label="Ferramentas de construção"><button type="button" data-screen="construction-palette"><span class="tool-icon" aria-hidden="true">▥</span><span>Estruturas</span></button><button type="button" data-screen="construction-floor"><span class="tool-icon" aria-hidden="true">▦</span><span>Piso</span></button><button type="button" data-action="placed-pieces"><span class="tool-icon" aria-hidden="true">◎</span><span>Colocadas</span></button></div>`;
  }
  if (screen === "construction-select") {
    return `<p class="construction-hint" role="status">Parede longa selecionada</p><div class="construction-actions construction-actions--four" role="toolbar" aria-label="Ações da peça"><button type="button" data-screen="construction-moving"><span class="tool-icon" aria-hidden="true">✥</span><span>Mover</span></button><button type="button" data-action="rotate"><span class="tool-icon" aria-hidden="true">↻</span><span>Girar</span></button><button type="button" data-screen="construction-confirm"><span class="tool-icon" aria-hidden="true">⇧</span><span>Guardar</span></button><button type="button" data-screen="construction-explore"><span class="tool-icon" aria-hidden="true">×</span><span>Fechar</span></button></div>`;
  }
  if (screen === "construction-moving") {
    return `<p class="construction-hint" role="status">Arraste a peça. A posição só será salva ao confirmar.</p><div class="construction-actions" role="toolbar" aria-label="Mover peça"><button type="button" data-screen="construction-select"><span class="tool-icon" aria-hidden="true">×</span><span>Cancelar</span></button><button type="button" aria-pressed="true"><span class="tool-icon" aria-hidden="true">✥</span><span>Movendo</span></button><button class="primary-tool" type="button" data-action="confirm-move"><span class="tool-icon" aria-hidden="true">✓</span><span>Confirmar</span></button></div>`;
  }
  if (screen === "construction-floor") {
    return `<p class="construction-hint" role="status">Toque nas células do mapa. 24 pisos disponíveis.</p><div class="construction-actions" role="toolbar" aria-label="Editar piso"><button type="button" aria-pressed="true"><span class="tool-icon" aria-hidden="true">＋</span><span>Adicionar</span></button><button type="button"><span class="tool-icon" aria-hidden="true">−</span><span>Remover</span></button><button class="primary-tool" type="button" data-screen="construction-explore"><span class="tool-icon" aria-hidden="true">✓</span><span>Concluir</span></button></div>`;
  }
  if (screen === "construction-placing") {
    return `<p class="construction-hint" role="status">Parede longa · toque no mapa para posicionar</p><div class="construction-actions" role="toolbar" aria-label="Colocar peça"><button type="button" data-screen="construction-palette"><span class="tool-icon" aria-hidden="true">×</span><span>Cancelar</span></button><button type="button" data-action="rotate"><span class="tool-icon" aria-hidden="true">↻</span><span>Girar</span></button><button class="primary-tool" type="button" data-action="place-piece"><span class="tool-icon" aria-hidden="true">✓</span><span>Colocar</span></button></div>`;
  }
  return "";
}

function constructionMarkup(screen) {
  const selected = [
    "construction-select",
    "construction-moving",
    "construction-placing",
  ].includes(screen);
  const placing = ["construction-moving", "construction-placing"].includes(
    screen,
  );
  const floor = screen === "construction-floor";
  return `<section class="construction-screen" aria-labelledby="construction-title">
    ${worldMarkup({ floor, placing, selected })}
    <header class="construction-header"><div><h1 id="construction-title">Construção</h1><p>${constructionStateLabel(screen)}</p></div><button class="button" type="button" data-action="exit-construction">Sair</button></header>
    ${constructionActions(screen)}
  </section>`;
}

function constructionStateLabel(screen) {
  return {
    "construction-confirm": "Confirmar · etapa exclusiva",
    "construction-explore": "Explorar o mapa",
    "construction-floor": "Editar piso",
    "construction-moving": "Mover peça",
    "construction-palette": "Escolher estrutura",
    "construction-placing": "Posicionar estrutura",
    "construction-select": "Peça selecionada",
  }[screen];
}

function paletteOverlay() {
  return `<div class="bottom-sheet-layer" data-backdrop="close-overlay"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="palette-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><div><p class="eyebrow">12 disponíveis</p><h2 id="palette-title">Estruturas</h2></div><button class="sheet-close" type="button" data-screen="construction-explore" aria-label="Fechar palette">×</button></div><div class="chip-row"><button class="chip" aria-pressed="true" type="button">Paredes</button><button class="chip" type="button">Cantos</button><button class="chip" type="button">Portas</button></div><div class="palette-grid"><button class="palette-piece" type="button" data-screen="construction-placing"><span class="piece-preview"></span><span><strong>Parede longa</strong><small>4 células · 3 disponíveis</small></span></button><button class="palette-piece" type="button" data-screen="construction-placing"><span class="piece-preview" style="width:52%"></span><span><strong>Parede média</strong><small>2 células · 4 disponíveis</small></span></button><button class="palette-piece" type="button" data-screen="construction-placing"><span class="piece-preview" style="width:28%"></span><span><strong>Parede curta</strong><small>1 célula · 5 disponíveis</small></span></button><button class="palette-piece" type="button" data-screen="construction-placing"><span class="piece-preview" style="transform:rotate(90deg);width:42%"></span><span><strong>Parede vertical</strong><small>2 células · 2 disponíveis</small></span></button></div></section></div>`;
}

function confirmOverlay() {
  return `<div class="dialog-layer"><section class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="store-title" aria-describedby="store-description"><p class="eyebrow">Ação reversível pelo inventário</p><h2 id="store-title">Guardar esta parede?</h2><p id="store-description">Ela sairá do mapa e voltará para as peças disponíveis.</p><div class="dialog-actions"><button class="button" type="button" data-screen="construction-select">Cancelar</button><button class="button button--danger" type="button" data-action="store-piece">Guardar</button></div></section></div>`;
}

function summaryOverlay() {
  return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="summary-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><div><p class="eyebrow">Sua Biblioteca</p><h2 id="summary-title">Resumo</h2></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar resumo">×</button></div><p>6 registros · 2 em andamento · 1 sessão hoje.</p><div class="annotation-row"><p class="eyebrow">Mais recente</p><p><strong>A Casa das Marés</strong><br><span class="muted">86 de 240 páginas</span></p></div><button class="button button--primary" type="button" data-screen="collection">Abrir Coleção</button></section></div>`;
}

function filtersOverlay() {
  return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="filters-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2 id="filters-title">Filtros e ordenação</h2><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar filtros">×</button></div><div class="form-stack"><div class="field"><label for="filter-type">Tipo</label><select id="filter-type"><option>Todos os tipos</option><option>Livros</option><option>Estudos</option></select></div><div class="field"><label for="filter-status">Status</label><select id="filter-status"><option>Todos os status</option><option>Em andamento</option></select></div><label class="choice-row">Somente favoritos <input type="checkbox" /></label><div class="field"><label for="filter-sort">Ordenar por</label><select id="filter-sort"><option>Atualização recente</option><option>Título</option></select></div><button class="button button--primary" type="button" data-action="close-overlay">Aplicar filtros</button></div></section></div>`;
}

function noteOverlay(kind = "note") {
  const quote = kind === "quote";
  return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="annotation-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2 id="annotation-title">${quote ? "Guardar citação" : "Adicionar nota"}</h2><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar">×</button></div><div class="field"><label for="annotation-text">${quote ? "Citação" : "Nota"}</label><textarea id="annotation-text" autofocus></textarea></div>${quote ? '<div class="field"><label for="annotation-page">Página · opcional</label><input id="annotation-page" type="number" inputmode="numeric" /></div>' : ""}<button class="button button--primary" type="button" data-action="save-annotation">Salvar ${quote ? "citação" : "nota"}</button></section></div>`;
}

function experienceOverlay(kind) {
  if (kind === "audio") {
    return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="audio-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2 id="audio-title">Áudio</h2><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar">×</button></div><div class="form-stack"><div class="field"><label for="music-volume">Música · 45%</label><input id="music-volume" type="range" value="45" /></div><div class="field"><label for="effects-volume">Efeitos · 70%</label><input id="effects-volume" type="range" value="70" /></div><label class="choice-row">Silenciar tudo <input type="checkbox" /></label></div></section></div>`;
  }
  return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="experience-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2 id="experience-title">Experiência</h2><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar">×</button></div><div class="form-stack"><label class="choice-row">Reduzir movimento <input type="checkbox" /></label><label class="choice-row">Alto contraste <input type="checkbox" data-action="toggle-contrast" /></label><div class="field"><label for="text-size">Tamanho do texto</label><select id="text-size"><option>Padrão</option><option>Grande</option><option>Maior</option></select></div></div></section></div>`;
}

function restoreOverlay() {
  return `<div class="dialog-layer"><section class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="restore-title" aria-describedby="restore-description"><p class="eyebrow">Arquivo validado</p><h2 id="restore-title">Revisar restauração</h2><p id="restore-description">6 registros, 2 anotações, 6 sessões e preferências substituirão os dados atuais.</p><div class="form-stack"><button class="button button--primary" type="button" data-action="backup-first">Criar backup e restaurar</button><button class="button button--danger-outline" type="button" data-action="restore-without">Continuar sem backup</button><button class="button" type="button" data-action="close-overlay">Cancelar</button></div></section></div>`;
}

function deleteOverlay() {
  return `<div class="dialog-layer"><section class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><p class="eyebrow">Ação permanente</p><h2 id="delete-title">Excluir “A Casa das Marés”?</h2><p id="delete-description">Notas, citações e histórico relacionados também serão removidos.</p><div class="dialog-actions"><button class="button" type="button" data-action="close-overlay">Cancelar</button><button class="button button--danger" type="button" data-action="confirm-delete">Excluir</button></div></section></div>`;
}

function placedPiecesOverlay() {
  return `<div class="bottom-sheet-layer"><section class="bottom-sheet" role="dialog" aria-modal="false" aria-labelledby="pieces-title"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><div><p class="eyebrow">8 no mapa</p><h2 id="pieces-title">Peças colocadas</h2></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="Fechar">×</button></div><ul class="entry-list"><li><button class="entry-row" type="button" data-screen="construction-select"><span class="entry-mark" aria-hidden="true">━</span><span class="entry-copy"><strong>Parede longa</strong><span>Norte · 4 células</span></span><span aria-hidden="true">›</span></button></li><li><button class="entry-row" type="button" data-screen="construction-select"><span class="entry-mark" aria-hidden="true">⌜</span><span class="entry-copy"><strong>Canto de pedra</strong><span>Noroeste</span></span><span aria-hidden="true">›</span></button></li></ul></section></div>`;
}

function renderOverlay() {
  if (state.screen === "construction-palette") {
    overlayRoot.innerHTML = paletteOverlay();
    return;
  }
  if (state.screen === "construction-confirm") {
    overlayRoot.innerHTML = confirmOverlay();
    return;
  }
  const overlays = {
    audio: () => experienceOverlay("audio"),
    delete: deleteOverlay,
    experience: () => experienceOverlay("experience"),
    filters: filtersOverlay,
    note: () => noteOverlay("note"),
    pieces: placedPiecesOverlay,
    quote: () => noteOverlay("quote"),
    restore: restoreOverlay,
    summary: summaryOverlay,
  };
  overlayRoot.innerHTML =
    state.overlay && overlays[state.overlay] ? overlays[state.overlay]() : "";
}

function screenBase(screen) {
  if (screen.startsWith("library")) return "library";
  if (screen.startsWith("construction")) return "library";
  return screen;
}

function render() {
  const construction = state.screen.startsWith("construction");
  const immersive = construction || state.screen === "library";
  app.dataset.highContrast = String(state.highContrast);
  app.dataset.textSize = state.textLarger ? "larger" : "default";
  app.classList.toggle("construction-mode", construction);
  header.hidden = construction;
  header.className = `app-header${immersive && !construction ? " app-header--immersive" : ""}`;
  main.className = immersive ? "immersive-main" : "";
  sessionRibbon.innerHTML =
    state.screen === "session"
      ? '<div class="session-ribbon"><p><strong>24:18</strong> · A Casa das Marés</p><button type="button" data-action="finish-session">Concluir</button></div>'
      : "";

  if (!construction) {
    const headers = {
      archive: ["Arquivo", { brandOnly: true }],
      backup: ["Backup", { back: "settings" }],
      collection: ["Coleção", { brandOnly: true }],
      "collection-empty": ["Coleção", { brandOnly: true }],
      detail: [
        "Detalhe",
        { action: { id: "edit-entry", label: "Editar" }, back: "collection" },
      ],
      editor: ["Novo registro", { back: "collection", brandOnly: true }],
      library: ["Biblioteca"],
      "library-canvas": ["Biblioteca"],
      "library-error": ["Biblioteca"],
      "library-loading": ["Biblioteca"],
      session: ["Sessão", { back: "detail" }],
      settings: ["Ajustes", { brandOnly: true }],
      statistics: ["Estatísticas", { brandOnly: true }],
    };
    const [title, options] = headers[state.screen] ?? ["Biblioteca"];
    header.innerHTML = headerMarkup(title, options);
  }

  if (construction) main.innerHTML = constructionMarkup(state.screen);
  else {
    const screens = {
      archive: archiveMarkup,
      backup: backupMarkup,
      collection: () => collectionMarkup(false),
      "collection-empty": () => collectionMarkup(true),
      detail: detailMarkup,
      editor: editorMarkup,
      library: libraryMarkup,
      "library-canvas": () => libraryStateMarkup("canvas"),
      "library-error": () => libraryStateMarkup("error"),
      "library-loading": () => libraryStateMarkup("loading"),
      session: sessionMarkup,
      settings: settingsMarkup,
      statistics: statisticsMarkup,
    };
    main.innerHTML = (screens[state.screen] ?? libraryMarkup)();
  }

  document.querySelectorAll(".bottom-nav [data-nav]").forEach((button) => {
    const active = button.dataset.nav === screenBase(state.screen);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  screenSelect.value = state.screen;
  contrastButton.setAttribute("aria-pressed", String(state.highContrast));
  textButton.setAttribute("aria-pressed", String(state.textLarger));
  renderOverlay();
}

function setScreen(next, { push = true } = {}) {
  if (!knownScreens.has(next)) return;
  state.overlay = null;
  state.screen = next;
  const nextParams = new URLSearchParams(location.search);
  nextParams.set("screen", next);
  if (state.editorType) nextParams.set("variant", state.editorType);
  else nextParams.delete("variant");
  if (push)
    history.pushState({ screen: next }, "", `?${nextParams.toString()}`);
  render();
  requestAnimationFrame(() => main.focus({ preventScroll: true }));
}

function openOverlay(name) {
  state.overlay = name;
  renderOverlay();
  requestAnimationFrame(() =>
    overlayRoot.querySelector("button, input, textarea")?.focus(),
  );
}

function closeOverlay() {
  state.overlay = null;
  renderOverlay();
}

function showToast(message) {
  toastRegion.innerHTML = `<p class="toast">${message}</p>`;
  window.setTimeout(() => {
    toastRegion.innerHTML = "";
  }, 2400);
}

function backWithinConstruction() {
  const previous = {
    "construction-confirm": "construction-select",
    "construction-floor": "construction-explore",
    "construction-moving": "construction-select",
    "construction-palette": "construction-explore",
    "construction-placing": "construction-palette",
    "construction-select": "construction-explore",
  }[state.screen];
  setScreen(previous ?? "library");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-screen]");
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.nav) setScreen(navigationScreens[target.dataset.nav]);
  if (target.dataset.screen) setScreen(target.dataset.screen);
  if (target.dataset.entryType) {
    state.editorType = target.dataset.entryType;
    setScreen("editor");
  }
  const action = target.dataset.action;
  if (!action) return;
  if (action === "new-entry") {
    state.editorType = null;
    setScreen("editor");
  } else if (action === "change-type") {
    state.editorType = null;
    render();
  } else if (action === "edit-entry") {
    state.editorType = "book";
    setScreen("editor");
  } else if (action === "construction") setScreen("construction-explore");
  else if (action === "exit-construction") setScreen("library");
  else if (action === "library-summary") openOverlay("summary");
  else if (action === "filters") openOverlay("filters");
  else if (action === "note") openOverlay("note");
  else if (action === "quote") openOverlay("quote");
  else if (action === "audio") openOverlay("audio");
  else if (action === "experience") openOverlay("experience");
  else if (action === "placed-pieces") openOverlay("pieces");
  else if (action === "restore-preview") openOverlay("restore");
  else if (action === "close-overlay") closeOverlay();
  else if (action === "toggle-contrast") {
    state.highContrast = !state.highContrast;
    render();
  } else if (action === "save-annotation") {
    closeOverlay();
    showToast("Anotação salva.");
  } else if (
    ["backup-export", "backup-first", "restore-without"].includes(action)
  ) {
    closeOverlay();
    showToast(
      action === "backup-export"
        ? "Backup preparado para salvar."
        : "Restauração concluída com dados fictícios.",
    );
  } else if (["confirm-move", "place-piece", "store-piece"].includes(action)) {
    setScreen("construction-explore");
    showToast(
      action === "store-piece"
        ? "Peça guardada no inventário."
        : "Alteração confirmada.",
    );
  } else if (action === "finish-session") {
    setScreen("detail");
    showToast("Sessão concluída e registrada.");
  } else if (action === "pause-session") showToast("Sessão pausada.");
  else if (action === "delete-entry") openOverlay("delete");
  else if (action === "confirm-delete") {
    closeOverlay();
    setScreen("collection");
    showToast("Registro excluído.");
  } else if (action === "rotate") showToast("Orientação alterada no preview.");
  else if (action === "storage")
    showToast("Armazenamento local ativo neste dispositivo.");
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  setScreen("detail");
  showToast("Registro salvo.");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (state.overlay) closeOverlay();
  else if (state.screen.startsWith("construction")) backWithinConstruction();
  else if (["detail", "editor"].includes(state.screen)) setScreen("collection");
  else if (state.screen === "backup") setScreen("settings");
});

screenSelect.addEventListener("change", () => {
  if (screenSelect.value === "editor") state.editorType = null;
  setScreen(screenSelect.value);
});

contrastButton.addEventListener("click", () => {
  state.highContrast = !state.highContrast;
  render();
});

textButton.addEventListener("click", () => {
  state.textLarger = !state.textLarger;
  render();
});

window.addEventListener("popstate", () => {
  const next = new URLSearchParams(location.search).get("screen");
  if (knownScreens.has(next)) state.screen = next;
  render();
});

render();
