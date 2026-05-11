export function createMagnifier(img, options = {}) {
  const {
    zoom = 1.5,
    borderColor = "#fff",
  } = options

  if (!img || !img.parentElement) {
    return () => {}
  }

  const glass = document.createElement("div")
  glass.className = "img-magnifier-glass"
  glass.style.setProperty("--magnifier-border-color", borderColor)

  img.parentElement.insertBefore(glass, img)

  glass.style.backgroundImage = `url('${img.src}')`
  glass.style.backgroundRepeat = "no-repeat"
  glass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`

  const borderWidth = 3
  const glassHalfWidth = glass.offsetWidth / 2
  const glassHalfHeight = glass.offsetHeight / 2

  function getCursorPos(event) {
    const rect = img.getBoundingClientRect()

    const x = event.pageX - rect.left - window.pageXOffset
    const y = event.pageY - rect.top - window.pageYOffset

    return { x, y }
  }

  function move(event) {
    event.preventDefault()

    let { x, y } = getCursorPos(event)

    if (x > img.width - glassHalfWidth / zoom) {
      x = img.width - glassHalfWidth / zoom
    }

    if (x < glassHalfWidth / zoom) {
      x = glassHalfWidth / zoom
    }

    if (y > img.height - glassHalfHeight / zoom) {
      y = img.height - glassHalfHeight / zoom
    }

    if (y < glassHalfHeight / zoom) {
      y = glassHalfHeight / zoom
    }

    glass.style.left = x - glassHalfWidth + "px"
    glass.style.top = y - glassHalfHeight + "px"

    glass.style.backgroundPosition = `-${x * zoom - glassHalfWidth + borderWidth}px -${
      y * zoom - glassHalfHeight + borderWidth
    }px`
  }

  const touchOptions = { passive: false }

  glass.addEventListener("mousemove", move)
  img.addEventListener("mousemove", move)
  glass.addEventListener("touchmove", move, touchOptions)
  img.addEventListener("touchmove", move, touchOptions)

  return function cleanupMagnifier() {
    glass.removeEventListener("mousemove", move)
    img.removeEventListener("mousemove", move)
    glass.removeEventListener("touchmove", move)
    img.removeEventListener("touchmove", move)
    glass.remove()
  }
}
