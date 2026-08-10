# Direção e arquitetura de áudio

## 1. Papel do som

O áudio é parte do núcleo emocional, mas nunca é requisito funcional. Ele cria presença, marca interação e reforça a Biblioteca sem substituir texto, estado visual ou ações React.

## 2. Estado de validação

A primeira validação humana do Prompt 14 no APK foi **reprovada em 2026-08-07**: o desbloqueio foi percebido apenas sobre o canvas, o fallback musical soou como zumbido grave contínuo, os efeitos eram desagradáveis e bibliotecária/criatura não tinham resposta sonora. A arquitetura foi preservada e recebeu uma rodada corretiva. Esta rodada ainda depende de nova validação humana e não aprova o Prompt 14 nem o G7.

## 3. Arquitetura atual

O sistema usa Web Audio nativo atrás de `AudioPort`. React emite somente intenções pelo contrato da aplicação; Phaser continua emitindo `LibraryInteraction` e não conhece backend ou arquivos.

```text
gesto/lifecycle/navegação React ─┐
interações tipadas da sala ──────┼→ AudioIntent → AudioPort → AudioService → AudioBackend
LibraryEntryCompleted pós-commit ┘                            ↓
                                              manifesto + settings Dexie
```

O `AudioService` possui a música desejada e garante uma única reprodução ativa. Pause, saída da Biblioteca, mute e dispose interrompem handles; resume recria no máximo o loop desejado. Efeitos ocorridos antes da inicialização ou durante segundo plano não são acumulados.

## 4. Manifesto, IDs e arquivos reais

`src/infrastructure/audio/audioManifest.ts` é a única fonte de caminhos. Todos os arquivos atuais são WAV PCM mono, 22.050 Hz, 16-bit, gerados deterministicamente pelo projeto.

| ID | Categoria | Arquivo | Duração | Loop |
|---|---|---|---:|---|
| `music.library` | `music` | `/audio/library-ambient.wav` | 16 s | sim |
| `ambience.library-room` | `ambience` | nenhum; cue reservado e silencioso | — | sim |
| `ui.page-turn` | `ui` | `/audio/ui-page.wav` | 0,14 s | não |
| `interaction.shelf-touch` | `interaction` | `/audio/shelf-touch.wav` | 0,24 s | não |
| `interaction.librarian-touch` | `interaction` | `/audio/librarian-touch.wav` | 0,42 s | não |
| `interaction.creature-touch` | `interaction` | `/audio/creature-touch.wav` | 0,32 s | não |
| `milestone.book-completed` | `milestone` | `/audio/book-completed.wav` | 0,82 s | não |

As cinco categorias explícitas continuam `music`, `ambience`, `ui`, `interaction` e `milestone`. O cue de ambiente permanece reservado, mas não cria uma segunda camada contínua nesta rodada.

## 5. Geração e autoria

Nenhum áudio foi pesquisado, baixado ou derivado de material externo. `scripts/generate-audio-assets.mjs` usa apenas APIs padrão do Node para sintetizar amostras PCM e escrever cabeçalhos WAV:

```text
npm run audio:generate  # recria os seis arquivos
npm run audio:check     # compara os arquivos com a geração determinística
```

A música combina pads senoidais suaves em progressão `Cmaj7 → Am7 → Fmaj7 → Gsus/add`, notas melódicas espaçadas, envelopes lentos e fade nas bordas. Não há oscilador grave contínuo em runtime. Os efeitos usam ruído determinístico/envelopado ou notas consonantes curtas: papel para interface, papel/madeira para estante, chime acolhedor para bibliotecária, glissando arredondado para criatura e três notas ascendentes para conclusão.

Tamanhos atuais:

- `library-ambient.wav`: 705.644 bytes;
- `ui-page.wav`: 6.218 bytes;
- `shelf-touch.wav`: 10.628 bytes;
- `librarian-touch.wav`: 18.566 bytes;
- `creature-touch.wav`: 14.156 bytes;
- `book-completed.wav`: 36.206 bytes;
- total: 791.418 bytes.

## 6. Substituição manual

Assets são conteúdo. Para trocar um som:

