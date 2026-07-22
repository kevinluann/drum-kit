// === Seletores DOM ===

const keysContainer = document.querySelector('.keys')
const input = document.querySelector('#input')
const form = document.querySelector('.composer')
const playButton = document.querySelector('#playBtn')
const stopButton = document.querySelector('#stopBtn')
const volumeControl = document.querySelector('#volume')
const loopToggle = document.querySelector('#loopToggle')
const bpmControl = document.querySelector('#bpm')
const metronomeToggle = document.querySelector('#metronomeToggle')
const bpmValue = document.querySelector('#bpmValue')
const bpmDropdown = document.querySelector('.bpm-dropdown')
const timelineNotes = document.querySelector('.timeline-notes')
const timelineEmpty = document.querySelector('.timeline-empty')
const timelineTrack = document.querySelector('.timeline-track')
const statsToggle = document.querySelector('#statsToggle')
const statsPanel = document.querySelector('#statsPanel')
const totalNotesDisplay = document.querySelector('#totalNotes')
const totalTimeDisplay = document.querySelector('#totalTime')
const totalCompositionsDisplay = document.querySelector('#totalCompositions')
const resetStatsButton = document.querySelector('#resetStats')
const recordToggle = document.querySelector('#recordToggle')
const noteBpmEditor = document.querySelector('#noteBpmEditor')
const noteBpmOverlay = document.querySelector('#noteBpmOverlay')
const noteBpmInput = document.querySelector('#noteBpmInput')
const saveNoteBpmButton = document.querySelector('#saveNoteBpm')
const removeNoteBpmButton = document.querySelector('#removeNoteBpm')
const cancelNoteBpmButton = document.querySelector('#cancelNoteBpm')
const metronomeBpmInline = document.querySelector('#metronomeBpmInline')
const metronomeBpmInput = document.querySelector('#metronomeBpmInput')
const noteCountDisplay = document.querySelector('#noteCount')
const durationDisplay = document.querySelector('#durationDisplay')
const noteBpmRepeat = document.querySelector('.note-bpm-repeat')
const repeatBtns = document.querySelectorAll('.repeat-btn')
const muteNoteBtn = document.querySelector('#muteNoteBtn')
const noteVolumeInput = document.querySelector('#noteVolumeInput')
const noteVolumeValue = document.querySelector('#noteVolumeValue')
const randomButton = document.querySelector('#randomBtn')
const reversedButton = document.querySelector('#reverseBtn')
const inputWrapper = document.querySelector('.input-wrapper')
const zoomInButton = document.querySelector('#zoomIn')
const zoomOutButton = document.querySelector('#zoomOut')

// === Variáveis de estado ===

let isPlaying = false
let isLooping = false
let timers = []
let bpm = bpmControl.value
let isMetronomeEnabled = false
let metronomeTimer = null
let totalNotesPlayed = 0
let totalPlayTime = 0
let compositionsPlayed = 0
let isRecording = false
let recordedNotes = []
let notes = []
let currentNoteId = null
let metronomeBpm = 120
let draggedNoteIndex = null
let countdownStartTime = null
let countdownTotalMs = 0
let isCountDownsRunning = false
let isReversed = false
let zoom = 1

// === Funções ===

function playSound(sound) {
  try {
    const audioElement = document.querySelector(`#s_${sound}`)
    const keyElement = document.querySelector(`.key[data-key="${sound}"]`)

    if (audioElement) {
      audioElement.currentTime = 0
      audioElement.play()

      keyElement.classList.add('playing')

      setTimeout(() => {
        keyElement.classList.remove('playing')
      }, 100);
    }

    totalNotesPlayed++
    updateStatsDisplay()

    if (isRecording) {
      const validNotes = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c']
      const noteLetter = sound.replace('key', '')

      if (validNotes.includes(noteLetter)) {
        recordedNotes.push(noteLetter)
        noteCountDisplay.textContent = recordedNotes.length + ' notas'
        input.value = recordedNotes.join('')
        buildNotesFromInput()
      }
    }

  } catch (error) {
    alert('Som não encontrado.')
    console.log(error)
  }
}

