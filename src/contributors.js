const API = 'https://api.github.com'

function headers() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'arvore-oss-badge',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function paged(url) {
  const results = []
  let next = url
  while (next) {
    const response = await fetch(next, { headers: headers() })
    if (response.status === 204) break
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status} on ${next}: ${await response.text()}`)
    }
    results.push(...(await response.json()))
    const link = response.headers.get('link') || ''
    const match = link.match(/<([^>]+)>;\s*rel="next"/)
    next = match ? match[1] : null
  }
  return results
}

export async function publicRepositories(org) {
  const repos = await paged(`${API}/orgs/${org}/repos?type=public&per_page=100`)
  return repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.private)
    .map((repo) => repo.name)
}

export async function collectContributors(org, { exclude = [] } = {}) {
  const repos = await publicRepositories(org)
  const people = new Map()

  for (const repo of repos) {
    const rows = await paged(`${API}/repos/${org}/${repo}/contributors?per_page=100`)
    for (const row of rows) {
      if (row.type === 'Bot' || row.login.endsWith('[bot]')) continue
      if (exclude.includes(row.login)) continue
      const current = people.get(row.login) || { login: row.login, contributions: 0, repositories: [] }
      current.contributions += row.contributions
      current.repositories.push(repo)
      people.set(row.login, current)
    }
  }

  const list = [...people.values()].sort((a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login))
  return { repositories: repos, contributors: list }
}

export async function profile(login) {
  const fallback = { login, name: null, avatar: `https://avatars.githubusercontent.com/${login}`, url: `https://github.com/${login}` }
  const response = await fetch(`${API}/users/${login}`, { headers: headers() })
  if (!response.ok) return fallback
  const user = await response.json()
  return { login, name: user.name, avatar: user.avatar_url || fallback.avatar, url: user.html_url || fallback.url }
}