1. substitua o WAV mantendo o mesmo caminho; ou
2. coloque o novo arquivo em `public/audio/` e altere somente `sources` no manifesto.

Não é necessário editar `AudioService`, `BrowserAudioBackend`, React, Phaser ou casos de uso. Um novo arquivo deve ser registrado em `ASSET_REGISTRY.md` com autoria/licença antes de permanecer no projeto.

## 7. Política de fallback

- fonte disponível e decodificável: reproduzir o WAV;
- fonte ausente, HTTP falho ou decode falho: registrar `ASSET_UNAVAILABLE` sanitizado e usar playback silencioso;
- música ausente: silêncio, nunca drone ou zumbido procedural;
- efeito ausente: silêncio, sem beep improvisado;
- backend indisponível: silêncio e aplicação plenamente utilizável.

O backend não cria mais osciladores de fallback. O playback silencioso preserva idempotência/lifecycle sem inventar timbre não validado.

## 8. Desbloqueio e autoplay

- nenhum `AudioContext` é criado na abertura;
- um listener mínimo em captura no `document` observa o primeiro `pointerdown` em React, navegação, botão ou canvas;
- um `keydown` que não seja somente modificador também pode desbloquear no desktop;
- os listeners de unlock são removidos antes da inicialização e também no cleanup;
- `AudioService.initialize()` continua idempotente;
- se a Biblioteca já estiver ativa, `LibraryEntered` deixou a música desejada registrada e ela começa assim que o backend fica pronto;
- não há autoplay forçado nem segunda inicialização.

## 9. Lifecycle e preferências

- `visibilitychange` e `App.appStateChange` pausam música e efeitos;
- retorno ao primeiro plano retoma somente uma instância da música desejada;
- não existe reprodução em segundo plano;
- `beforeunload` e `ApplicationRuntime.close()` liberam recursos;
- música e efeitos mantêm volumes independentes;
- mute interrompe todos os canais;
- `audio.preferences.v1` continua na tabela `settings` v2 existente e no backup;
- falha de persistência é anunciada sem desfazer a escolha válida da sessão.

Defaults atuais: música 35%, efeitos 60%, mute desligado.

## 10. Feedback equivalente

- conclusão mantém status, progresso, mensagem textual e projeção visual;
- estante, bibliotecária e criatura mantêm seus painéis React;
- mudança de rota mantém título, foco e indicação ativa;
- música é somente atmosfera.

Nenhuma ação ou informação depende de ouvir.

## 11. Limitações atuais

- os WAVs são provisórios e aguardam avaliação humana de timbre/conforto;
- o loop usa fade curto nas bordas, mas ainda precisa ser avaliado fisicamente quanto à emenda;
- a música reinicia do começo após pause/resume, sem preservar offset;
- WAV foi escolhido para geração simples e determinística; uma versão final comprimida poderá reduzir o APK;
- não há crossfade, playlist, áudio espacial, equalizador, música adaptativa ou reprodução em segundo plano;
- fone, alto-falante, interrupções e lifecycle físico aguardam revalidação no Moto G06.

## 12. Checklist da rodada corretiva

### Navegador

- [ ] tocar texto, botão e navegação React e confirmar unlock sem canvas;
- [ ] recarregar e tocar o canvas como primeiro gesto;
- [ ] confirmar música reconhecível, discreta e sem zumbido;
- [ ] sair/voltar e ocultar/restaurar sem música duplicada;
- [ ] ouvir interface, estante, bibliotecária, criatura e conclusão;
- [ ] remover/bloquear temporariamente o asset musical e confirmar silêncio;
- [ ] testar volumes, mute, unmute e persistência.

### Moto G06 / Android 15

- [ ] instalar o APK corretivo por cima e confirmar dados preservados;
- [ ] repetir unlock por interface React e pelo canvas;
- [ ] avaliar música e os cinco efeitos em alto-falante e fone;
- [ ] minimizar/restaurar repetidamente e confirmar silêncio no segundo plano;
- [ ] confirmar uma única música e preferências após reabrir;
- [ ] confirmar Coleção, formulários, backup e sala utilizáveis.
