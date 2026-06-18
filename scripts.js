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

// === Variáveis de estado ===

let isPlaying = false
let isLooping = false
let timers = []
let bpm = bpmControl.value
let isMetronomeEnabled = false
let metronomeTimer = null

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

  } catch (error) {
    alert('Som não encontrado.')
    console.log(error)
  }
}

function playComposition(songArray) {
  let awaitTime = 0
  let interval = 60000 / bpm

  isPlaying = true
  stopButton.removeAttribute('disabled')
  playButton.setAttribute('disabled', 'true')
  bpmControl.setAttribute('disabled', 'true')
  bpmValue.classList.add('disabled')

  if (isMetronomeEnabled) {
    startMetronome()
  }
  
  for (let songItem of songArray) {
    const timer = setTimeout(() => {
      playSound(`key${songItem}`)
    }, awaitTime);
    
    timers.push(timer)
    
    awaitTime += interval
  }

  const finalTimer = setTimeout(() => {
    isPlaying = false
    stopButton.setAttribute('disabled', 'true')
    playButton.removeAttribute('disabled')
    bpmControl.removeAttribute('disabled')
    bpmValue.classList.remove('disabled')

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