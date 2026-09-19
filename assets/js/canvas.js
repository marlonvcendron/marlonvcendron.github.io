import { randomUInt, getConsistentRand } from './random'
import { noise } from './perlin'

noise.seed(2666)

const N_BANDS = 10
const MAX_BAND_SIZE = 40

const getWidthAndHeight = () => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]

let [width, height] = getWidthAndHeight()

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

const clearContext = () => ctx.clearRect(0, 0, canvas.width, canvas.height)

const toggleButton = document.getElementById('disable-effects-button')

const CMAP = ['c', 'm', 'y']

const COLORS = {
  'c': [0X439BB2FF, 0X009FBEFF, 0X00A4D2FF, 0X289DB8FF, 0X00A1C6FF, 0X00A1C7FF, 0X009FBEFF, 0X5299ADFF, 0X00A0C3FF, 0X00A5D9FF, 0X00A2CBFF, 0X379CB5FF, 0X00A3D2FF, 0X00A0C5FF, 0X2D9DB7FF],
  'm': [0XDB6295FF, 0XFD2397FF, 0XF24196FF, 0XDC6195FF, 0XFD2497FF, 0XE15B95FF, 0XEA4E96FF, 0XEC4C96FF, 0XFE2097FF, 0XFA2E97FF, 0XEF4696FF, 0XFF0097FF, 0XF14396FF, 0XFF0097FF, 0XFA2F97FF],
  'y': [0XFFE900FF, 0XFAEA4BFF, 0XFFEA00FF, 0XFFE900FF, 0XFBEA45FF, 0XFEEA00FF, 0XF9EA55FF, 0XFFE900FF, 0XFFE900FF, 0XFFEA00FF, 0XFAEA4EFF, 0XFEEA00FF, 0XFCEA31FF, 0XFFEA00FF, 0XF7EA6BFF],
}
const N_COLORS = CMAP.length
const N_TONES = COLORS['c'].length

const toIndex = (x, y) => 4 * (x + y * width)

class Band {
  constructor(index) {
    this.index = index
    this.size = randomUInt({ limit: MAX_BAND_SIZE, rand: this.#randomByIndex('size') })
    this.start = this.#randomHeight()
    this.color = this.#randomColor()
    this.threshold = getConsistentRand('thr', [index])() - 0.5
    this.end = Math.min(this.start + this.size, height - 1)
    this.mid = Math.round((this.start + this.end) / 2)
  }

  draw = (view) => {
    for (let x = 0; x < width; x++) {
      for (let y = this.start; y <= this.end; y++) {
        const i = toIndex(x, y)


        const rand = getConsistentRand('draw_rand', [i, this.index])()
        const meetsThreshold = rand > this.threshold
        // const meetsThreshold = (noise.simplex2(x/50, y)+1)/2 > this.threshold
        // const sqrDistToMid = Math.exp(Math.abs(y - this.mid) / 10)
        // const meetsThreshold = (rand + (1 - sqrDistToMid * 0.01)) > this.threshold
        // const meetsThresholdX = x % 5 + rand * 5 < this.threshold * 5
        // const meetsThresholdY = y % 10 < this.threshold * 100
        // const meetsThreshold = meetsThresholdY || meetsThresholdX

        if (meetsThreshold) {
          // const scale = 5

          view.setUint32(i, this.#randomTone(x, y))
        }
      }
    }
  }

  #randomHeight = () => randomUInt({ limit: height, rand: this.#randomByIndex('height') })

  #randomColor = () => CMAP[randomUInt({ limit: N_COLORS - 1, rand: this.#randomByIndex('color') })]

  #randomTone = (x, y) => {
    // const rand = getConsistentRand('tone', [this.index, Math.round(r*1)])
    // const tone_index = randomUInt({ limit: N_TONES - 1, rand})
    const tone_index = Math.round(((noise.simplex2(x / 10, y / 10) + 1) / 2) * (N_TONES - 1))
    // if(x+y  % 20) console.log(tone_index)

    return COLORS[this.color][tone_index]
  }

  #randomByIndex = (id) => getConsistentRand(id, [this.index])
}

const drawImage = () => {
  const imageData = ctx.createImageData(width, height)
  const view = new DataView(imageData.data.buffer)

  const bands = Array.from({ length: N_BANDS }, (_, i) => new Band(i))
  for (const band of bands) {
    band.draw(view)
  }


  return imageData
}

const update = () => {
  if (!getEffectsEnabled()) return clearContext()

  const [newWidth, newHeight] = getWidthAndHeight()
  width = newWidth; height = newHeight
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);

  const image = drawImage()
  ctx.putImageData(image, 0, 0);
}

let drawTimeout;
window.onresize = () => {
  const timeout = 200
  clearTimeout(drawTimeout)
  drawTimeout = setTimeout(update, timeout)
}

const getEffectsEnabled = () => localStorage.getItem('ui.effects') !== 'false'
const toggleEffectsEnabled = () => {
  const to = !getEffectsEnabled()
  localStorage.setItem('ui.effects', JSON.stringify(to))
  update()
}
toggleButton.addEventListener('click', toggleEffectsEnabled)

update()