import { colors, wordmark } from './brand.js'
import { textPath } from './text.js'

const HEIGHT = 20
const RADIUS = 3
const FONT_SIZE = 11
const CAP_HEIGHT = 0.715
const LOGO_HEIGHT = 12
const LOGO_PAD = 8
const TEXT_PAD = 9

const palettes = {
  fill: { background: colors.teal, foreground: colors.navy },
  quiet: { background: colors.navy, foreground: colors.teal },
}

function logoSegment() {
  const scale = LOGO_HEIGHT / wordmark.height
  const width = wordmark.width * scale + LOGO_PAD * 2
  const y = (HEIGHT - LOGO_HEIGHT) / 2
  const content = `<g transform="translate(${round(LOGO_PAD)} ${round(y)}) scale(${round(scale, 4)})"><path d="${wordmark.d}" fill="${colors.teal}" fill-rule="evenodd"/></g>`
  return { width, background: colors.navy, content }
}

function textSegment(label, tone, offset) {
  const { d, width } = textPath(label, { size: FONT_SIZE, weight: 'bold' })
  const palette = palettes[tone]
  const segmentWidth = width + TEXT_PAD * 2
  const baseline = (HEIGHT + FONT_SIZE * CAP_HEIGHT) / 2
  const content = `<path d="${d}" fill="${palette.foreground}" transform="translate(${round(offset + TEXT_PAD)} ${round(baseline)})"/>`
  return { width: segmentWidth, background: palette.background, content }
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits))
}

export function renderBadge(labels, { title } = {}) {
  const segments = []
  let offset = 0
  const logo = logoSegment()
  segments.push({ ...logo, x: 0 })
  offset += logo.width

  labels.forEach((label, index) => {
    const segment = textSegment(label, index % 2 === 0 ? 'fill' : 'quiet', offset)
    segments.push({ ...segment, x: offset })
    offset += segment.width
  })

  const width = round(offset)
  const accessibleTitle = title ?? ['Árvore', ...labels].join(' — ')
  const bands = segments
    .map((segment) => `<rect x="${round(segment.x)}" width="${round(segment.width)}" height="${HEIGHT}" fill="${segment.background}"/>`)
    .join('')
  const marks = segments.map((segment) => segment.content).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}" role="img" aria-label="${escapeXml(accessibleTitle)}">
<title>${escapeXml(accessibleTitle)}</title>
<clipPath id="r"><rect width="${width}" height="${HEIGHT}" rx="${RADIUS}"/></clipPath>
<g clip-path="url(#r)">${bands}${marks}</g>
</svg>
`
}

export function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char])
}
