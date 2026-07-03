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
const statsClose = document.querySelector('#statsClose')
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
let noteBpms = {}
let currentNoteIndex = null

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

  isPlaying = true
  stopButton.removeAttribute('disabled')
  playButton.setAttribute('disabled', 'true')
  bpmControl.setAttribute('disabled', 'true')
  bpmValue.classList.add('disabled')

  if (isMetronomeEnabled) {
    startMetronome()
  }

  for (let [index, songItem] of filteredArray.entries()) {
    let currentInterval = defaultInterval

    if (noteBpms[index]) {
      currentInterval = 60000 / noteBpms[index]
    }

    const timer = setTimeout(() => {
      playSound(`key${songItem}`)
      highlightNote(index)
    }, awaitTime);

    timers.push(timer)

    awaitTime += currentInterval
  }

  const finalTimer = setTimeout(() => {
    const endTime = Date.now()
    totalPlayTime += (endTime - startTime) / 1000
    compositionsPlayed++
    updateStatsDisplay()

    isPlaying = false
    stopButton.setAttribute('disabled', 'true')
    playButton.removeAttribute('disabled')
    bpmControl.removeAttribute('disabled')
    bpmValue.classList.remove('disabled')

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

  playButton.removeAttribute('disabled')
  stopButton.setAttribute('disabled', 'true')
  bpmControl.removeAttribute('disabled')
  bpmValue.classList.remove('disabled')
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

  if (isMetronomeEnabled && isPlaying) {
    stopMetronome()
    startMetronome()
  }
}

function startMetronome() {
  const metronomeAudio = document.querySelector('#s_metronome')
  let interval = 60000 / bpm

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
  bpmDropdown.classList.toggle('open')
}

function closeBpmDropdown() {
  bpmDropdown.classList.remove('open')
}

function updateTimeline(composition) {
  timelineNotes.innerHTML = ''
  
  if (!composition.trim()) {
    timelineEmpty.setAttribute('style', 'display: flex')
    return
  }
  
  timelineEmpty.setAttribute('style', 'display: none')

  const validNotes = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C']
  const notes = composition.toUpperCase().split('')

  for (let [index, note] of notes.entries()) {
    if (note === ' ') {
      const spaceElement = document.createElement('div')
      spaceElement.setAttribute('class', 'timeline-space')
      timelineNotes.appendChild(spaceElement)
    } else if (validNotes.includes(note)) {
      const noteElement = document.createElement('div')
      noteElement.setAttribute('class', 'timeline-note')
      noteElement.textContent = note
      noteElement.setAttribute('data-note', note)
      noteElement.setAttribute('data-index', index)
      
      if (noteBpms[index]) {
        noteElement.classList.add('has-custom-bpm')
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

  if (isRecording) {
    recordedNotes = []

    input.setAttribute('placeholder', 'Gravando...')
    input.setAttribute('disabled', 'true')
    playButton.setAttribute('disabled', 'true')

    recordToggle.classList.add('recording')
    input.value = ''
  } else {
    input.setAttribute('placeholder', 'Faça uma composição...')
    input.removeAttribute('disabled')
    playButton.removeAttribute('disabled')

    recordToggle.classList.remove('recording')

    if (recordedNotes.length > 0) {
      input.value = recordedNotes.join('')
      updateTimeline(input.value)
    } else {
      input.value = ''
      updateTimeline('')
    }
  }
}

function openBpmEditor(noteIndex) {
  currentNoteIndex = noteIndex

  if (noteBpms[noteIndex]) {
    noteBpmInput.value = noteBpms[noteIndex]
  } else {
    noteBpmInput.value = bpmControl.value
  }

  noteBpmEditor.setAttribute('style', 'display: block')
  noteBpmOverlay.setAttribute('style', 'display: block')
}

function saveNoteBpm() {
  let bpmValue = parseInt(noteBpmInput.value)
  
  if (bpmValue >= 60 && bpmValue <= 400) {
    let allNotes = document.querySelectorAll('.timeline-note')

    noteBpms[currentNoteIndex] = bpmValue

    allNotes[currentNoteIndex].classList.add('has-custom-bpm') 

    closeBpmEditor()
  }
}

function removeNoteBpm() {
  let allNotes = document.querySelectorAll('.timeline-note')

  delete noteBpms[currentNoteIndex]

  allNotes[currentNoteIndex].classList.remove('has-custom-bpm')

  closeBpmEditor()
}

function closeBpmEditor() {
  noteBpmEditor.setAttribute('style', 'display: none')
  noteBpmOverlay.setAttribute('style', 'display: none')
  currentNoteIndex = null
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

input.addEventListener('input', (event) => {
  const regex = /[^QWEASDZXC\s]/gi
  input.value = input.value.replace(regex, '').replace(/^\s+/, '').replace(/\s{3,}/g, '').toLowerCase()
  
  updateTimeline(event.target.value)
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
})

bpmControl.addEventListener('input', () => setBpm())

metronomeToggle.addEventListener('click', () => {
  isMetronomeEnabled = !isMetronomeEnabled
  metronomeToggle.classList.toggle('active', isMetronomeEnabled)

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
  statsPanel.classList.toggle('open')
  statsToggle.classList.toggle('open')
})

resetStatsButton.addEventListener('click', () => {
  totalNotesPlayed = 0
  totalPlayTime = 0
  compositionsPlayed = 0
  updateStatsDisplay()
})

recordToggle.addEventListener('click', () => toggleRecording())

timelineNotes.addEventListener('click', (event) => {
  if (event.target.classList.contains('timeline-note')) {
    let index = parseInt(event.target.dataset.index)
    openBpmEditor(index)
  }
})

saveNoteBpmButton.addEventListener('click', () => saveNoteBpm())

removeNoteBpmButton.addEventListener('click', () => removeNoteBpm())

cancelNoteBpmButton.addEventListener('click', () => closeBpmEditor())

noteBpmOverlay.addEventListener('click', () => closeBpmEditor())