function playComposition(songArray) {
  let awaitTime = 0
  let defaultInterval = 60000 / bpm
  const validNotes = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c']
  const filteredArray = songArray.filter(item => validNotes.includes(item))
  const startTime = Date.now()
  const usedIds = new Set()

  isPlaying = true
  stopButton.removeAttribute('disabled')
  stopButton.setAttribute('aria-disabled', 'false')
  playButton.setAttribute('disabled', 'true')
  playButton.setAttribute('aria-disabled', 'true')
  bpmControl.setAttribute('disabled', 'true')
  bpmControl.setAttribute('aria-disabled', 'true')
  input.setAttribute('disabled', 'true')
  input.setAttribute('aria-disabled', 'true')
  bpmValue.classList.add('disabled')
  bpmValue.setAttribute('aria-disabled', 'true')
  randomButton.classList.add('disabled')
  randomButton.setAttribute('aria-disabled', 'true')
  reversedButton.classList.add('disabled')
  reversedButton.setAttribute('aria-disabled', 'true')
  recordToggle.classList.add('disabled')
  recordToggle.setAttribute('aria-disabled', 'true')

  if (isMetronomeEnabled) {
    startMetronome()
  }

  for (let [index, songItem] of filteredArray.entries()) {
    let currentInterval = defaultInterval
    const noteData = notes.find(n => n.letter === songItem && !usedIds.has(n.id))

    if (noteData && noteData.customBpm) {
      currentInterval = 60000 / noteData.customBpm
      usedIds.add(noteData.id)
    }

    const timer = setTimeout(() => {
      if (noteData && noteData.muted) {
        highlightNote(index)
        return
      }

      const repeatCount = noteData ? noteData.repeat : 1
      const repeatInterval = noteData && noteData.customBpm ? 60000 / noteData.customBpm : 60000 / bpm
      let noteVolume

      if (noteData && noteData.volume !== null) {
        noteVolume = noteData.volume / 100
      } else {
        noteVolume = volumeControl.value / 100
      }

      for (let repeat = 0; repeat < repeatCount; repeat++) {
        setTimeout(() => {
          const audioElement = document.querySelector(`#s_key${songItem}`)

          if (audioElement) {
            audioElement.volume = noteVolume
          }

          playSound(`key${songItem}`)
        }, repeat * repeatInterval);
      }

      highlightNote(index)
    }, awaitTime);

    timers.push(timer)

    awaitTime += currentInterval
  }

  startDurationCountdown()

  const finalTimer = setTimeout(() => {
    const endTime = Date.now()

    totalPlayTime += (endTime - startTime) / 1000
    compositionsPlayed++
    updateStatsDisplay()

    updateDurationDisplay()

    isPlaying = false
    stopButton.setAttribute('disabled', 'true')
    stopButton.setAttribute('aria-disabled', 'true')
    playButton.removeAttribute('disabled')
    playButton.setAttribute('aria-disabled', 'false')
    bpmControl.removeAttribute('disabled')
    bpmControl.setAttribute('aria-disabled', 'false')
    input.removeAttribute('disabled')
    input.setAttribute('aria-disabled', 'false')
    bpmValue.classList.remove('disabled')
    bpmValue.setAttribute('aria-disabled', 'false')
    randomButton.classList.remove('disabled')
    randomButton.setAttribute('aria-disabled', 'false')
    reversedButton.classList.remove('disabled')
    reversedButton.setAttribute('aria-disabled', 'false')
    recordToggle.classList.remove('disabled')
    recordToggle.setAttribute('aria-disabled', 'false')

    clearTimelineHighlights()
    scrollToTimelineStart()

    if (isMetronomeEnabled) {
      stopMetronome()
    }

    if (isLooping) {
      playComposition(songArray)
    }
  }, awaitTime)

  timers.push(finalTimer)
}

function stopComposition() {
  clearTimelineHighlights()
  scrollToTimelineStart()

  for (let timerID of timers) {
    clearTimeout(timerID)
  }

  if (isMetronomeEnabled) {
    stopMetronome()
  }

  timers = []
  isPlaying = false

  stopDurationCountdown()
  updateDurationDisplay()

  playButton.removeAttribute('disabled')
  playButton.setAttribute('aria-disabled', 'false')
  stopButton.setAttribute('disabled', 'true')
  stopButton.setAttribute('aria-disabled', 'true')
  bpmControl.removeAttribute('disabled')
  bpmControl.setAttribute('aria-disabled', 'false')
  input.removeAttribute('disabled')
  input.setAttribute('aria-disabled', 'false')
  bpmValue.classList.remove('disabled')
  bpmValue.setAttribute('aria-disabled', 'false')
  randomButton.classList.remove('disabled')
  randomButton.setAttribute('aria-disabled', 'false')
  reversedButton.classList.remove('disabled')
  reversedButton.setAttribute('aria-disabled', 'false')
  recordToggle.classList.remove('disabled')
  recordToggle.setAttribute('aria-disabled', 'false')
}

