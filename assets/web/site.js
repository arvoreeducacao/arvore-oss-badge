(function () {
  'use strict'

  var dataNode = document.getElementById('roster-data')
  if (!dataNode) return
  var data = JSON.parse(dataNode.textContent)
  var people = data.contributors
  var base = data.base
  var org = data.org

  var index = {}
  people.forEach(function (person) { index[person.login.toLowerCase()] = person })

  var search = document.getElementById('search')
  var roster = document.getElementById('roster')
  var empty = document.getElementById('empty')
  var status = document.getElementById('roster-status')
  var dialog = document.getElementById('person')
  var announcer = document.getElementById('announcer')

  function badgeUrl(person) {
    return base + '/badges/contributors/' + person.login + '.svg'
  }

  function snippets(person) {
    var url = badgeUrl(person)
    var profile = 'https://github.com/' + org
    return [
      { label: 'Markdown', value: '[![Árvore OSS Contributor](' + url + ')](' + profile + ')' },
      { label: 'HTML', value: '<a href="' + profile + '"><img src="' + url + '" alt="Árvore OSS Contributor" height="20"></a>' },
      { label: 'Image address', value: url },
    ]
  }

  function announce(message) {
    if (announcer) announcer.textContent = message
  }

  function copyBySelection(value) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea')
      area.value = value
      area.setAttribute('readonly', '')
      area.style.position = 'absolute'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy refused'))
      } catch (error) {
        reject(error)
      } finally {
        document.body.removeChild(area)
      }
    })
  }

  function copyText(value) {
    if (!navigator.clipboard || !window.isSecureContext) return copyBySelection(value)
    var timeout = new Promise(function (resolve, reject) {
      window.setTimeout(function () { reject(new Error('clipboard timed out')) }, 1200)
    })
    return Promise.race([navigator.clipboard.writeText(value), timeout]).catch(function () {
      return copyBySelection(value)
    })
  }

  function wireCopy(button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy')
      var label = button.querySelector('.button-text')
      var slot = button.querySelector('.button-icon')
      var original = label.textContent
      var originalIcon = slot ? slot.innerHTML : ''
      copyText(value).then(
        function () {
          button.classList.add('done')
          label.textContent = 'Copied'
          if (slot) slot.innerHTML = icon('check')
          announce('Copied to the clipboard.')
          window.setTimeout(function () {
            button.classList.remove('done')
            label.textContent = original
            if (slot) slot.innerHTML = originalIcon
          }, 2000)
        },
        function () {
          announce('Could not copy. Select the text and copy it by hand.')
          label.textContent = 'Copy failed'
          window.setTimeout(function () {
            label.textContent = original
          }, 2000)
        },
      )
    })
  }

  function icon(name) {
    var source = document.getElementById('icon-' + name)
    return source ? source.innerHTML : ''
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
    })
  }

  function openPerson(login) {
    var person = index[String(login).toLowerCase()]
    if (!person) return false

    var name = person.name || '@' + person.login
    var projects = person.repositories.length
    var body = ''

    body += '<div class="sheet-head">'
    body += '<img src="' + escapeHtml(person.avatar) + '" alt="" width="56" height="56" loading="lazy">'
    body += '<div class="sheet-identity">'
    body += '<h2 id="person-title">' + escapeHtml(name) + '</h2>'
    body += '<a href="' + escapeHtml(person.url) + '">@' + escapeHtml(person.login) + '</a>'
    body += '<p>' + person.contributions + (person.contributions === 1 ? ' contribution' : ' contributions')
    body += ' across ' + projects + (projects === 1 ? ' project' : ' projects') + '</p>'
    body += '</div>'
    body += '<button type="button" class="icon-button" data-close aria-label="Close" autofocus>' + icon('close') + '</button>'
    body += '</div>'

    body += '<div class="sheet-body">'
    body += '<h3>Your badge</h3>'
    body += '<div class="stage"><img src="badges/contributors/' + encodeURIComponent(person.login) + '.svg" alt="Árvore OSS Contributor badge for ' + escapeHtml(name) + '" height="20"></div>'

    body += '<div class="snippets">'
    snippets(person).forEach(function (snippet) {
      body += '<div>'
      body += '<span class="snippet-label">' + snippet.label + '</span>'
      body += '<div class="snippet"><code>' + escapeHtml(snippet.value) + '</code>'
      body += '<button type="button" class="button" data-copy="' + escapeHtml(snippet.value) + '"><span class="button-icon">' + icon('copy') + '</span><span class="button-text">Copy</span></button>'
      body += '</div></div>'
    })
    body += '</div>'

    body += '<h3>Your card</h3>'
    body += '<img class="card-preview" src="cards/' + encodeURIComponent(person.login) + '.png" alt="Share card for ' + escapeHtml(name) + ', Árvore OSS Contributor" width="1200" height="630" loading="lazy">'
    body += '<div class="actions">'
    body += '<a class="button" href="cards/' + encodeURIComponent(person.login) + '.png" download="arvore-oss-contributor-' + encodeURIComponent(person.login) + '.png"><span class="button-icon">' + icon('download') + '</span><span class="button-text">Download card</span></a>'
    body += '<button type="button" class="button quiet" data-close><span class="button-text">Close</span></button>'
    body += '</div>'
    body += '</div>'

    dialog.innerHTML = body
    dialog.setAttribute('aria-labelledby', 'person-title')
    dialog.querySelectorAll('[data-copy]').forEach(wireCopy)
    dialog.querySelectorAll('[data-close]').forEach(function (button) {
      button.addEventListener('click', function () { dialog.close() })
    })

    if (!dialog.open) dialog.showModal()
    if (window.location.hash !== '#/' + person.login) {
      window.history.replaceState(null, '', '#/' + person.login)
    }
    return true
  }

  dialog.addEventListener('close', function () {
    if (window.location.hash.indexOf('#/') === 0) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  })

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close()
  })

  roster.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-login]')
    if (trigger) openPerson(trigger.getAttribute('data-login'))
  })

  function filter(term) {
    var needle = term.trim().toLowerCase()
    var shown = 0
    roster.querySelectorAll('.roster-item').forEach(function (item) {
      var haystack = item.getAttribute('data-haystack')
      var match = !needle || haystack.indexOf(needle) !== -1
      item.hidden = !match
      if (match) shown += 1
    })
    empty.hidden = shown !== 0
    roster.hidden = shown === 0
    status.textContent = needle
      ? shown + (shown === 1 ? ' contributor matches' : ' contributors match') + ' your search'
      : people.length + ' contributors so far'
  }

  search.addEventListener('input', function () { filter(search.value) })

  document.querySelectorAll('[data-copy]').forEach(wireCopy)

  function openFromHash() {
    var hash = window.location.hash
    if (hash.indexOf('#/') !== 0) return
    var login = decodeURIComponent(hash.slice(2))
    if (!login) return
    if (!openPerson(login)) {
      search.value = login
      filter(login)
      search.focus()
    }
  }

  window.addEventListener('hashchange', openFromHash)
  filter('')
  openFromHash()
})()
