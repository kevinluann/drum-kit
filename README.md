# Drum Kit

Drum kit para criação e reprodução de batidas, permitindo tocar pads, compor sequências, agendar notas no tempo, gravar a composição automaticamente e editar nota por nota.

---

## Funcionalidades

### Pads (9 sons)
| Tecla | Som     | Arquivo |
|:-----:|:--------|:--------|
| `Q`   | Kick    | `sounds/keyq.wav` |
| `W`   | Snare   | `sounds/keyw.wav` |
| `E`   | Hat     | `sounds/keye.wav` |
| `A`   | Clap    | `sounds/keya.wav` |
| `S`   | Tom     | `sounds/keys.wav` |
| `D`   | Perc    | `sounds/keyd.wav` |
| `Z`   | Rim     | `sounds/keyz.wav` |
| `X`   | Cymbal  | `sounds/keyx.wav` |
| `C`   | FX      | `sounds/keyc.wav` |

- Toca pelo **teclado** ou **clicando**.
- O pad afunda e brilha em âmbar quando aperta.

### Controles Laterais
- **VOLUME** - slider vertical + display.
- **BPM** - slider vertical + display (60-400 BPM), com presets clicáveis.
- **LOOP** - botão que repete a composição em ciclo.
- **METRÔNOMO** - botão que ativa o metrônomo. Possui BPM próprio, embutido abaixo.

### Compositor (Sequencer)
- Digite uma sequência (ex.: `qweasd`) no campo **PATTERN**.
- O visor mostra as notas em tempo real.
- Botão **▶ Tocar / ⏹ Parar**.
- **Gerar aleatório** - compõe uma batida de 5 a 20 notas.
- **Inverter** - espelha a sequência.
- **Zoom** + e - no visor.

### Editor de nota (clique em qualquer nota da timeline)
- **BPM próprio** por nota (sobrepõe o global).
- **Repetir** 1× / 2× / 3× / 4× - cada nota pode tocar múltiplas vezes.
- **Silenciar** - a nota continua lá mas não toca.
- **Volume individual** por nota.
- **Arrastar e soltar** para reordenar notas na timeline.

### Gravação e Estatísticas
- **Gravar** (botão lateral direito) - captura os pads que você toca em tempo real.
- **Estatísticas** (botão lateral esquerdo) - total de notas tocadas, tempo de reprodução acumulado, quantas composições foram executadas, com botão pra resetar.

---

## Como usar

1. **Tocar uma batida ao vivo** - aperte Q, W, E, A, S, D, Z, X, C. Cada pad responde na hora.
2. **Montar uma sequência** - digite no campo **PATTERN** algo como `q q w q e q s`. As notas aparecem como mini-pads no visor.
3. **Adicionar ressaltos** - clique numa nota da timeline e marque `2×`, `3×` ou `4×`. O visor mostra `"N notas (M com repeat)"`.
4. **Mudar o BPM de uma nota só** - no mesmo editor, dá um BPM customizado pra ela. Ela toca num andamento diferente do resto.
5. **Bloquear uma nota indesejada** - clique nela e use **Silenciar**. Ela fica riscada mas permanece na sequência.
6. **Reordenar** - arraste as notas na timeline para reorganizar o padrão.
7. **Inverter** - clique no ícone de inverter para espelhar toda a sequência.
8. **Composição aleatória** - use o ícone de **setas** para gerar uma sequência aleatória de 5 a 20 notas.
9. **Tocar em loop** - ative o botão **LOOP** e a composição repete pra sempre.
10. **Gravar sequência** - ligue o botão **Rec** do lado direito e vá tocando os pads. O input vai se preenchendo sozinho.
11. **Ver métricas** - o painel lateral esquerdo mostra total de notas tocadas, tempo acumulado e quantas composições você executou. Botão **Resetar** zera tudo.

---

## Tecnologias

- **HTML5**
- **CSS3**
- **JavaScript**

---

## Estrutura

```
drum-kit/
├── index.html              # Estrutura do Drum Kit
├── scripts.js              # Toda a lógica (play, gravação, timeline, etc.)
├── sounds/
│   ├── keyq.wav ... keyc.wav
│   └── metronome.wav
└── styles/
    ├── index.css          # Apenas @imports na ordem
    ├── reset.css          # Reset + scrollbar
    ├── global.css         # Paleta, fontes, variáveis
    ├── layout.css         # Header, footer
    ├── keys.css           # Pads
    ├── sliders.css        # Sliders verticais de Volume e BPM
    ├── toggles.css        # Botões (Loop / Metrônomo)
    ├── composer.css       # Visor do sequenciador + controles
    ├── panels.css         # Stats / Rec (gavetas laterais)
    └── modal.css          # Editor de nota individual
```

---

## O que pratiquei neste projeto

Projeto de estudos. Cada parte virou oportunidade de praticar algo:

### HTML
- Estrutura com `header`, `main`, `aside`, `footer` e `form`.
- Atributos ARIA (`aria-label`, `aria-pressed`, `aria-expanded`, `aria-controls`, `role`).
- Vários `<audio>` ligados aos pads via `id`.

### CSS
- **Variáveis CSS** no `:root`.
- **CSS Nesting**.
- **`radial-gradient`** e **`conic-gradient`** pra profundidade dos pads.
- **`box-shadow`** em camadas.
- **`@keyframes`** (`padHit`, `ledPulse`, `brandPulse`).
- **Responsividade**.

