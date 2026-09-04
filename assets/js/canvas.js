const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const C = 0x049EBCFF
const M = 0xED4A96FF
const Y = 0xFCEA33FF
const K = 0x000000FF

const N_BANDS = 5
const MAX_BAND_SIZE = 30

const [width, height] = [canvas.width, canvas.height]

const toIndex = (x, y) => 4 * (x + y * width)

const randomUInt = (upperLimit) => Math.round(Math.random() * upperLimit)

const randomHeight = () => randomUInt(height)

const randomColor = () => {
  const cmap = [C, M, Y]
  return cmap[randomUInt(2)]
}

class Band {
  constructor() {
    this.size = randomUInt(MAX_BAND_SIZE)
    this.start = randomHeight()
    this.color = randomColor()
    this.end = this.start + this.size
  }

  draw(view, x, y) {
    i = toIndex(x, y)
    if (y >= this.start && y <= this.end) {
      view.setUint32(i, this.color)
    }
  }
}


const getImage = () => {
  const imageData = ctx.createImageData(width, height)
  const view = new DataView(imageData.data.buffer)

  const bands = Array.from({ length: N_BANDS }, () => new Band())

  console.log(bands)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      i = toIndex(x, y)

      for (band of bands) {
        band.draw(view, x, y)
      }
    }
  }

  return imageData
}


image = getImage()
console.log(image)
ctx.putImageData(image, 0, 0);