function setVolume() {
  const volume = volumeControl.value / 100
  const audioElements = document.querySelectorAll('audio')
  const volumeValue = document.querySelector('.volume-value')

  for (let audio of audioElements) {
    audio.volume = volume
  }

  volumeValue.textContent = volumeControl.value
}

function setBpm() {
  bpm = bpmControl.value

  bpmValue.textContent = bpm

  updateDurationDisplay()

  if (isMetronomeEnabled && isPlaying) {
    stopMetronome()
    startMetronome()
  }
}

function startMetronome() {
  const metronomeAudio = document.querySelector('#s_metronome')
  let interval = 60000 / metronomeBpm

  if (metronomeTimer) {
    stopMetronome()
  }

  metronomeTimer = setInterval(() => {
    metronomeAudio.currentTime = 0
    metronomeAudio.play()
  }, interval)
}

function stopMetronome() {
  if (metronomeTimer) {
    clearInterval(metronomeTimer)
    metronomeTimer = null
  }
}

function toggleBpmDropdown() {
  const isOpen = bpmDropdown.classList.toggle('open')
  bpmValue.setAttribute('aria-expanded', isOpen)
}

function closeBpmDropdown() {
  bpmDropdown.classList.remove('open')
  bpmValue.setAttribute('aria-expanded', 'false')
}

function updateTimeline() {
  timelineNotes.innerHTML = ''

  const repeatCount = notes.filter(note => note.repeat > 1).length

  if (repeatCount > 0) {
    noteCountDisplay.textContent = notes.length + (notes.length === 1 ? ' nota' : ' notas') + ' (' + repeatCount + ' com repeat)'
  } else {
    noteCountDisplay.textContent = notes.length + (notes.length === 1 ? ' nota' : ' notas')
  }

  reversedButton.classList.toggle('disabled', notes.length <= 1)
  reversedButton.setAttribute('aria-disabled', notes.length <= 1)

  updateDurationDisplay()

  if (notes.length <= 1) {
    isReversed = false
    reversedButton.classList.remove('active')
    reversedButton.setAttribute('aria-pressed', 'false')
  }

  if (notes.length === 0) {
    timelineEmpty.setAttribute('style', 'display: flex')
    return
  }

  timelineEmpty.setAttribute('style', 'display: none')

  for (let [index, note] of notes.entries()) {
    if (note.letter === ' ') {
      const spaceElement = document.createElement('div')
      spaceElement.setAttribute('class', 'timeline-space')
      timelineNotes.appendChild(spaceElement)
    } else {
      const noteElement = document.createElement('div')
      noteElement.setAttribute('class', 'timeline-note')
      noteElement.textContent = note.letter.toUpperCase()
      noteElement.setAttribute('data-id', note.id)
      noteElement.setAttribute('data-index', index)
      noteElement.setAttribute('draggable', 'true')

      if (note.customBpm) {
        noteElement.classList.add('has-custom-bpm')
      }

      if (note.muted) {
        noteElement.classList.add('muted')
      }

      timelineNotes.appendChild(noteElement)
    }
  }
}

function highlightNote(index) {
  const notes = document.querySelectorAll('.timeline-note')

  clearTimelineHighlights()

  if (notes[index]) {
    notes[index].classList.add('active')
  }

  notes[index].scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  })
}

function clearTimelineHighlights() {
  const notes = document.querySelectorAll('.timeline-note')

  for (let note of notes) {
    note.classList.remove('active')
  }
}

function scrollToTimelineStart() {
  timelineTrack.scrollTo({
    left: 0,
    behavior: 'smooth'
  })
}