### JavaScript
- Seletores DOM centralizados no topo.
- Estado em variáveis (`isPlaying`, `isLooping`, `isRecording`, `notes`, `timers`).
- **`setTimeout`** para tocar cada nota da composição no tempo correto. Variável `timers` pra limpar tudo no **Stop**.
- **`setInterval`** para o metrônomo, com stop/start quando o BPM ou estado muda.
- **`requestAnimationFrame`** para a contagem regressiva no visor. Assim é atualizado em tempo real.
- **Drag-and-drop** (`dragstart` / `dragover` / `drop`) para reordenar notas na timeline.
- **`Date.now()`** pra cronometrar o tempo tocado.
- Regex (`/[^QWEASDZXC\s]/gi`) para filtrar caracteres inválidos no input do padrão.
- Cada nota guarda `customBpm`, `repeat`, `muted` e `volume` individual.

---

## Como funciona

Ideias centrais do compositor:

- **BPM em ms** - a fórmula `60000 / bpm` converte batidas por minuto em milissegundos entre notas. 120 BPM = 500ms. Cada nota agenda um `setTimeout` relativo ao `awaitTime` acumulado, então não descompassa nem se o evento anterior atrasar.
- **Pads repetíveis** - o `<audio>` precisa recomeçar do zero a cada batida, por isso `currentTime = 0` **antes** de `play()`. Sem isso, há um delay se o som ainda estiver tocando. Isso permite "rattattar" o mesmo pad sem esperar o som terminar.
- **`repeat` por nota** - o loop de repeat agenda `setTimeout` em sequência dentro do mesmo passo. A nota dispara N vezes no mesmo intervalo (não cria N passos extras).
- **`customBpm`** - quando uma nota tem BPM próprio, o intervalo dela substitui o global **só naquele passo**. O resto da composição segue no BPM principal.
- **Estados sincronizados** - durante o play, botões/inputs são desativados via `disabled` e a classe `.disabled` ajuda no visual. Ao terminar, tudo é restaurado.
- **Countdown** - o visor mostra quanto falta pra acabar, atualizado com `requestAnimationFrame` em vez de `setInterval`.
- **Loop infinito** - ao terminar, se `isLooping` for true, chama `playComposition(songArray)` de novo.

---

## Funções de `scripts.js`

Cada função com o que faz:

| Função | O que faz |
|:-------|:----------|
| `playSound(sound)` | Dispara o `<audio>` da nota, aciona a animação `.playing` no pad e registra em estatísticas/gravação. |
| `playComposition(songArray)` | Agenda cada nota com `setTimeout`, lendo `customBpm`/`repeat`/`muted`/`volume` por nota. Inicia countdown e usa loop. |
| `stopComposition()` | Limpa todos os timers, encerra metrônomo e countdown, restaura estados dos botões/inputs. |
| `setVolume()` | Aplica `volume` global em todos os `<audio>` e atualiza o display. |
| `setBpm()` | Atualiza o BPM global, recalcula duração e reinicia o metrônomo se necessário. |
| `startMetronome()` / `stopMetronome()` | Liga/desliga o `setInterval` que toca `s_metronome` no BPM do metrônomo. |
| `toggleBpmDropdown()` / `closeBpmDropdown()` | Abre/fecha a lista de presets de BPM. |
| `buildNotesFromInput()` | Lê o string do input, monta a variável `notes` com `{ id, letter, customBpm, repeat, muted, volume }` e reconstrói a timeline. |
| `updateTimeline()` | Atualiza as notas da timeline como `.timeline-note` / `.timeline-space`. |
| `highlightNote(index)` | Marca a nota tocando (`.active`). |
| `clearTimelineHighlights()` | Remove `.active` de todas as notas. |
| `scrollToTimelineStart()` | Volta a timeline pro início. |
| `updateStatsDisplay()` | Atualiza total de notas, tempo e composições no painel lateral. |
| `toggleRecording()` | Liga/desliga a gravação, capturando os pads tocados para o input. |
| `openBpmEditor(noteId)` / `closeBpmEditor()` | Abre/fecha o editor de nota. |
| `saveNoteBpm()` / `removeNoteBpm()` | Salva/remove o BPM, repeat, mute e volume da nota. |
| `calculateDuration()` | Soma os intervalos de todas as notas pra saber a duração total da composição. |
| `updateDurationDisplay()` | Atualiza o visor de duração em segundos. |
| `updateCountdown()` / `startDurationCountdown()` / `stopDurationCountdown()` | Contagem regressiva no visor, usando `requestAnimationFrame`. |
| `generateRandomComposition()` | Monta uma string aleatória de 5 a 20 notas e coloca no input. |
| `toggleReverse()` | Espelha a ordem das notas e atualiza a timeline. |
| `setZoom(value)` | Define `--zoom` da timeline (entre 0.8 e 1.5). |

Ler por essa ordem dá um tour desde o disparo de um pad só até o play da composição.

---

## Glossário rápido

Termos de drum kit / áudio que usei no projeto:

| Termo | O que é |
|:------|:--------|
| **BPM** | Beats Per Minute - batidas por minuto. Define a velocidade da composição. |
| **Pad** | Cada botão da grade 3x3 que dispara um som. |
| **Voz** | Som individual (kick, snare, hat...). Aqui são 9. |
| **Pattern** | Uma sequência de notas, tipo `qweasd`. Também chamo de "composição". |
| **Passo** | Uma nota (ou silêncio) no pattern - uma divisão do tempo. |
| **Repeat** | Quando a mesma nota dispara mais de uma vez dentro de um passo. |
| **Mute** | A nota existe no pattern mas não toca - fica riscada no visor. |
| **Loop** | Toca em ciclo: acabou, começa de novo. |
| **Timeline** | O visor horizontal do compositor que mostra o pattern como faixa de notas. |
| **Compositor** | A seção que aceita uma string e toca com controle de BPM, loop, aleatório, inverter e zoom. |
| **Metrônomo** | Tick regular, com BPM próprio, independente do play. |

---

Transformando estudo em prática - [Kevin Luan](https://github.com/kevinluann)
