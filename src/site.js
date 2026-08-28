import { colors, wordmark, mark } from './brand.js'
import { icons } from './icons.js'
import { escapeXml } from './badge.js'

const DEFAULT_BASE = 'https://oss.arvore.com.br'

function iconMarkup(name) {
  const icon = icons[name]
  const paths = icon.d.map((d) => `<path d="${d}" fill="currentColor" fill-rule="evenodd"/>`).join('')
  return `<svg viewBox="${icon.viewBox}" aria-hidden="true" focusable="false">${paths}</svg>`
}

function sprite() {
  return Object.keys(icons)
    .map((name) => `<template id="icon-${name}">${iconMarkup(name)}</template>`)
    .join('\n')
}

function wordmarkMarkup(title) {
  return `<svg viewBox="0 0 ${wordmark.width} ${wordmark.height}" role="img" aria-label="${escapeXml(title)}"><title>${escapeXml(title)}</title><path d="${wordmark.d}" fill="${colors.teal}" fill-rule="evenodd"/></svg>`
}

function snippetBlock(label, value) {
  return `<div>
        <span class="snippet-label">${escapeXml(label)}</span>
        <div class="snippet">
          <code>${escapeXml(value)}</code>
          <button type="button" class="button" data-copy="${escapeXml(value)}"><span class="button-icon">${iconMarkup('copy')}</span><span class="button-text">Copy</span></button>
        </div>
      </div>`
}

function rosterItem(person) {
  const name = person.name || `@${person.login}`
  const projects = person.repositories.length
  const haystack = `${person.login} ${person.name || ''}`.toLowerCase()
  const handle = person.name ? `@${escapeXml(person.login)} · ` : ''
  return `<li class="roster-item" data-haystack="${escapeXml(haystack)}">
          <button type="button" class="roster-button" data-login="${escapeXml(person.login)}">
            <img src="${escapeXml(person.avatar)}" alt="" width="44" height="44" loading="lazy">
            <span class="roster-text">
              <span class="roster-name">${escapeXml(name)}</span>
              <span class="roster-meta">${handle}${person.contributions} ${person.contributions === 1 ? 'contribution' : 'contributions'} in ${projects} ${projects === 1 ? 'project' : 'projects'}</span>
            </span>
          </button>
        </li>`
}

export function renderSite({ organization, contributors, repositories }, { base = process.env.SITE_BASE_URL || DEFAULT_BASE } = {}) {
  const sharedUrl = `${base}/badges/oss-contributor.svg`
  const orgUrl = `https://github.com/${organization}`
  const description = `Badges and cards for everyone who contributes to Árvore's open source projects.`
  const payload = {
    base,
    org: organization,
    contributors: contributors.map((person) => ({
      login: person.login,
      name: person.name,
      avatar: person.avatar,
      url: person.url,
      contributions: person.contributions,
      repositories: person.repositories,
    })),
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Árvore OSS Contributor badge</title>
<meta name="description" content="${escapeXml(description)}">
<meta property="og:title" content="Árvore OSS Contributor badge">
<meta property="og:description" content="${escapeXml(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${base}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/web/site.css">
<script src="assets/web/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="masthead">
  <div class="wrap">
    ${wordmarkMarkup('Árvore')}
    <a href="${orgUrl}">Our projects on GitHub ${iconMarkup('external')}</a>
  </div>
</header>

<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Open source</p>
    <h1>Take your contributor badge</h1>
    <p>Everyone with a landed contribution in one of Árvore's open source projects has a badge and a share card waiting here. Find your handle, copy the snippet, put it wherever you like.</p>
  </div>
</section>

<main id="main">
  <div class="wrap">

    <section class="panel" aria-labelledby="shared-title">
      <h2 id="shared-title">The badge everyone shares</h2>
      <p class="section-lead">Use this one if you would rather not show a count. It is 20 pixels tall and flat styled, so it sits in the same row as shields.io badges without looking out of place.</p>
      <div class="stage">
        <img src="badges/oss-contributor.svg" alt="Árvore OSS Contributor badge" height="20">
      </div>
      <div class="snippets">
        ${snippetBlock('Markdown', `[![Árvore OSS Contributor](${sharedUrl})](${orgUrl})`)}
        ${snippetBlock('Image address', sharedUrl)}
      </div>
    </section>

    <section aria-labelledby="find-title">
      <h2 id="find-title">Find your badge</h2>
      <p class="section-lead">The list comes from the merged contributions in every public project of the ${escapeXml(organization)} organization, refreshed once a week.</p>

      <div class="field">
        <label for="search">Search by GitHub handle or name</label>
        <div class="field-control">
          ${iconMarkup('search')}
          <input id="search" type="search" autocomplete="off" placeholder="octocat">
        </div>
      </div>

      <p class="status" id="roster-status" role="status" aria-live="polite">${contributors.length} contributors so far</p>

      <ul class="roster" id="roster">
        ${contributors.map(rosterItem).join('\n        ')}
      </ul>

      <div class="empty" id="empty" hidden>
        <h3>No one here by that name</h3>
        <p>Badges are rebuilt from merged contributions once a week. If your first pull request landed in the last few days, it shows up on the next run.</p>
      </div>

      <noscript>
        <div class="empty">
          <h3>Search needs JavaScript</h3>
          <p>Your badge lives at ${escapeXml(base)}/badges/contributors/YOUR_HANDLE.svg and your card at ${escapeXml(base)}/cards/YOUR_HANDLE.png</p>
        </div>
      </noscript>
    </section>

  </div>
</main>

<footer>
  <div class="wrap">
    <p>Built from ${repositories.length} public projects. The code behind this page is MIT licensed.</p>
    <p>The Árvore wordmark and leaf mark are trademarks. If you contributed, you may display this artwork unmodified to say so. Any other use needs written permission.</p>
    <p><a href="${orgUrl}/arvore-oss-badge">How this is generated</a></p>
  </div>
</footer>

<dialog id="person" aria-modal="true"></dialog>
<p class="visually-hidden" id="announcer" role="status" aria-live="polite"></p>

${sprite()}
<script type="application/json" id="roster-data">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>
</body>
</html>
`
}

export function renderFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${mark.width + 4} ${mark.height + 4}"><path d="${mark.d}" fill="${colors.teal}" fill-rule="evenodd"/></svg>
`
}