function updateStatsDisplay() {
  totalNotesDisplay.textContent = totalNotesPlayed
  totalTimeDisplay.textContent = Math.floor(totalPlayTime) + 's'
  totalCompositionsDisplay.textContent = compositionsPlayed
}

function toggleRecording() {
  isRecording = !isRecording
  recordToggle.setAttribute('aria-pressed', isRecording)

  if (isRecording) {
    recordedNotes = []

    input.setAttribute('placeholder', 'Gravando...')
    input.setAttribute('disabled', 'true')
    input.setAttribute('aria-disabled', 'true')
    playButton.setAttribute('disabled', 'true')
    playButton.setAttribute('aria-disabled', 'true')

    recordToggle.classList.add('recording')
  } else {
    input.setAttribute('placeholder', 'Faça uma composição...')
    input.removeAttribute('disabled')
    input.setAttribute('aria-disabled', 'false')
    playButton.removeAttribute('disabled')
    playButton.setAttribute('aria-disabled', 'false')

    recordToggle.classList.remove('recording')

    if (recordedNotes.length > 0) {
      input.value = recordedNotes.join('')
    }
  }

  buildNotesFromInput()
}

function openBpmEditor(noteId) {
  currentNoteId = noteId
  const note = notes.find(n => n.id === noteId)

  if (note && note.volume !== null) {
    noteVolumeInput.value = note.volume
    noteVolumeValue.textContent = note.volume
  } else {
    noteVolumeInput.value = volumeControl.value
    noteVolumeValue.textContent = volumeControl.value
  }

  if (note && note.customBpm) {
    noteBpmInput.value = note.customBpm
  } else {
    noteBpmInput.value = bpmControl.value
  }

  for (let btn of repeatBtns) {
    btn.classList.remove('active')
    btn.setAttribute('aria-pressed', 'false')

    if (note && parseInt(btn.dataset.repeat) === note.repeat) {
      btn.classList.add('active')
      btn.setAttribute('aria-pressed', 'true')
    }
  }

  if (note && note.muted) {
    muteNoteBtn.classList.add('active')
    muteNoteBtn.textContent = 'Silenciado'
    muteNoteBtn.setAttribute('aria-pressed', 'true')
  } else {
    muteNoteBtn.classList.remove('active')
    muteNoteBtn.textContent = 'Silenciar'
    muteNoteBtn.setAttribute('aria-pressed', 'false')
  }

  noteBpmEditor.setAttribute('style', 'display: block')
  noteBpmOverlay.setAttribute('style', 'display: block')
}

function saveNoteBpm() {
  let bpmValue = parseInt(noteBpmInput.value)

  if (bpmValue >= 60 && bpmValue <= 400) {
    const note = notes.find(n => n.id === currentNoteId)

    if (note) {
      note.customBpm = bpmValue
    }

    updateTimeline()
    closeBpmEditor()
  }
}

function removeNoteBpm() {
  const note = notes.find(n => n.id === currentNoteId)

  if (note) {
    note.customBpm = null
    note.repeat = 1
    note.muted = false
    note.volume = null
  }

  updateTimeline()
  closeBpmEditor()
}

function closeBpmEditor() {
  noteBpmEditor.setAttribute('style', 'display: none')
  noteBpmOverlay.setAttribute('style', 'display: none')
  currentNoteId = null
}

function buildNotesFromInput() {
  const newLetters = input.value.split('')
  const newNotes = []

  for (let i = 0; i < newLetters.length; i++) {
    if (notes[i] && notes[i].letter === newLetters[i]) {
      newNotes.push(notes[i])
    } else {
      newNotes.push({
        id: Date.now() + i,
        letter: newLetters[i],
        customBpm: null,
        repeat: 1,
        muted: false,
        volume: null
      })
    }
  }

  notes = newNotes
  updateTimeline()
}

function setMetronomeBpm() {
  metronomeBpm = metronomeBpmInput.value

  if (isMetronomeEnabled && isPlaying) {
    stopMetronome()
    startMetronome()
  }
}

function calculateDuration() {
  const validNotes = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c']
  const filteredNotes = notes.filter(note => validNotes.includes(note.letter))

  let totalMs = 0

  for (let note of filteredNotes) {
    if (note.customBpm) {
      totalMs += 60000 / note.customBpm
    } else {
      totalMs += 60000 / bpm
    }
  }

  return totalMs
}

