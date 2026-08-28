import { colors, wordmark, mark } from './brand.js'
import { textPath } from './text.js'
import { escapeXml } from './badge.js'

const WIDTH = 1200
const HEIGHT = 630
const MARGIN = 88

function place(value, { size, weight = 'bold', x, baseline, fill, letterSpacing = 0 }) {
  const { d } = textPath(value, { size, weight, letterSpacing })
  return `<path d="${d}" fill="${fill}" transform="translate(${x} ${baseline})"/>`
}

function fit(value, { size, weight, maxWidth, letterSpacing = 0 }) {
  let current = size
  while (current > 12) {
    const { width } = textPath(value, { size: current, weight, letterSpacing })
    if (width <= maxWidth) break
    current -= 1
  }
  return current
}

export function renderCard({ handle, name, contributions, repositories }) {
  const logoHeight = 52
  const logoScale = logoHeight / wordmark.height
  const markHeight = 424
  const markScale = markHeight / mark.height
  const markWidth = mark.width * markScale
  const markX = WIDTH - MARGIN - markWidth
  const markY = (HEIGHT - markHeight) / 2

  const displayName = name || `@${handle}`
  const nameSize = fit(displayName, { size: 62, weight: 'bold', maxWidth: WIDTH - MARGIN * 2 - 40 })
  const handleLine = `@${handle}`

  const summary = contributions
    ? `${contributions} ${contributions === 1 ? 'contribution' : 'contributions'} across ${repositories} open source ${repositories === 1 ? 'project' : 'projects'}`
    : 'Open source contributor'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(`${displayName} — Árvore OSS Contributor`)}">
<title>${escapeXml(`${displayName} — Árvore OSS Contributor`)}</title>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.navy}"/>
<g transform="translate(${markX.toFixed(1)} ${markY.toFixed(1)}) scale(${markScale.toFixed(4)})" opacity="0.11">
  <path d="${mark.d}" fill="${colors.teal}" fill-rule="evenodd"/>
</g>
<g transform="translate(${MARGIN} ${MARGIN - 10}) scale(${logoScale.toFixed(4)})">
  <path d="${wordmark.d}" fill="${colors.teal}" fill-rule="evenodd"/>
</g>
${place('OSS CONTRIBUTOR', { size: 26, weight: 'bold', x: MARGIN, baseline: 258, fill: colors.teal, letterSpacing: 4.6 })}
${place(displayName, { size: nameSize, weight: 'bold', x: MARGIN, baseline: 348, fill: colors.white })}
${name ? place(handleLine, { size: 30, weight: 'regular', x: MARGIN, baseline: 398, fill: colors.teal }) : ''}
<rect x="${MARGIN}" y="446" width="120" height="4" rx="2" fill="${colors.teal}"/>
${place(summary, { size: 26, weight: 'regular', x: MARGIN, baseline: 508, fill: '#8FB3BC' })}
${place('github.com/arvoreeducacao', { size: 24, weight: 'bold', x: MARGIN, baseline: 556, fill: '#4E7683' })}
</svg>
`
}

export function renderPoster() {
  const logoHeight = 64
  const logoScale = logoHeight / wordmark.height
  const markHeight = 470
  const markScale = markHeight / mark.height
  const markWidth = mark.width * markScale
  const markX = WIDTH - MARGIN - markWidth
  const markY = (HEIGHT - markHeight) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Árvore OSS Contributor badges">
<title>Árvore OSS Contributor badges</title>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.navy}"/>
<g transform="translate(${markX.toFixed(1)} ${markY.toFixed(1)}) scale(${markScale.toFixed(4)})" opacity="0.11">
  <path d="${mark.d}" fill="${colors.teal}" fill-rule="evenodd"/>
</g>
<g transform="translate(${MARGIN} ${MARGIN - 10}) scale(${logoScale.toFixed(4)})">
  <path d="${wordmark.d}" fill="${colors.teal}" fill-rule="evenodd"/>
</g>
${place('OPEN SOURCE', { size: 26, weight: 'bold', x: MARGIN, baseline: 286, fill: colors.teal, letterSpacing: 4.6 })}
${place('OSS Contributor', { size: 76, weight: 'bold', x: MARGIN, baseline: 382, fill: colors.white })}
<rect x="${MARGIN}" y="440" width="120" height="4" rx="2" fill="${colors.teal}"/>
${place('A badge and a card for everyone who contributes', { size: 28, weight: 'regular', x: MARGIN, baseline: 504, fill: '#8FB3BC' })}
${place('to Árvore\'s open source projects', { size: 28, weight: 'regular', x: MARGIN, baseline: 546, fill: '#8FB3BC' })}
</svg>
`
}
