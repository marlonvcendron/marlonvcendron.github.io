import { splitmix32, randomUInt, getConsistentRand } from "./random"

const getWidthAndHeight = () => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]

let [width, height] = getWidthAndHeight()

const canvas = document.getElementById('canvas')

const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

const C = 0x049EBCFF
const M = 0xED4A96FF
const Y = 0xFCEA33FF
const K = 0x000000FF

const CMAP = [C, M, Y]

const N_BANDS = 20
const MAX_BAND_SIZE = 30


const toIndex = (x, y) => 4 * (x + y * width)

class Band {
  constructor(index) {
    this.index = index
    this.size = randomUInt({ limit: MAX_BAND_SIZE, rand: this.#randomByIndex('size') })
    this.start = this.#randomHeight()
    this.color = this.#randomColor()
    this.threshold = getConsistentRand('thr', [index])()
    this.end = Math.min(this.start + this.size, height - 1)
  }

  draw = (view) => {
    for (let x = 0; x < width; x++) {
      for (let y = this.start; y <= this.end; y++) {
        const i = toIndex(x, y)

        const rand = getConsistentRand('draw_rand', [i, this.index])()
        const meetsThreshold = rand > this.threshold

        if (meetsThreshold) {
          view.setUint32(i, this.color)
        }
      }
    }
  }

  #randomHeight = () => randomUInt({ limit: height, rand: this.#randomByIndex('height') })

  #randomColor = () => CMAP[randomUInt({ limit: 2, rand: this.#randomByIndex('color') })]

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

update()