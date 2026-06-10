const playButton = document.querySelector('#playBtn')
const keysContainer = document.querySelector('.keys')

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
  
  for (let songItem of songArray) {
    setTimeout(() => {
      playSound(`key${songItem}`)
    }, awaitTime);
    
    awaitTime += 250
  }
}

document.body.addEventListener('keyup', (event) => {
  playSound(event.code.toLowerCase());
})

playButton.addEventListener('click', () => {
  const song = document.querySelector('#input').value

  if (song !== '') {
    const songArray = song.split('')
    playComposition(songArray)
  }
})

keysContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('key')) {
    playSound(event.target.dataset.key)
  }
})