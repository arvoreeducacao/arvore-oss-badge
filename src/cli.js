#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { renderBadge } from './badge.js'
import { renderCard, renderPoster } from './card.js'
import { collectContributors, profile } from './contributors.js'
import { mark, colors } from './brand.js'
import { renderSite, renderFavicon } from './site.js'

const ORG = process.env.ARVORE_ORG || 'arvoreeducacao'

async function toPng(svg, background) {
  const { Resvg } = await import('@resvg/resvg-js')
  return new Resvg(svg, { background }).render().asPng()
}

function endpointBadge(message) {
  return {
    schemaVersion: 1,
    label: 'árvore',
    message,
    color: colors.teal.slice(1),
    labelColor: colors.navy.slice(1),
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mark.width} ${mark.height}"><path d="${mark.d}" fill="${colors.teal}" fill-rule="evenodd"/></svg>`,
    style: 'flat',
    cacheSeconds: 21600,
  }
}

async function writeSite(roster) {
  await writeFile('index.html', renderSite(roster))
  await writeFile('favicon.svg', renderFavicon())
  await writeFile('og.png', await toPng(renderPoster(), colors.navy))
  console.log(`built index.html with ${roster.contributors.length} contributors`)
}

async function readRoster() {
  try {
    return JSON.parse(await readFile('contributors.json', 'utf8'))
  } catch {
    return { organization: ORG, repositories: [], contributors: [] }
  }
}

async function build() {
  await mkdir('badges', { recursive: true })
  const badge = renderBadge(['OSS Contributor'])
  await writeFile('badges/oss-contributor.svg', badge)
  await writeFile('badges/oss-contributor.png', await toPng(badge, 'transparent'))
  await writeFile('badges/oss-contributor.json', `${JSON.stringify(endpointBadge('OSS Contributor'), null, 2)}\n`)
  console.log('built badges/oss-contributor.{svg,png,json}')
  await writeSite(await readRoster())
}

async function refresh() {
  await mkdir('badges/contributors', { recursive: true })
  await mkdir('cards', { recursive: true })
  await mkdir('endpoint', { recursive: true })

  const { repositories, contributors } = await collectContributors(ORG)
  console.log(`${contributors.length} contributors across ${repositories.length} public repositories`)

  const roster = []
  for (const person of contributors) {
    const { name, avatar, url } = await profile(person.login)
    const repositoryCount = person.repositories.length
    const message = `OSS Contributor · ${person.contributions}`

    const badge = renderBadge(['OSS Contributor', String(person.contributions)])
    const card = renderCard({
      handle: person.login,
      name,
      contributions: person.contributions,
      repositories: repositoryCount,
    })

    await writeFile(`badges/contributors/${person.login}.svg`, badge)
    await writeFile(`cards/${person.login}.svg`, card)
    await writeFile(`cards/${person.login}.png`, await toPng(card, colors.navy))
    await writeFile(`endpoint/${person.login}.json`, `${JSON.stringify(endpointBadge(message), null, 2)}\n`)

    roster.push({ ...person, name, avatar, url, repositories: person.repositories.sort() })
  }

  const payload = { organization: ORG, repositories: repositories.sort(), contributors: roster }
  await writeFile('contributors.json', `${JSON.stringify(payload, null, 2)}\n`)
  console.log('wrote badges/contributors, cards, endpoint and contributors.json')
  await writeSite(payload)
}

const command = process.argv[2] || 'build'
const commands = { build, refresh }
if (!commands[command]) {
  console.error(`unknown command: ${command}\nusage: arvore-oss-badge [build|refresh]`)
  process.exit(1)
}
await commands[command]()