function updateDurationDisplay() {
  const totalMs = calculateDuration()
  const seconds = (totalMs / 1000).toFixed(1)

  durationDisplay.textContent = seconds + 's'
}

function updateCountdown() {
  if (!isCountDownsRunning) return

  const elapsed = Date.now() - countdownStartTime
  const remaining = countdownTotalMs - elapsed

  if (remaining <= 0) {
    durationDisplay.textContent = '0.0s'
  } else {
    durationDisplay.textContent = (remaining / 1000).toFixed(1) + 's'
    requestAnimationFrame(updateCountdown)
  }
}

function startDurationCountdown() {
  countdownStartTime = Date.now()
  countdownTotalMs = calculateDuration()
  isCountDownsRunning = true

  updateCountdown()
}

function stopDurationCountdown() {
  isCountDownsRunning = false
}

function generateRandomComposition() {
  const letters = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c']
  const length = Math.floor(Math.random() * 16) + 5
  let result = ''

  for (let i = 0; i < length; i++) {
    result += letters[Math.floor(Math.random() * letters.length)]
  }

  input.value = result
  buildNotesFromInput()
}

function toggleReverse() {
  if (isPlaying || notes.length === 0) return

  isReversed = !isReversed
  notes.reverse()
  input.value = notes.map(note => note.letter).join('')

  updateTimeline()

  reversedButton.classList.toggle('active', isReversed)
  reversedButton.setAttribute('aria-pressed', isReversed)
}

function setZoom(value) {
  zoom = Math.max(0.8, Math.min(1.5, value))
  timelineNotes.style.setProperty('--zoom', zoom)
}

// === Event listeners ===

document.body.addEventListener('keyup', (event) => playSound(event.code.toLowerCase()))

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const song = input.value

  if (song !== '' && !isPlaying) {
    const songArray = song.split('')
    playComposition(songArray)
  }
})

keysContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('key')) {
    playSound(event.target.dataset.key)
  }
})

input.addEventListener('input', () => {
  const regex = /[^QWEASDZXC\s]/gi
  input.value = input.value.replace(regex, '').replace(/^\s+/, '').replace(/\s{3,}/g, '').toLowerCase()

  buildNotesFromInput()
})

playButton.addEventListener('click', () => {
  playButton.classList.add('clicked')
  setTimeout(() => {
    playButton.classList.remove('clicked')
  }, 100)
})

stopButton.addEventListener('click', () => {
  stopButton.classList.add('clicked')
  setTimeout(() => {
    stopButton.classList.remove('clicked')
  }, 100)

  stopComposition()
})

volumeControl.addEventListener('input', () => setVolume())

loopToggle.addEventListener('click', () => {
  isLooping = !isLooping
  loopToggle.classList.toggle('active', isLooping)
  loopToggle.setAttribute('aria-pressed', isLooping)
})

bpmControl.addEventListener('input', () => setBpm())

metronomeToggle.addEventListener('click', () => {
  isMetronomeEnabled = !isMetronomeEnabled

  metronomeToggle.classList.toggle('active', isMetronomeEnabled)
  metronomeToggle.setAttribute('aria-pressed', isMetronomeEnabled)
  metronomeBpmInline.classList.toggle('visible', isMetronomeEnabled)
  metronomeBpmInline.setAttribute('aria-hidden', !isMetronomeEnabled)

  if (isMetronomeEnabled && isPlaying) {
    startMetronome()
  } else if (!isMetronomeEnabled) {
    stopMetronome()
  }
})

bpmValue.addEventListener('click', () => toggleBpmDropdown())

bpmValue.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' || event.code === 'Space') {
    event.preventDefault()
    toggleBpmDropdown()
  }
})

bpmDropdown.addEventListener('click', (event) => {
  if (event.target.classList.contains('bpm-preset')) {
    bpmControl.value = event.target.dataset.bpm
    setBpm()
    closeBpmDropdown()
  }
})

document.addEventListener('click', (event) => {
  if (!bpmDropdown.contains(event.target) && !bpmValue.contains(event.target)) {
    closeBpmDropdown()
  }
})

timelineTrack.addEventListener('wheel', (event) => {
  if (event.deltaY !== 0) {
    event.preventDefault()
    timelineTrack.scrollLeft += event.deltaY
  }
})

