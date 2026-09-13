/* Neto — landing page behaviour.
   No bundle, no dependencies: this page must load without the app's JS and without a single
   third-party request (PRODUCT.md §4.12 — the same rule the SEO calculators follow).
   Everything here degrades: with JS off, the CSS `.no-js` rule leaves all content visible. */
;(function () {
  'use strict'

  var reduced = matchMedia('(prefers-reduced-motion: reduce)')

  /* ── Theme ─────────────────────────────────────────────────────────────────────────
     Same contract as src/hooks/useTheme.ts: the neto-theme key is the truth, the OS
     preference is the fallback, and the result is an explicit class on <html>. Sharing the
     key means a visitor who lands here from the app keeps the theme they chose there. */
  var root = document.documentElement
  var toggle = document.querySelector('[data-theme-toggle]')

  // The glyph swap is CSS (see styles.css §3); only the label needs writing, because a
  // screen reader reads the name, not which <svg> the stylesheet chose to draw.
  function paintToggle() {
    if (!toggle) return
    var dark = root.classList.contains('dark')
    toggle.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro')
  }

  /* The app captures come in both themes. A light screenshot on the dark page is the same
     light bomb that came out of the privacy section, so the src is swapped rather than
     shipped twice: two <img> hidden by CSS would both be fetched, and <picture> with
     prefers-color-scheme would follow the OS instead of this page's toggle.
     The markup carries the LIGHT src, so with JS off the images are still there. */
  var captures = document.querySelectorAll('[data-capture]')
  function paintCaptures() {
    var dark = root.classList.contains('dark')
    Array.prototype.forEach.call(captures, function (img) {
      var name = img.getAttribute('data-capture')
      img.setAttribute('src', '/landing/images/' + name + (dark ? '-dark' : '') + '.webp')
    })
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = !root.classList.contains('dark')
      root.classList.toggle('dark', dark)
      try {
        localStorage.setItem('neto-theme', dark ? 'dark' : 'light')
      } catch (e) {
        /* blocked storage: the choice holds for this page view and no further */
      }
      paintToggle()
      paintCaptures()
    })
    paintToggle()
  }
  paintCaptures()

  /* ── Signed-in people and installed PWAs go straight to the app ────────────────────
     Two signals, and the difference between them cost a rewrite.

     The first version keyed off the `amd-finance` store, on the reasoning that reading auth
     state would mean loading the Supabase client and this page loads no bundle. That was
     simply wrong: supabase-js keeps the session in localStorage under `sb-<ref>-auth-token`,
     so "is this person signed in" is a getItem, not a bundle.

     It matters because the two signals are not the same claim. `amd-finance` says "this
     browser opened the app once" — true of somebody who looked around and never signed up,
     and true forever after. Keying the redirect off it meant that anyone who had ever
     opened Neto here could never reach this page again on this device: not to re-read the
     privacy section, not to see what is coming in Pro, not to check the link before sending
     it to someone. A marketing page you cannot show to a former visitor is not a redirect,
     it is a wall.

     Presence only — the token is never read, parsed or sent anywhere. Presence does not
     prove the session is still alive either; an expired one lands on the login screen,
     which is where it would have landed anyway. */
  var APP_URL = '/panel/'

  function hasSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i)
        // Matched by shape rather than by the project ref, so dev and prod both work and a
        // Supabase project change does not silently turn this off.
        if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') > 0) return true
      }
    } catch (e) {
      /* private mode or blocked storage: treat as not signed in */
    }
    return false
  }

  function isInstalledApp() {
    return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  }

  // The escape hatch. Without it this page has no reachable URL for anyone signed in, which
  // includes whoever needs to look at it before sharing it.
  var WANTS_LANDING = /(^|[?&])home(=|&|$)/.test(location.search)
  // Only the home page redirects. This script also runs on the SEO calculator, which a signed-in
  // person opens on purpose (from the app, from a search) and must be allowed to use.
  var IS_HOME = location.pathname === '/' || location.pathname === '/index.html'

  if (IS_HOME && !WANTS_LANDING && (hasSession() || isInstalledApp())) {
    location.replace(APP_URL)
    return
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-app-link]'), function (a) {
    a.setAttribute('href', APP_URL)
  })

  /* ── Sticky nav ────────────────────────────────────────────────────────────────────
     A scroll listener that only writes when the answer changes: the attribute drives a CSS
     transition, and setting it on every frame restarts that transition. */
  var nav = document.querySelector('[data-nav]')
  if (nav) {
    var stuck = null
    var onScroll = function () {
      var next = window.scrollY > 8
      if (next !== stuck) {
        stuck = next
        nav.setAttribute('data-stuck', String(next))
      }
    }
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  /* ── Reveal on scroll ──────────────────────────────────────────────────────────────
     Siblings stagger; the observer disconnects per element once shown, because a reveal
     that re-fires on the way back up reads as a glitch, not as motion. */
  var revealables = document.querySelectorAll('[data-reveal]')

  function showAll() {
    Array.prototype.forEach.call(revealables, function (el) {
      el.setAttribute('data-shown', 'true')
    })
  }

  if (reduced.matches || !('IntersectionObserver' in window)) {
    showAll()
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          var el = entry.target
          var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > [data-reveal]') : []
          var index = Array.prototype.indexOf.call(siblings, el)
          el.style.setProperty('--reveal-delay', 'calc(var(--motion-stagger-base) * ' + Math.max(index, 0) + ')')
          el.setAttribute('data-shown', 'true')
          observer.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    )
    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el)
    })
    // If the OS preference flips mid-visit, stop animating and show what is left.
    reduced.addEventListener('change', function (e) {
      if (e.matches) {
        observer.disconnect()
        showAll()
      }
    })
  }

  /* ── The flow: the hero's month, counted up ────────────────────────────────────────
     One pass, never a loop. The real figures are the markup's own text and the bar's width
     comes from a --pct custom property, so with JS off the card still reads correctly (see
     the <noscript> block in the head). What this does is zero them *because* JS is on, and
     then count back up when the card comes into view. */
  var money = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  var flow = document.querySelector('[data-flow]')
  if (flow) {
    var amounts = Array.prototype.map.call(flow.querySelectorAll('[data-flow-amount]'), function (el) {
      return { el: el, to: Number(el.getAttribute('data-flow-amount')) }
    })
    var grossEl = flow.querySelector('[data-flow-gross]')
    var gross = amounts.reduce(function (sum, a) {
      return sum + a.to
    }, 0)
    var segments = flow.querySelectorAll('.flow__seg')

    var paint = function (t) {
      amounts.forEach(function (a) {
        a.el.textContent = money.format(Math.round(a.to * t))
      })
      if (grossEl) grossEl.textContent = money.format(Math.round(gross * t))
    }

    var widen = function () {
      Array.prototype.forEach.call(segments, function (seg) {
        seg.style.width = seg.getAttribute('data-pct') + '%'
      })
    }

    var run = function () {
      if (reduced.matches) {
        paint(1)
        widen()
        return
      }
      widen()
      var start = null
      var DURATION = 1100
      var step = function (now) {
        if (start === null) start = now
        var t = Math.min((now - start) / DURATION, 1)
        // expo-out, the same shape as --motion-easing-enter: fast first, settles at the end.
        paint(t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    if (!reduced.matches && 'IntersectionObserver' in window) {
      // Zero them only now that we know something will put them back.
      paint(0)
      var flowObserver = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            flowObserver.disconnect()
            run()
          }
        },
        { threshold: 0.3 }
      )
      flowObserver.observe(flow)
    } else {
      // No observer, or the user asked for less movement: the markup is already right,
      // so only the bar needs drawing.
      widen()
    }
  }

  /* ── Features: tabs ────────────────────────────────────────────────────────────────
     WAI-ARIA tabs with automatic activation: arrows move and select, Home/End jump, and only
     the selected tab is in the tab order. The markup ships the bar hidden and every panel
     visible, so this block is what turns a stack into tabs — if it never runs, nothing is lost. */
  var showcase = document.querySelector('[data-showcase]')
  if (showcase) {
    var tablist = showcase.querySelector('[role="tablist"]')
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'))
    var panels = showcase.querySelectorAll('[role="tabpanel"]')

    var activate = function (tab, opts) {
      var id = tab.getAttribute('aria-controls')
      tabs.forEach(function (t) {
        var on = t === tab
        t.setAttribute('aria-selected', String(on))
        t.setAttribute('tabindex', on ? '0' : '-1')
      })
      Array.prototype.forEach.call(panels, function (panel) {
        var on = panel.id === id
        panel.hidden = !on
        panel.removeAttribute('data-entering')
        if (on && opts.animate) {
          void panel.offsetWidth // restart the entrance when the same panel comes back
          panel.setAttribute('data-entering', '')
        }
      })
      if (opts.focus) tab.focus()
      // On a phone the bar scrolls; keep the chosen label in view without moving the page.
      if (opts.animate && tablist.scrollWidth > tablist.clientWidth) {
        var left = tab.offsetLeft - (tablist.clientWidth - tab.offsetWidth) / 2
        tablist.scrollTo({ left: left, behavior: reduced.matches ? 'auto' : 'smooth' })
      }
    }

    // Hidden panels do not fetch their lazy captures; the first time someone reaches for the
    // bar, fetch them all, so a tab never opens onto an empty box.
    var warmed = false
    var warm = function () {
      if (warmed) return
      warmed = true
      Array.prototype.forEach.call(showcase.querySelectorAll('img[loading="lazy"]'), function (img) {
        img.loading = 'eager'
      })
    }
    tablist.addEventListener('pointerenter', warm)
    tablist.addEventListener('focusin', warm)
    tablist.addEventListener('touchstart', warm, { passive: true })

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (tab.getAttribute('aria-selected') !== 'true') activate(tab, { animate: true })
      })
    })
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement)
      if (i === -1) return
      var next = null
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length]
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length]
      else if (e.key === 'Home') next = tabs[0]
      else if (e.key === 'End') next = tabs[tabs.length - 1]
      if (!next) return
      e.preventDefault()
      activate(next, { animate: true, focus: true })
    })

    tablist.hidden = false
    activate(tabs[0], { animate: false })
  }

  /* ── Intent router ─────────────────────────────────────────────────────────────────
     Mirrors the app's own profile split (PRODUCT.md §8). The choice rides along on the CTA
     so the signup knows who arrived, and is remembered for the next visit. Nothing is sent
     anywhere: it is a query string on our own domain and a key in this browser. */
  var router = document.querySelector('[data-router]')
  var answer = document.querySelector('[data-router-answer]')
  var pills = document.querySelectorAll('[data-pills] [data-tab]')
  var media = document.querySelector('[data-media]')

  if (router && answer) {
    var options = router.querySelectorAll('[data-profile]')

    var select = function (btn, focusAnswer) {
      Array.prototype.forEach.call(options, function (o) {
        o.setAttribute('aria-pressed', String(o === btn))
      })
      // The answer's text lives in the page (see [data-router-answers]) so crawlers and language
      // models read all three; the live paragraph shows the chosen one.
      var source = document.querySelector('[data-answer-for="' + btn.getAttribute('data-profile') + '"] span')
      if (source) answer.textContent = source.textContent

      // The pill stack shows what the profile actually does: which tabs of the Mes view
      // exist for you (PRODUCT.md §3 — Tributarias and Provisiones are conditional). Three
      // states, not two: before a choice, a tab is neither on nor off, it just exists.
      var on = (btn.getAttribute('data-tabs') || '').split(',')
      Array.prototype.forEach.call(pills, function (pill) {
        pill.setAttribute('data-on', String(on.indexOf(pill.getAttribute('data-tab')) !== -1))
      })
      // Each profile has its own photograph behind the pills. The attribute only picks the layer;
      // the stylesheet stacks it over the default photo, so a file that is not there yet falls
      // through to the one that is.
      if (media) media.setAttribute('data-profile', btn.getAttribute('data-profile'))

      var profile = btn.getAttribute('data-profile')
      try {
        localStorage.setItem('neto-landing-perfil', profile)
      } catch (e) {
        /* nothing to remember, nothing breaks */
      }
      Array.prototype.forEach.call(document.querySelectorAll('[data-app-link][data-cta]'), function (a) {
        var base = a.getAttribute('href').split('?')[0]
        a.setAttribute('href', base + '?perfil=' + encodeURIComponent(profile))
      })
      if (focusAnswer) answer.setAttribute('tabindex', '-1')
    }

    // After a choice, bring what it changed into view. The least scroll that shows the photo's
    // bottom edge, but never so much that the answer slides under the sticky nav: on a phone the
    // stacked cards leave both below the fold; on a desktop this is usually zero and does nothing.
    var revealCheck = null
    var shortfall = function () {
      var target = media || answer
      var navBottom = nav ? nav.getBoundingClientRect().bottom : 0
      var room = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-16')) || 16
      var toShowAll = target.getBoundingClientRect().bottom - (window.innerHeight - room)
      var toKeepAnswer = answer.getBoundingClientRect().top - (navBottom + room)
      return Math.min(toShowAll, toKeepAnswer)
    }
    var reveal = function () {
      var delta = shortfall()
      if (delta > 0) window.scrollBy({ top: delta, behavior: reduced.matches ? 'auto' : 'smooth' })
      // A smooth scroll can be cut short — a tap during momentum, another scroll starting on top
      // of it — and land a few pixels shy (seen: the photo 8px under the fold, 1 tap in 9). Once it
      // has had time to finish, measure again and close whatever is left, without animation.
      clearTimeout(revealCheck)
      revealCheck = setTimeout(function () {
        var rest = shortfall()
        if (rest > 1) window.scrollBy({ top: rest, behavior: 'auto' })
      }, 600)
    }

    // ── On a phone the cards are a swipe row (styles.css). The card that settles in front is
    // chosen, so swiping is choosing. Only a swipe the visitor made chooses: restoring a saved
    // choice, keyboard focus or a tap's own centring move the row without a touch, and must not
    // re-select mid-flight. No vertical reveal after a swipe — the visitor's hand is on the row.
    var slider = window.matchMedia('(max-width: 799px)')
    var cards = Array.prototype.slice.call(options)
    var dots = document.querySelectorAll('[data-router-dots] span')
    var touched = false
    var settle = null

    // The row snaps cards to its centre, so "in front" is the card whose centre is nearest the row's.
    var centreOf = function (el) {
      var r = el.getBoundingClientRect()
      return r.left + r.width / 2
    }
    var inFront = function () {
      var mid = centreOf(router)
      var best = cards[0]
      var bestDist = Infinity
      cards.forEach(function (card) {
        var d = Math.abs(centreOf(card) - mid)
        if (d < bestDist) { bestDist = d; best = card }
      })
      return best
    }
    var paintDots = function (card) {
      Array.prototype.forEach.call(dots, function (dot, i) {
        dot.setAttribute('data-on', String(cards[i] === card))
      })
    }
    var bringToFront = function (card, smooth) {
      if (!slider.matches) return
      router.scrollBy({ left: centreOf(card) - centreOf(router), behavior: smooth && !reduced.matches ? 'smooth' : 'auto' })
    }

    ;['touchstart', 'pointerdown', 'wheel'].forEach(function (type) {
      router.addEventListener(type, function () { touched = true }, { passive: true })
    })
    router.addEventListener('scroll', function () {
      if (!slider.matches) return
      paintDots(inFront())
      clearTimeout(settle)
      settle = setTimeout(function () {
        var card = inFront()
        if (touched && card.getAttribute('aria-pressed') !== 'true') select(card, false)
        touched = false
      }, 120)
    }, { passive: true })

    Array.prototype.forEach.call(options, function (btn) {
      btn.addEventListener('click', function () {
        select(btn, true)
        bringToFront(btn, true)
        reveal()
      })
    })

    // Restore a previous choice without stealing focus or announcing it again.
    try {
      var remembered = localStorage.getItem('neto-landing-perfil')
      if (remembered) {
        var match = router.querySelector('[data-profile="' + remembered + '"]')
        if (match) {
          select(match, false)
          bringToFront(match, false)
        }
      }
    } catch (e) {
      /* no stored choice: the neutral prompt in the markup stands */
    }
  }

  /* ── Footer year ───────────────────────────────────────────────────────────────── */
  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
})()
