export const setupEffectsController = (onUpdate) => {
  const toggleButton = document.getElementById('disable-effects-button')
  const body = document.body

  const update = () => {
    updateBodyClass()
    onUpdate(getEffectsEnabled())
  }

  const getEffectsEnabled = () => localStorage.getItem('ui.effects') !== 'false'
  const toggleEffectsEnabled = () => {
    const to = !getEffectsEnabled()
    console.log(to)
    localStorage.setItem('ui.effects', JSON.stringify(to))
    update()
  }

  const updateBodyClass = () => {
    const effectClass = 'effects-enabled'
    if (getEffectsEnabled()) {
      body.classList.add(effectClass)
    } else {
      body.classList.remove(effectClass)
    }
  }

  toggleButton.addEventListener('click', toggleEffectsEnabled)

  update()
}