statsToggle.addEventListener('click', () => {
  const isOpen = statsPanel.classList.toggle('open')
  statsToggle.classList.toggle('open', isOpen)
  statsToggle.setAttribute('aria-expanded', isOpen)
})

resetStatsButton.addEventListener('click', () => {
  totalNotesPlayed = 0
  totalPlayTime = 0
  compositionsPlayed = 0
  updateStatsDisplay()
})

recordToggle.addEventListener('click', () => {
  if (!isPlaying) {
    toggleRecording()
  }
})

timelineNotes.addEventListener('click', (event) => {
  if (event.target.classList.contains('timeline-note')) {
    let noteId = parseInt(event.target.dataset.id)
    openBpmEditor(noteId)
  }
})

saveNoteBpmButton.addEventListener('click', () => saveNoteBpm())

removeNoteBpmButton.addEventListener('click', () => removeNoteBpm())

cancelNoteBpmButton.addEventListener('click', () => closeBpmEditor())

noteBpmOverlay.addEventListener('click', () => closeBpmEditor())

noteBpmInput.addEventListener('blur', () => {
  let value = parseInt(noteBpmInput.value)

  if (isNaN(value) || value < 60) {
    noteBpmInput.value = 60
  } else if (value > 400) {
    noteBpmInput.value = 400
  }
})

metronomeBpmInput.addEventListener('blur', () => {
  let value = parseInt(metronomeBpmInput.value)

  if (isNaN(value) || value < 30) {
    metronomeBpmInput.value = 30
  } else if (value > 400) {
    metronomeBpmInput.value = 400
  }

  setMetronomeBpm()
})

timelineNotes.addEventListener('dragstart', (event) => {
  if (event.target.classList.contains('timeline-note')) {
    draggedNoteIndex = parseInt(event.target.dataset.index)
    event.target.setAttribute('style', 'opacity: 0.5;')
  }
})

timelineNotes.addEventListener('dragover', (event) => {
  event.preventDefault()
})

timelineNotes.addEventListener('drop', (event) => {
  event.preventDefault()

  if (event.target.classList.contains('timeline-note')) {
    let targetIndex = parseInt(event.target.dataset.index)

    let draggedNote = notes[draggedNoteIndex]
    notes.splice(draggedNoteIndex, 1)
    notes.splice(targetIndex, 0, draggedNote)

    updateTimeline()
  }

  draggedNoteIndex = null

  input.value = notes.map(note => note.letter).join('')
})

timelineNotes.addEventListener('dragend', (event) => {
  event.target.setAttribute('style', 'opacity: 1;')
})

noteBpmRepeat.addEventListener('click', (event) => {
  if (event.target.classList.contains('repeat-btn')) {
    const note = notes.find(n => n.id === currentNoteId)

    if (note) {
      note.repeat = parseInt(event.target.dataset.repeat)
    }

    for (let btn of repeatBtns) {
      btn.classList.remove('active')
      btn.setAttribute('aria-pressed', 'false')
    }

    event.target.classList.add('active')
    event.target.setAttribute('aria-pressed', 'true')
  }
})

muteNoteBtn.addEventListener('click', () => {
  const note = notes.find(n => n.id === currentNoteId)

  if (note) {
    note.muted = !note.muted
  }

  muteNoteBtn.classList.toggle('active')
  muteNoteBtn.textContent = note.muted ? 'Silenciado' : 'Silenciar'
  muteNoteBtn.setAttribute('aria-pressed', note.muted)
})

noteVolumeInput.addEventListener('input', () => {
  const note = notes.find(n => n.id === currentNoteId)

  noteVolumeValue.textContent = noteVolumeInput.value

  if (note) {
    note.volume = parseInt(noteVolumeInput.value)
  }
})

randomButton.addEventListener('click', () => {
  if (!isPlaying) {
    generateRandomComposition()
  }
})

reversedButton.addEventListener('click', () => toggleReverse())

input.addEventListener('focus', () => {
  inputWrapper.classList.add('expanded')
})

input.addEventListener('blur', () => {
  inputWrapper.classList.remove('expanded')
})

zoomInButton.addEventListener('click', () => setZoom(zoom + 0.1))

zoomOutButton.addEventListener('click', () => setZoom(zoom - 0.1))