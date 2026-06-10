function playSound(sound) {
  try {
    const audioElement = document.querySelector(`#s_${sound}`)
    const keyElement = document.querySelector(`.key[data-key="${sound}"]`)

    if (audioElement) {
      audioElement.currentTime = 0
      audioElement.play()
    }

    if(keyElement) {
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

document.body.addEventListener('keyup', (event) => {
  playSound(event.code.toLowerCase());
})