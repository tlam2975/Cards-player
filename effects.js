(() => {
  'use strict';

  // These visitors are decoration only. They never read or change the deck.
  const layer = document.getElementById('partyLayer');
  if (!layer) return;

  const toast = document.getElementById('partyToast');
  const petToggle = document.getElementById('petToggle');
  const flowerToggle = document.getElementById('flowerToggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'card-club-playful-effects';
  const timers = { pets: null, flowers: null };
  const cleanupTimers = new Set();
  let toastTimer;
  let enabled = { pets: false, flowers: false };
  let nextPet = 'cat';

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (saved) enabled = { pets: saved.pets === true, flowers: saved.flowers === true };
  } catch (_) {
    // Private browsing can make session storage unavailable.
  }

  const catSvg = `<svg viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="#34263d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">
      <path class="party-tail party-cat-tail" d="M37 56C20 52 7 43 9 28C10 20 16 19 18 25C20 30 14 32 15 37C18 44 26 43 34 45" fill="#e3ab6d"/>
      <g class="party-leg party-leg-back"><path d="M49 61L45 78L34 83Q33 88 39 88H50L62 62" fill="#c98652"/></g>
      <g class="party-leg party-leg-front"><path d="M100 59L108 79L119 83Q123 89 117 89H107L90 63" fill="#c98652"/></g>
      <path d="M33 50C41 38 63 38 80 42L107 44L105 61C92 73 48 72 35 64C30 60 30 55 33 50Z" fill="#e3ab6d"/>
      <path d="M45 44L50 55M57 42L60 52M70 43L73 53" stroke="#b67149" stroke-width="4"/>
      <g class="party-leg party-leg-front"><path d="M44 60L47 79L57 82Q62 88 56 89H44L35 64" fill="#efbf84"/></g>
      <g class="party-leg party-leg-back"><path d="M89 62L89 78L80 83Q78 88 84 89H95L103 61" fill="#efbf84"/></g>
      <g class="party-pet-head">
        <path d="M91 32L89 12L106 23L120 21L135 11L136 36C143 47 136 61 119 63C102 64 88 53 91 32Z" fill="#efbf84"/>
        <path d="M94 20L96 31L103 25M129 21L125 29L132 28" fill="#d88e81" stroke="none"/>
        <path d="M108 24L110 32M117 23L116 32" stroke="#b67149" stroke-width="3"/>
        <path d="M101 41L106 42M125 42L129 40"/>
        <path d="M113 47L117 47L115 50Z" fill="#d68080" stroke="none"/>
        <path d="M115 51Q111 57 107 53M115 51Q118 57 123 53" stroke-width="2"/>
        <path d="M101 49L88 46M101 53L88 54M128 48L143 46M128 53L141 55" stroke-width="1.8"/>
        <ellipse cx="101" cy="48" rx="4" ry="2" fill="#df9a80" stroke="none"/>
        <ellipse cx="130" cy="48" rx="4" ry="2" fill="#df9a80" stroke="none"/>
      </g>
      <path d="M91 61L105 65" stroke="#93b8ac" stroke-width="5"/>
      <circle cx="101" cy="68" r="3.1" fill="#f5d77b" stroke-width="1.4"/>
    </g>
  </svg>`;

  const dogSvg = `<svg viewBox="0 0 160 105" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="#34263d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path class="party-tail party-dog-tail" d="M36 55Q20 49 14 29Q9 20 6 28Q4 43 25 63" fill="#b78359"/>
      <g class="party-leg party-leg-back"><path d="M50 65L49 81L38 85Q36 91 42 91H55L64 66" fill="#ac7552"/></g>
      <g class="party-leg party-leg-front"><path d="M102 61L112 81L125 86Q128 92 122 92H111L93 65" fill="#ac7552"/></g>
      <path d="M32 48C43 39 71 41 92 46L111 47L110 65C98 76 48 78 34 68C28 63 27 54 32 48Z" fill="#f0d0a4"/>
      <path d="M42 43Q54 40 59 46Q65 59 53 67Q43 72 33 65Q26 51 42 43Z" fill="#b78359" stroke="none"/>
      <g class="party-leg party-leg-front"><path d="M45 65L50 82L61 86Q65 92 59 93H47L35 68" fill="#f0d0a4"/></g>
      <g class="party-leg party-leg-back"><path d="M91 67L92 82L82 87Q80 92 86 93H98L105 63" fill="#f0d0a4"/></g>
      <g class="party-pet-head">
        <path d="M95 23Q111 13 128 24L133 39L148 44Q154 57 138 62L111 64Q93 59 91 44Z" fill="#f0d0a4"/>
        <path d="M98 25Q83 22 81 36L86 56Q91 64 98 55L105 36Q108 27 98 25Z" fill="#b78359"/>
        <path d="M119 38L123 39"/>
        <path d="M142 44Q148 40 152 46Q155 53 145 52Z" fill="#34263d" stroke="none"/>
        <path d="M133 59Q137 67 133 73Q128 75 127 68L128 61" fill="#df91a0" stroke-width="2"/>
        <path d="M127 56Q133 62 141 58" stroke-width="2"/>
        <circle cx="119" cy="48" r="3" fill="#e7b48d" stroke="none"/>
      </g>
      <path d="M99 64L112 68" stroke="#ca788e" stroke-width="5"/>
      <path d="M108 69L111 75L106 77L103 72Z" fill="#f5d77b" stroke-width="1.4"/>
    </g>
  </svg>`;

  const flowerSvg = (color, heart) => `<svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="party-flower-stem" stroke="#5c8f78" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 140Q59 97 49 55"/>
      <path d="M53 109Q30 109 28 87Q49 90 53 109Z" fill="#87aa83"/>
      <path d="M54 94Q76 91 77 72Q55 74 54 94Z" fill="#acc39a"/>
    </g>
    <g class="party-flower-petals" fill="${color}" stroke="#563944" stroke-width="1.6">
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(-3 50 51)"/>
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(57 50 51)"/>
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(117 50 51)"/>
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(177 50 51)"/>
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(237 50 51)"/>
      <ellipse cx="50" cy="31" rx="12" ry="20" transform="rotate(297 50 51)"/>
      <circle cx="50" cy="51" r="12" fill="${heart}"/>
      <path d="M45 49H45.1M55 48H55.1M47 55Q50 58 54 54" stroke="#563944" stroke-width="2.2" stroke-linecap="round"/>
    </g>
    <g class="party-flower-sparkles" fill="#f5d77b">
      <path d="M14 47L16 52L21 54L16 56L14 61L12 56L7 54L12 52Z"/>
      <path d="M83 23L85 28L90 30L85 32L83 37L81 32L76 30L81 28Z"/>
    </g>
  </svg>`;

  function later(callback, delay) {
    const timer = window.setTimeout(() => {
      cleanupTimers.delete(timer);
      callback();
    }, delay);
    cleanupTimers.add(timer);
    return timer;
  }

  function announce(kind) {
    if (!toast) return;
    const vi = document.documentElement.lang.toLowerCase().startsWith('vi');
    toast.textContent = kind === 'flowers'
      ? (vi ? 'Một chút hoa cho bàn chơi.' : 'A few flowers for the table.')
      : (vi ? 'Một vị khách ghé chơi.' : 'A little visitor dropped by.');
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.textContent = '';
    }, 2400);
  }

  function visit(kind, shouldAnnounce = true) {
    if (document.visibilityState === 'hidden') return;
    if (layer.querySelectorAll('.party-pet').length >= 3) return;
    const pet = document.createElement('div');
    const reverse = Math.random() > 0.5;
    pet.className = `party-pet party-pet-${kind}${reverse ? ' party-pet-reverse' : ''}`;
    pet.style.setProperty('--pet-duration', `${(7.5 + Math.random() * 2).toFixed(2)}s`);
    pet.style.setProperty('--pet-bottom', `${20 + Math.random() * 14}px`);
    pet.style.setProperty('--pet-size', `${kind === 'dog' ? 145 : 132}px`);
    pet.style.setProperty('--pet-rest-x', reverse ? 'calc(100% - 166px)' : '24px');
    pet.innerHTML = `<span class="party-pet-shadow"></span><span class="party-pet-sprite">${kind === 'dog' ? dogSvg : catSvg}</span>`;
    layer.appendChild(pet);
    pet.addEventListener('animationend', (event) => {
      if (event.target === pet) pet.remove();
    });
    later(() => pet.remove(), reducedMotion.matches ? 2800 : 11000);
    if (shouldAnnounce) announce('pets');
  }

  function flowers(shouldAnnounce = true) {
    if (document.visibilityState === 'hidden') return;
    if (layer.querySelectorAll('.party-garden').length >= 2) return;
    const garden = document.createElement('div');
    garden.className = 'party-garden';
    const palettes = [
      ['#e8a4ac', '#f6d77e'],
      ['#eee5c8', '#daae69'],
      ['#b7a2ce', '#f5dca0'],
      ['#eab587', '#f5dca0']
    ];

    // The middle of the table stays clear, including the draw button on phones.
    const positions = [3, 10, 18, 25, 75, 82, 90, 97];
    positions.forEach((position, index) => {
      const bloom = document.createElement('div');
      const colors = palettes[(index + Math.floor(Math.random() * palettes.length)) % palettes.length];
      bloom.className = 'party-flower';
      bloom.style.left = `${position + Math.random() * 2 - 1}%`;
      bloom.style.setProperty('--flower-size', `${48 + Math.random() * 27}px`);
      bloom.style.setProperty('--flower-turn', `${Math.random() * 24 - 12}deg`);
      bloom.style.setProperty('--flower-delay', `${(index * 0.09).toFixed(2)}s`);
      bloom.innerHTML = flowerSvg(...colors);
      garden.appendChild(bloom);
    });

    layer.appendChild(garden);
    later(() => garden.remove(), reducedMotion.matches ? 3200 : 6500);
    if (shouldAnnounce) announce('flowers');
  }

  function schedule(kind) {
    window.clearTimeout(timers[kind]);
    timers[kind] = null;
    if (!enabled[kind] || document.visibilityState === 'hidden') return;
    timers[kind] = window.setTimeout(() => {
      if (enabled[kind] && document.visibilityState !== 'hidden') {
        if (kind === 'pets') visit(Math.random() > 0.5 ? 'cat' : 'dog', false);
        else flowers(false);
      }
      schedule(kind);
    }, 18000 + Math.random() * 8000);
  }

  function updateSwitches() {
    petToggle?.setAttribute('aria-checked', String(enabled.pets));
    flowerToggle?.setAttribute('aria-checked', String(enabled.flowers));
  }

  function toggle(kind) {
    enabled[kind] = !enabled[kind];
    updateSwitches();
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(enabled));
    } catch (_) {
      // The effect remains available even when storage is disabled.
    }
    if (enabled[kind]) {
      if (kind === 'pets') visit(nextPet);
      else flowers();
    }
    schedule(kind);
  }

  petToggle?.addEventListener('click', () => toggle('pets'));
  flowerToggle?.addEventListener('click', () => toggle('flowers'));
  document.getElementById('petRunBtn')?.addEventListener('click', () => {
    visit(nextPet);
    nextPet = nextPet === 'cat' ? 'dog' : 'cat';
  });
  document.getElementById('flowerBloomBtn')?.addEventListener('click', () => flowers());
  document.getElementById('quickCat')?.addEventListener('click', () => visit('cat'));
  document.getElementById('quickDog')?.addEventListener('click', () => visit('dog'));
  document.getElementById('quickFlower')?.addEventListener('click', () => flowers());

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    const key = event.key.toLowerCase();
    if (key === 'c') visit('cat');
    else if (key === 'd') visit('dog');
    else if (key === 'f') flowers();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      layer.replaceChildren();
      cleanupTimers.forEach((timer) => window.clearTimeout(timer));
      cleanupTimers.clear();
      toast?.classList.remove('is-visible');
    }
    schedule('pets');
    schedule('flowers');
  });

  updateSwitches();
  schedule('pets');
  schedule('flowers');
  window.CardClubEffects = Object.freeze({
    cat: () => visit('cat'),
    dog: () => visit('dog'),
    flowers: () => flowers()
  });
})();
