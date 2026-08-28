import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const opentype = require('opentype.js')

const fontsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts')

const cache = new Map()

function font(weight) {
  const file = weight === 'bold' ? 'ArvoreSans-Bold.otf' : 'ArvoreSans-Regular.otf'
  if (!cache.has(file)) cache.set(file, opentype.loadSync(join(fontsDir, file)))
  return cache.get(file)
}

export function textPath(value, { size, weight = 'bold', x = 0, y = 0, letterSpacing = 0 }) {
  const face = font(weight)
  const scale = size / face.unitsPerEm
  const glyphs = face.stringToGlyphs(value)
  const path = new opentype.Path()
  let cursor = x
  glyphs.forEach((glyph, index) => {
    const glyphPath = glyph.getPath(cursor, y, size)
    path.extend(glyphPath)
    cursor += glyph.advanceWidth * scale + letterSpacing
    if (index < glyphs.length - 1) {
      cursor += face.getKerningValue(glyph, glyphs[index + 1]) * scale
    }
  })
  return { d: path.toPathData(2), width: cursor - x }
}

export function textWidth(value, options) {
  return textPath(value, { ...options, x: 0, y: 0 }).width
}
