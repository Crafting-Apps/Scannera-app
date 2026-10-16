// Shared behaviour for every page on the site: scroll reveals, the phone
// menu and the current-section highlight in the nav. Each piece only adds to
// a page that already works without script, so a failure here hides nothing.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;

  // ---------- scroll reveal ----------
  // Only elements still below the fold are hidden, so what is on screen at
  // load never blinks. Siblings that arrive together are staggered slightly.
  var REVEAL = [
    '.head', '.pillar-copy', '.pillar-art', '.strip', '.grid .card', '.tier',
    '.tgrid > div', '.thesis .caveat', '.faq', '.final', '.band', '.shot',
    '.two-up figure', '.table-scroll', '.tags', '.prose > *', '.steps li'
  ].join(',');

  if (canObserve && !reduceMotion) {
    var fold = window.innerHeight;
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    var touring = window.matchMedia('(min-width: 901px)').matches;
    document.querySelectorAll(REVEAL).forEach(function (el) {
      // Skip anything nested inside another revealed element, so a block
      // never fades in twice, and the tour steps, which dim and light up
      // on their own.
      if (el.parentElement.closest('.reveal')) return;
      if (touring && el.closest('.tour')) return;
      if (el.getBoundingClientRect().top < fold) return;
      var index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.transitionDelay = Math.min(index, 4) * 70 + 'ms';
      el.classList.add('reveal');
      revealer.observe(el);
    });
  }

  // ---------- phone menu ----------
  var nav = document.querySelector('.nav nav');
  var header = document.querySelector('.nav');
  var links = nav ? nav.querySelectorAll('a.hide-sm') : [];
  var menuLinks = [];

  if (links.length) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-btn';
    button.setAttribute('aria-label', 'Menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'site-menu');
    button.innerHTML = '<span></span>';

    var panel = document.createElement('div');
    panel.className = 'menu';
    panel.id = 'site-menu';
    links.forEach(function (link) {
      var copy = link.cloneNode(true);
      copy.className = '';
      panel.appendChild(copy);
      menuLinks.push(copy);
    });

    nav.appendChild(button);
    header.appendChild(panel);

    var setOpen = function (open) {
      button.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
    };
    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        setOpen(false);
        button.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 721px)').addEventListener('change', function () {
      setOpen(false);
    });
  }

  // ---------- how it works tour ----------
  // The step crossing the middle of the viewport lights up and the pinned
  // phone shows its screen. CSS only uses this on wide screens.
  var tourPhone = document.querySelector('.tour-phone');
  if (tourPhone && canObserve) {
    var steps = Array.prototype.slice.call(document.querySelectorAll('.tour > .pillar'));
    var setStep = function (i) {
      tourPhone.setAttribute('data-step', i);
      steps.forEach(function (s, j) { s.classList.toggle('is-active', i === j); });
    };
    setStep(0);
    var stepSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setStep(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    steps.forEach(function (s) { stepSpy.observe(s); });
  }

  // ---------- gallery arrows ----------
  // The track scrolls natively; the arrows page it by roughly a screenful
  // and grey out at either end.
  var gallery = document.querySelector('.gallery');
  var galleryNav = document.querySelector('.gallery-nav');
  if (gallery && galleryNav) {
    var buttons = galleryNav.querySelectorAll('.gallery-btn');
    var update = function () {
      var max = gallery.scrollWidth - gallery.clientWidth - 2;
      buttons[0].disabled = gallery.scrollLeft <= 2;
      buttons[1].disabled = gallery.scrollLeft >= max;
    };
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = Number(btn.getAttribute('data-dir'));
        gallery.scrollBy({ left: dir * gallery.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    gallery.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    galleryNav.hidden = false;
    update();
  }

  // ---------- current section ----------
  // Home page only: its nav links point at sections on the same page.
  if (canObserve && links.length) {
    var byId = {};
    links.forEach(function (link, i) {
      var hash = link.getAttribute('href');
      if (hash.charAt(0) !== '#') return;
      var section = document.getElementById(hash.slice(1));
      if (section) byId[section.id] = [link, menuLinks[i]];
    });

    var current = null;
    var mark = function (id) {
      if (id === current) return;
      if (current) byId[current].forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
      current = id;
      if (id) byId[id].forEach(function (a) { a.classList.add('is-current'); a.setAttribute('aria-current', 'location'); });
    };

    var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); });
    if (sections.length) {
      // A thin band across the middle of the viewport: whichever section
      // crosses it is the one being read.
      var spy = new IntersectionObserver(function () {
        var middle = window.innerHeight / 2;
        var hit = null;
        sections.forEach(function (s) {
          var r = s.getBoundingClientRect();
          if (r.top <= middle && r.bottom > middle) hit = s.id;
        });
        mark(hit);
      }, { rootMargin: '-50% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }
})();
