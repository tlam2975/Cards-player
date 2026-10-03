/* ═══════════════════════════════════════════
   CONSTANTS & STATE
═══════════════════════════════════════════ */
const STACK = 6;
const SETTINGS_KEY = 'cardDraw_v2';
const SETTINGS_TTL = 5 * 60 * 1000; // 5 minutes

let sourcePrompts = [];
let translatedPrompts = [];
let prompts = [];
let remaining = [];
let noRepeat = false;
let busy = false;
let language = 'vi';
let theme = 'neon';
let nightMode = true;
let intensity = 'normal';
let customCards = [];
let enabledPacks = { funny: true, physical: true, social: true, deep: true, spicy: true, bingo: true };

let players = [
  { name: 'Player 1', shots: 0 },
  { name: 'Player 2', shots: 0 },
];
let maxShots = 3;
let currentPlayerIdx = 0;

/* ── Countdown feature state ── */
let activeCountdowns = [];
let cdIdCounter = 0;
let cdRounds = 1;
let cdActivated = false;

const I18N = {
  vi: {
    gameSetup: 'Thiết lập', language: 'Ngôn ngữ', theme: 'Giao diện', themeVelvet: 'Xanh mực', themeNeon: 'Xanh đêm', themeLantern: 'Xanh lá', themeBordeaux: 'Đỏ anh đào',
    intensity: 'Độ cháy', chill: 'Nhẹ', normal: 'Vừa', chaos: 'Loạn', packs: 'Bộ bài', packFunny: 'Hài', packPhysical: 'Vận động', packSocial: 'Xã hội', packDeep: 'Tâm sự', packSpicy: 'Căng', packBingo: 'BINGO',
    maxShots: 'Số ly tối đa', customCards: 'Bài tự thêm', players: 'Người chơi', dragHint: 'kéo hoặc dùng mũi tên để đổi thứ tự', addPlayer: 'Thêm người', resetRound: 'Reset vòng',
    eyebrow: 'Rút một lá', noRepeats: 'Không lặp', play: 'Play', drink: 'Uống', rounds: 'Số vòng', activate: 'Kích hoạt', setCountdown: 'Đặt thử thách theo vòng', activated: 'Đã kích hoạt',
    deckComplete: 'Hết bộ bài', deckCompleteBody: 'Tất cả lá trong bộ đang bật đã được rút', reshuffle: 'Xào lại & tiếp tục', countdownPlaceholder: 'Nội dung thử thách theo vòng...',
    openSettings: 'Mở thiết lập', closeSettings: 'Đóng thiết lập', remaining: (a, b) => `${a} / ${b} lá còn lại`, turn: name => `Lượt của ${name}`,
    deckNote: (shown, total) => `${shown}/${total} lá đang bật`, customNote: count => count ? `${count} lá tự thêm trong ván này` : 'Mỗi dòng là một lá mới cho riêng ván này',
    mood: (themeName, count) => `${themeName} · ${count} lá`, toastTitle: 'Thử thách kết thúc!', removeTimer: 'Xoá timer',
    heroLineOne: 'Một lá bài.', heroLineTwo: 'Cả cuộc vui.',
    heroDescription: 'Một chút bất ngờ. Một chút liều lĩnh. Rút một lá và để cuộc vui bắt đầu.',
    settingsShort: 'Thiết lập', yourTable: 'Bàn của bạn', upNext: 'Lượt tiếp theo',
    drawCard: 'Rút một lá', drawing: 'Đang xào bài…', enterHint: 'Nhấn Enter để rút bài',
    playersCount: 'Người chơi', deckCountLabel: 'Lá trong bộ', deckAria: 'Bộ bài', footerNote: 'Cuộc vui nằm trong tay bạn.',
    noRepeatsAria: 'Không rút lại lá đã chơi', playing: 'Đang chơi', playerName: 'Tên người chơi',
    removePlayer: name => `Xoá ${name}`, decreaseShots: 'Giảm số ly tối đa', increaseShots: 'Tăng số ly tối đa',
    decreaseRounds: 'Giảm số vòng', increaseRounds: 'Tăng số vòng',
    partyTricks: 'Chút nghịch ngợm', petParade: 'Khách bốn chân', flowerGarden: 'Hoa nở bên bàn',
    petRun: 'Mời khách ghé chơi', flowerBloom: 'Cho hoa nở', secretKeys: 'Phím bí mật: C · D · F',
    catVisitor: 'Mèo ghé chơi', dogVisitor: 'Chó ghé chơi', bloomFlowers: 'Cho hoa nở',
    movePlayerUp: name => `Đưa ${name} lên trước`, movePlayerDown: name => `Đưa ${name} xuống sau`,
    shotsCount: (shots, limit) => `${shots} trên ${limit} ly`,
    nightModeLabel: 'Chế độ ban đêm', night: 'Ban đêm', day: 'Ban ngày',
    switchToDay: 'Chuyển sang ban ngày', switchToNight: 'Chuyển sang ban đêm'
  },
  en: {
    gameSetup: 'Game Setup', language: 'Language', theme: 'Theme', themeVelvet: 'Ink blue', themeNeon: 'Midnight blue', themeLantern: 'Evergreen', themeBordeaux: 'Cherry',
    intensity: 'Intensity', chill: 'Chill', normal: 'Normal', chaos: 'Chaos', packs: 'Card Packs', packFunny: 'Funny', packPhysical: 'Physical', packSocial: 'Social', packDeep: 'Deep', packSpicy: 'Intimate', packBingo: 'BINGO',
    maxShots: 'Max Shots', customCards: 'Custom Cards', players: 'Players', dragHint: 'drag or use arrows to reorder', addPlayer: 'Add Player', resetRound: 'Reset Round',
    eyebrow: 'Draw a card', noRepeats: 'No repeats', play: 'Play', drink: 'Drink', rounds: 'Rounds', activate: 'Activate', setCountdown: 'Set round challenge', activated: 'Activated',
    deckComplete: 'Deck Complete', deckCompleteBody: 'Every enabled card has been drawn', reshuffle: 'Reshuffle & Continue', countdownPlaceholder: 'Round challenge text...',
    openSettings: 'Open game settings', closeSettings: 'Close settings', remaining: (a, b) => `${a} of ${b} remaining`, turn: name => `${name}'s turn`,
    deckNote: (shown, total) => `${shown}/${total} cards enabled`, customNote: count => count ? `${count} custom cards in this session` : 'One new card per line for this session',
    mood: (themeName, count) => `${themeName} · ${count} cards`, toastTitle: 'Challenge ended!', removeTimer: 'Remove timer',
    heroLineOne: 'One card.', heroLineTwo: 'Anything goes.',
    heroDescription: 'A little unexpected. A little uninhibited. Draw a card and see where the night goes.',
    settingsShort: 'Settings', yourTable: 'Your table', upNext: 'Up next',
    drawCard: 'Draw a card', drawing: 'Shuffling…', enterHint: 'Press Enter to draw',
    playersCount: 'Players', deckCountLabel: 'Cards in deck', deckAria: 'Card deck', footerNote: 'The night is in your hands.',
    noRepeatsAria: 'Do not draw cards already played', playing: 'Playing', playerName: 'Player name',
    removePlayer: name => `Remove ${name}`, decreaseShots: 'Decrease maximum shots', increaseShots: 'Increase maximum shots',
    decreaseRounds: 'Decrease rounds', increaseRounds: 'Increase rounds',
    partyTricks: 'Party tricks', petParade: 'Four-legged guests', flowerGarden: 'Flowers at the table',
    petRun: 'Send in the pets', flowerBloom: 'Make it bloom', secretKeys: 'Secret keys: C · D · F',
    catVisitor: 'A cat visitor', dogVisitor: 'A dog visitor', bloomFlowers: 'Make it bloom',
    movePlayerUp: name => `Move ${name} up`, movePlayerDown: name => `Move ${name} down`,
    shotsCount: (shots, limit) => `${shots} of ${limit} shots`,
    nightModeLabel: 'Night mode', night: 'Night', day: 'Day',
    switchToDay: 'Switch to day mode', switchToNight: 'Switch to night mode'
  }
};

const THEME_NAMES = {
  vi: { velvet: 'Xanh mực', neon: 'Xanh đêm', lantern: 'Xanh lá', bordeaux: 'Đỏ anh đào' },
  en: { velvet: 'Ink blue', neon: 'Midnight blue', lantern: 'Evergreen', bordeaux: 'Cherry' }
};

const PACK_RULES = {
  bingo: [/^\[bingo\]/i],
  physical: [/jumping|squat|chống đẩy|xoay|cõng|bế|quỳ|bò|trồng cây|nhảy|đứng|nằm|rửa|gội|đánh răng|chạm tay|vật tay|pose|múa|massage|dẫm|đấm|gãi/i],
  deep: [/bí mật|người yêu cũ|toxic|redflag|ghét|nuối tiếc|overthinking|xấu hổ|quê|sợ ai đó|buồn|kỷ niệm|thoải mái|phát hiện|thay đổi|cảm thấy|vì sao|thật hoặc uống|chia sẻ/i],
  spicy: [/hôn|thơm|ôm|âu yếm|ve vuốt|cắn|mút|tai|má|môi|ngồi vào lòng|thả thính|cụng má|cụng trán|nắm tay|nắm chân|gác chân|vuốt má|dùng 2 ngón tay đi bộ|thì thầm vào tai.*muốn làm/i],
  social: [/người bên|người đối|mọi người|tất cả|nhóm|messenger|instagram|story|locket|note|album|selfie|ảnh|hỏi|khen|kể|nói|chỉ ra|đồng ý/i],
  funny: [/skrrrt|gâu gâu|siuuu|hiphop|đỉnh chưa|vãi|đùa|chu môi|nháy mắt|người mẫu|cố trang|đồng khởi|ếch|bị điên|moah/i]
};

const INTENSITY_LIMITS = { chill: 1, normal: 2, chaos: 3 };


/* ═══════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════ */
const stackWrap = document.getElementById('stackWrap');
const overlay = document.getElementById('overlay');
const cardSpring = document.getElementById('cardSpring');
const flipInner = document.getElementById('flipInner');
const flipFront = document.getElementById('flipFront');
const cardText = document.getElementById('cardText');
const playBtn = document.getElementById('playBtn');
const toggleEl = document.getElementById('noRepeatToggle');
const counterEl = document.getElementById('counter');
const deckScreen = document.getElementById('deckScreen');
const reshuffleBtn = document.getElementById('reshuffleBtn');
const playerStrip = document.getElementById('playerStrip');
const turnName = document.getElementById('turnName');
const turnDots = document.getElementById('turnDots');
const drinkBtn = document.getElementById('drinkBtn');
const playOverlayBtn = document.getElementById('playOverlayBtn');
const burgerBtn = document.getElementById('burgerBtn');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
const playerList = document.getElementById('playerList');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const maxShotsVal = document.getElementById('maxShotsVal');
const shotsDown = document.getElementById('shotsDown');
const shotsUp = document.getElementById('shotsUp');
const resetRoundBtn = document.getElementById('resetRoundBtn');
const celebrationLayer = document.getElementById('celebrationLayer');
const countdownListEl = document.getElementById('countdownList');
const cdToggleBtn = document.getElementById('cdToggle');
const cdFormEl = document.getElementById('cdForm');
const cdTextEl = document.getElementById('cdText');
const cdDownBtn = document.getElementById('cdDown');
const cdUpBtn = document.getElementById('cdUp');
const cdValEl = document.getElementById('cdVal');
const cdActivateBtn = document.getElementById('cdActivate');
const toastContainerEl = document.getElementById('toastContainer');
const languageControl = document.getElementById('languageControl');
const themeGrid = document.getElementById('themeGrid');
const intensityControl = document.getElementById('intensityControl');
const packGrid = document.getElementById('packGrid');
const deckNote = document.getElementById('deckNote');
const deckMood = document.getElementById('deckMood');
const customCardsInput = document.getElementById('customCardsInput');
const customCardsNote = document.getElementById('customCardsNote');
const topLanguageControl = document.getElementById('topLanguageControl');
const nightModeToggle = document.getElementById('nightModeToggle');
const modeLabel = document.getElementById('modeLabel');
const tableSettings = document.getElementById('tableSettings');
const drawButtonLabel = document.getElementById('drawButtonLabel');
const deckTilt = document.getElementById('deckTilt');
const revealCardBack = document.getElementById('revealCardBack');
const pageBackground = ['pageHeader', 'mainStage', 'pageFooter'].map(id => document.getElementById(id)).filter(Boolean);
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let drawerTrigger = null;
let drawing = false;
let revealId = 0;

const CARD_BACK_ART = `
  <div class="card-back-top" aria-hidden="true">
    <span><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m8 1 6 7-6 7-6-7Z"/></svg></span>
    <span><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m8 1 6 7-6 7-6-7Z"/></svg></span>
  </div>
  <div class="card-emblem" aria-hidden="true">
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="currentColor" stroke-width="3.5" stroke-linecap="square">
        <path d="M80 10a70 70 0 0 1 70 70M80 150a70 70 0 0 1-70-70"/>
        <path d="M80 21a59 59 0 0 1 59 59M80 139a59 59 0 0 1-59-59"/>
        <path d="M80 32a48 48 0 0 1 48 48M80 128a48 48 0 0 1-48-48"/>
        <path d="M10 80a70 70 0 0 1 70-70M150 80a70 70 0 0 1-70 70" stroke-dasharray="4 7"/>
      </g>
      <circle cx="80" cy="80" r="35" stroke="currentColor" stroke-width="1.5"/>
      <path fill="currentColor" d="M80 54c-12 0-19 14-12 23-15-3-23 8-17 19 5 10 18 10 26 1-1 9-3 15-8 18h22c-5-3-7-9-8-18 8 9 21 9 26-1 6-11-2-22-17-19 7-9 0-23-12-23Z"/>
      <g fill="currentColor"><path d="m25 25 5-5 5 5-5 5Zm100 105 5-5 5 5-5 5Z"/></g>
    </svg>
  </div>
  <div class="card-back-bottom" aria-hidden="true">
    <span><svg viewBox="0 0 72 8" width="72" height="8" fill="currentColor"><path d="M0 3h25v2H0Zm47 0h25v2H47Z"/><circle cx="36" cy="4" r="3"/></svg></span>
    <span><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m8 1 6 7-6 7-6-7Z"/></svg></span>
  </div>`;

const CONTROL_ICON_PATHS = {
  check: '<path d="m4 10 4 4 8-8"/>',
  hourglass: '<path d="M5 2h10M5 18h10M6 2v3c0 2 2 3 4 5-2 2-4 3-4 5v3M14 2v3c0 2-2 3-4 5 2 2 4 3 4 5v3"/>',
  close: '<path d="m5 5 10 10M15 5 5 15"/>',
  up: '<path d="m5 12 5-5 5 5"/>',
  down: '<path d="m5 8 5 5 5-5"/>',
  grip: '<circle cx="7" cy="4" r=".8"/><circle cx="13" cy="4" r=".8"/><circle cx="7" cy="10" r=".8"/><circle cx="13" cy="10" r=".8"/><circle cx="7" cy="16" r=".8"/><circle cx="13" cy="16" r=".8"/>',
  clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>'
};

function controlIcon(name, size = 20) {
  return `<svg class="control-icon" viewBox="0 0 20 20" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${CONTROL_ICON_PATHS[name] || CONTROL_ICON_PATHS.hourglass}</svg>`;
}

function syncDrawingUI() {
  document.body.classList.toggle('drawing', drawing);
  if (drawButtonLabel) drawButtonLabel.textContent = t(drawing ? 'drawing' : 'drawCard');
  playBtn.setAttribute('aria-busy', String(drawing));
}

function syncDashboard() {
  const player = players[currentPlayerIdx];
  const values = {
    currentTurn: player ? player.name : '', playerCount: players.length, deckCount: prompts.length,
    intensityValue: t(intensity), drawHint: t('enterHint'), tableStatus: t('upNext')
  };
  Object.entries(values).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
}

function activeDialog() {
  if (drawer.classList.contains('open')) return drawer;
  if (deckScreen.classList.contains('show')) return deckScreen;
  if (overlay.classList.contains('show')) return overlay;
  return null;
}

function syncDialogs() {
  const active = activeDialog();
  pageBackground.forEach(node => { node.inert = Boolean(active); });
  [drawer, overlay, deckScreen].forEach(node => {
    const hidden = node !== active;
    if (hidden && node.contains(document.activeElement)) document.activeElement.blur();
    node.inert = hidden;
    node.setAttribute('aria-hidden', String(hidden));
  });
  document.body.classList.toggle('modal-open', Boolean(active));
}

function focusWithin(dialog, preferred) {
  requestAnimationFrame(() => {
    if (activeDialog() !== dialog) return;
    const target = preferred || dialog.querySelector('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)') || dialog;
    target.focus({ preventScroll: true });
  });
}

function focusMainDraw() {
  if (!activeDialog()) playBtn.focus({ preventScroll: true });
}

function fitCardText() {
  if (!overlay.classList.contains('show')) return;
  cardText.style.removeProperty('font-size');
  const faceStyle = getComputedStyle(flipFront);
  const textStyle = getComputedStyle(cardText);
  let available = flipFront.clientHeight - parseFloat(faceStyle.paddingTop) - parseFloat(faceStyle.paddingBottom);
  for (const sibling of flipFront.children) {
    if (sibling === cardText || getComputedStyle(sibling).position === 'absolute') continue;
    const style = getComputedStyle(sibling);
    available -= sibling.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  }
  available -= parseFloat(textStyle.marginTop) + parseFloat(textStyle.marginBottom);
  available = Math.max(70, available);
  cardText.style.maxHeight = `${available}px`;
  cardText.style.overflowY = 'auto';
  let size = parseFloat(textStyle.fontSize);
  while (cardText.scrollHeight > available + 1 && size > 16) {
    size = Math.max(16, size - 1);
    cardText.style.fontSize = `${size}px`;
  }
  if (cardText.scrollHeight > available + 1) cardText.tabIndex = 0;
  else cardText.removeAttribute('tabindex');
}

function resetTilt() {
  if (!deckTilt) return;
  deckTilt.style.setProperty('--tilt-x', '0deg');
  deckTilt.style.setProperty('--tilt-y', '0deg');
}

if (deckTilt) {
  deckTilt.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionPreference.matches || busy) return;
    const box = deckTilt.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    deckTilt.style.setProperty('--tilt-x', `${(-y * 12).toFixed(2)}deg`);
    deckTilt.style.setProperty('--tilt-y', `${(x * 16).toFixed(2)}deg`);
  });
  deckTilt.addEventListener('pointerleave', resetTilt);
  motionPreference.addEventListener('change', () => {
    resetTilt();
    if (motionPreference.matches) { clearCelebration(); cardSpring.classList.remove('bingo-pulse'); }
  });
  finePointer.addEventListener('change', resetTilt);
}

window.addEventListener('resize', () => requestAnimationFrame(fitCardText));
if (document.fonts) document.fonts.ready.then(() => requestAnimationFrame(fitCardText));
document.addEventListener('keydown', event => {
  const dialog = activeDialog();
  if (event.key === 'Escape' && dialog === drawer) {
    event.preventDefault();
    closeDrawer();
    return;
  }
  if (event.key === 'Tab' && dialog) {
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter(node => !node.closest('[inert]') && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); dialog.focus(); return; }
    if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
    return;
  }
  if (event.key === 'Enter' && !event.repeat && !dialog && !busy && prompts.length &&
    !event.target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
    event.preventDefault();
    playBtn.click();
  }
});


/* ═══════════════════════════════════════════
   SETTINGS PERSISTENCE (5-min TTL)
═══════════════════════════════════════════ */
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      players: players.map(p => ({ name: p.name })),
      maxShots,
      language,
      theme,
      nightMode,
      intensity,
      enabledPacks,
      customCards,
      noRepeat,
      savedAt: Date.now(),
    }));
  } catch { }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const { players: sp, maxShots: sm, savedAt } = saved;
    if (Date.now() - savedAt > SETTINGS_TTL) {
      localStorage.removeItem(SETTINGS_KEY);
      return;
    }
    if (Array.isArray(sp) && sp.length >= 2) {
      players = sp.map(p => ({ name: p.name || 'Player', shots: 0 }));
    }
    if (typeof sm === 'number' && sm >= 1 && sm <= 10) maxShots = sm;
    if (['vi', 'en'].includes(saved.language)) language = saved.language;
    if (['velvet', 'neon', 'lantern', 'bordeaux'].includes(saved.theme)) theme = saved.theme;
    if (typeof saved.nightMode === 'boolean') nightMode = saved.nightMode;
    if (['chill', 'normal', 'chaos'].includes(saved.intensity)) intensity = saved.intensity;
    if (saved.enabledPacks && typeof saved.enabledPacks === 'object') {
      enabledPacks = { ...enabledPacks, ...saved.enabledPacks };
    }
    if (Array.isArray(saved.customCards)) customCards = saved.customCards.filter(Boolean);
    if (typeof saved.noRepeat === 'boolean') noRepeat = saved.noRepeat;
  } catch { }
}

function t(key) {
  return I18N[language][key] || I18N.en[key] || key;
}

function setIconLabel(button, iconName, label) {
  button.innerHTML = `${controlIcon(iconName, 16)}<span>${escHtml(label)}</span>`;
}

function setSelected(button, selected) {
  button.classList.toggle('active', selected);
  button.setAttribute('aria-pressed', String(selected));
}

function syncCopy() {
  document.documentElement.lang = language;
  document.title = t('drawCard');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(btn => setSelected(btn, btn.dataset.lang === language));
  themeGrid.querySelectorAll('[data-theme-choice]').forEach(btn => setSelected(btn, btn.dataset.themeChoice === theme));
  intensityControl.querySelectorAll('[data-intensity]').forEach(btn => setSelected(btn, btn.dataset.intensity === intensity));
  packGrid.querySelectorAll('[data-pack]').forEach(btn => setSelected(btn, !!enabledPacks[btn.dataset.pack]));
  drawer.setAttribute('aria-label', t('gameSetup'));
  playerStrip.setAttribute('aria-label', t('players'));
  if (topLanguageControl) topLanguageControl.setAttribute('aria-label', t('language'));
  toggleEl.setAttribute('aria-label', t('noRepeatsAria'));
  customCardsInput.setAttribute('aria-label', t('customCards'));
  cdTextEl.setAttribute('aria-label', t('countdownPlaceholder'));
  shotsDown.setAttribute('aria-label', t('decreaseShots'));
  shotsUp.setAttribute('aria-label', t('increaseShots'));
  cdDownBtn.setAttribute('aria-label', t('decreaseRounds'));
  cdUpBtn.setAttribute('aria-label', t('increaseRounds'));
  setIconLabel(cdToggleBtn, cdActivated ? 'check' : 'hourglass', cdActivated ? t('activated') : t('setCountdown'));
  cdActivateBtn.textContent = t('activate');
  syncModeUI();
  syncDrawingUI();
  syncDashboard();
  updateDeckStatus();
}

function applyTheme() {
  document.body.dataset.theme = theme;
  document.body.dataset.mode = nightMode ? 'dark' : 'light';
  syncModeUI();
  const surfaceColor = getComputedStyle(document.body).getPropertyValue('--night').trim();
  document.documentElement.style.backgroundColor = surfaceColor;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', surfaceColor);
}

function syncModeUI() {
  if (nightModeToggle) {
    nightModeToggle.setAttribute('role', 'switch');
    nightModeToggle.setAttribute('aria-checked', String(nightMode));
    nightModeToggle.setAttribute('aria-label', t('nightModeLabel'));
    nightModeToggle.title = t(nightMode ? 'switchToDay' : 'switchToNight');
  }
  if (modeLabel) modeLabel.textContent = t(nightMode ? 'night' : 'day');
}

if (nightModeToggle) nightModeToggle.addEventListener('click', () => {
  nightMode = !nightMode;
  applyTheme();
  saveSettings();
});

function estimateIntensity(text) {
  const lower = text.toLowerCase();
  let score = 1;
  if (/3 ly|4 ly|hôn|cắn|mút|ngồi vào lòng|bị đọc|lục điện thoại|người yêu cũ|bí mật|ghét|toxic|redflag/.test(lower)) score = 3;
  else if (/2 ly|ôm|thơm|cõng|bế|massage|story|messenger|instagram|locket|ảnh|đăng|nhổ|gội|đánh răng/.test(lower)) score = 2;
  if (/^\[bingo\]/i.test(text.trim())) score = Math.max(1, score - 1);
  return score;
}

function getPacksForCard(text) {
  const packs = Object.entries(PACK_RULES)
    .filter(([, rules]) => rules.some(rule => rule.test(text)))
    .map(([pack]) => pack);
  return packs.length ? packs : ['funny'];
}

function parseCustomCards(value) {
  return value.split('\n').map(line => line.trim()).filter(Boolean);
}

function cardAllowed(text) {
  const packs = getPacksForCard(text);
  const packAllowed = packs.some(pack => enabledPacks[pack]);
  const intensityAllowed = estimateIntensity(text) <= INTENSITY_LIMITS[intensity];
  return packAllowed && intensityAllowed;
}

function makeDeckCard(vi, index) {
  return {
    vi,
    en: translatedPrompts[index] || vi,
    filterText: vi,
  };
}

function makeCustomCard(text) {
  return {
    vi: text,
    en: text,
    filterText: text,
  };
}

function getCardText(card) {
  if (typeof card === 'string') return card;
  return language === 'en' ? (card.en || card.vi) : card.vi;
}

function getCardFilterText(card) {
  return typeof card === 'string' ? card : card.filterText;
}

function rebuildDeck(resetRemaining = true) {
  const allCards = [
    ...sourcePrompts.map(makeDeckCard),
    ...customCards.map(makeCustomCard),
  ];
  const filtered = allCards.filter(card => cardAllowed(getCardFilterText(card)));
  prompts = filtered.length ? filtered : allCards;
  if (resetRemaining) remaining = [...prompts];
  updateCounter();
  updateDeckStatus();
}

function updateDeckStatus() {
  if (!deckNote || !deckMood) return;
  const total = sourcePrompts.length + customCards.length;
  const shown = prompts.length || total;
  deckNote.textContent = total ? I18N[language].deckNote(shown, total) : '';
  customCardsNote.textContent = I18N[language].customNote(customCards.length);
  deckMood.textContent = I18N[language].mood(THEME_NAMES[language][theme], shown);
  syncDashboard();
  updateCounter();
}

function syncPreferenceUI() {
  applyTheme();
  customCardsInput.value = customCards.join('\n');
  toggleEl.classList.toggle('on', noRepeat);
  toggleEl.setAttribute('aria-checked', String(noRepeat));
  syncCopy();
}

function changeLanguage(event) {
  const button = event.target.closest('[data-lang]');
  if (!button) return;
  language = button.dataset.lang;
  saveSettings();
  syncCopy();
  renderPlayerList();
  renderPlayerStrip();
  renderCountdownList();
}
languageControl.addEventListener('click', changeLanguage);
if (topLanguageControl) topLanguageControl.addEventListener('click', changeLanguage);

themeGrid.addEventListener('click', e => {
  const btn = e.target.closest('[data-theme-choice]');
  if (!btn) return;
  theme = btn.dataset.themeChoice;
  applyTheme();
  saveSettings();
  syncCopy();
});

intensityControl.addEventListener('click', e => {
  const btn = e.target.closest('[data-intensity]');
  if (!btn) return;
  intensity = btn.dataset.intensity;
  rebuildDeck(true);
  saveSettings();
  syncCopy();
});

packGrid.addEventListener('click', e => {
  const btn = e.target.closest('[data-pack]');
  if (!btn) return;
  const pack = btn.dataset.pack;
  enabledPacks[pack] = !enabledPacks[pack];
  if (!Object.values(enabledPacks).some(Boolean)) enabledPacks[pack] = true;
  rebuildDeck(true);
  saveSettings();
  syncCopy();
});

customCardsInput.addEventListener('input', e => {
  customCards = parseCustomCards(e.target.value);
  rebuildDeck(true);
  saveSettings();
});

/* ═══════════════════════════════════════════
   DRAWER
═══════════════════════════════════════════ */
function openDrawer(event) {
  drawerTrigger = event?.currentTarget || document.activeElement;
  drawer.classList.add('open');
  drawerOverlay.classList.add('open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  if (tableSettings) tableSettings.setAttribute('aria-expanded', 'true');
  syncDialogs();
  focusWithin(drawer, drawerClose);
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  if (tableSettings) tableSettings.setAttribute('aria-expanded', 'false');
  saveSettings();
  renderPlayerStrip();
  syncDialogs();
  if (drawerTrigger?.isConnected && !drawerTrigger.closest('[inert]')) drawerTrigger.focus({ preventScroll: true });
  else if (activeDialog()) focusWithin(activeDialog());
  else focusMainDraw();
}

if (tableSettings) tableSettings.addEventListener('click', openDrawer);
burgerBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

/* max shots */
function syncShotsUI() {
  maxShotsVal.textContent = maxShots;
  shotsDown.disabled = maxShots <= 1;
  shotsUp.disabled = maxShots >= 10;
}
shotsDown.addEventListener('click', () => {
  if (maxShots > 1) { maxShots--; syncShotsUI(); saveSettings(); renderPlayerStrip(); }
});
shotsUp.addEventListener('click', () => {
  if (maxShots < 10) { maxShots++; syncShotsUI(); saveSettings(); renderPlayerStrip(); }
});

/* reset round */
resetRoundBtn.addEventListener('click', () => {
  players.forEach(p => { p.shots = 0; });
  currentPlayerIdx = 0;
  activeCountdowns = [];
  renderCountdownList();
  saveSettings();
  renderPlayerStrip();
  closeDrawer();
});

/* ── player list (with drag-to-reorder) ── */
let dragSrcIdx = null;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function reorderPlayer(fromIndex, toIndex, focusDirection) {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= players.length) return;
  const [moved] = players.splice(fromIndex, 1);
  players.splice(toIndex, 0, moved);
  currentPlayerIdx = 0;
  dragSrcIdx = null;
  saveSettings();
  renderPlayerList();
  renderPlayerStrip();

  if (focusDirection) {
    const movedRow = playerList.querySelector(`[data-index="${toIndex}"]`);
    const moveButton = movedRow.querySelector(`[data-direction="${focusDirection}"]`);
    const focusTarget = moveButton.disabled ? movedRow.querySelector('.player-name-input') : moveButton;
    focusTarget.focus();
  }
}

function renderPlayerList() {
  playerList.innerHTML = '';
  players.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.draggable = true;
    row.dataset.index = i;
    row.innerHTML = `
    <span class="drag-handle" title="${escHtml(t('dragHint'))}" aria-hidden="true">
      ${controlIcon('grip', 16)}
    </span>
    <input
      class="player-name-input" type="text"
      value="${escHtml(p.name)}"
      placeholder="${escHtml(language === 'vi' ? 'Người chơi' : 'Player')} ${i + 1}"
      maxlength="20" data-idx="${i}" aria-label="${escHtml(t('playerName'))} ${i + 1}"
    />
    <div class="player-reorder">
      <button type="button" class="reorder-player-btn" data-direction="up"
        aria-label="${escHtml(t('movePlayerUp')(p.name))}" title="${escHtml(t('movePlayerUp')(p.name))}" ${i === 0 ? 'disabled' : ''}>
        ${controlIcon('up', 18)}
      </button>
      <button type="button" class="reorder-player-btn" data-direction="down"
        aria-label="${escHtml(t('movePlayerDown')(p.name))}" title="${escHtml(t('movePlayerDown')(p.name))}" ${i === players.length - 1 ? 'disabled' : ''}>
        ${controlIcon('down', 18)}
      </button>
    </div>
    <button
      type="button" class="remove-player-btn" data-idx="${i}"
      aria-label="${escHtml(I18N[language].removePlayer(p.name))}"
      ${players.length <= 2 ? 'disabled' : ''}
    >${controlIcon('close', 18)}</button>
  `;

    row.querySelector('.player-name-input').addEventListener('input', e => {
      const idx = +e.target.dataset.idx;
      players[idx].name = e.target.value.trim() || `${language === 'vi' ? 'Người chơi' : 'Player'} ${idx + 1}`;
      saveSettings();
      row.querySelector('.remove-player-btn').setAttribute('aria-label', I18N[language].removePlayer(players[idx].name));
      row.querySelectorAll('.reorder-player-btn').forEach(button => {
        const label = t(button.dataset.direction === 'up' ? 'movePlayerUp' : 'movePlayerDown')(players[idx].name);
        button.setAttribute('aria-label', label);
        button.title = label;
      });
      renderPlayerStrip();
    });

    row.querySelectorAll('.reorder-player-btn').forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.dataset.direction;
        reorderPlayer(i, i + (direction === 'up' ? -1 : 1), direction);
      });
    });

    row.querySelector('.remove-player-btn').addEventListener('click', e => {
      const idx = +e.currentTarget.dataset.idx;
      if (players.length <= 2) return;
      players.splice(idx, 1);
      if (currentPlayerIdx >= players.length) currentPlayerIdx = 0;
      saveSettings();
      renderPlayerList();
      renderPlayerStrip();
    });

    /* drag events */
    row.addEventListener('dragstart', e => {
      dragSrcIdx = i;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => row.classList.add('dragging'), 0);
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      playerList.querySelectorAll('.player-row').forEach(r => r.classList.remove('drag-over'));
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      playerList.querySelectorAll('.player-row').forEach(r => r.classList.remove('drag-over'));
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (dragSrcIdx === null || dragSrcIdx === i) return;
      reorderPlayer(dragSrcIdx, i);
    });

    playerList.appendChild(row);
  });
}

addPlayerBtn.addEventListener('click', () => {
  players.push({ name: `${language === 'vi' ? 'Người chơi' : 'Player'} ${players.length + 1}`, shots: 0 });
  saveSettings();
  renderPlayerList();
  renderPlayerStrip();
});

/* ═══════════════════════════════════════════
   DOT CLASS HELPER
═══════════════════════════════════════════ */
function getDotClass(di, shots) {
  if (di >= shots) return 'dot';
  if (maxShots === 1) return 'dot lit danger';
  if (di === maxShots - 1) return 'dot lit danger';
  if (di === maxShots - 2) return 'dot lit warn';
  return 'dot lit';
}

/* ═══════════════════════════════════════════
   PLAYER STRIP (main screen)
═══════════════════════════════════════════ */
function renderPlayerStrip() {
  playerStrip.innerHTML = '';
  players.forEach((p, i) => {
    const isLoser = p.shots >= maxShots;
    const isCurrent = i === currentPlayerIdx;

    const row = document.createElement('div');
    row.className = [
      'pstrip-row',
      isCurrent ? 'current' : '',
      isLoser ? 'loser' : '',
    ].filter(Boolean).join(' ');

    const dotsHtml = Array.from({ length: maxShots }, (_, di) =>
      `<span class="${getDotClass(di, p.shots)}"></span>`
    ).join('');

    row.innerHTML = `
    <span class="pstrip-avatar" aria-hidden="true">${escHtml(Array.from(p.name)[0]?.toUpperCase() || '?')}</span>
    <span class="pstrip-name">${escHtml(p.name)}</span>
    ${isCurrent ? `<span class="pstrip-turn-label">${escHtml(t('playing'))}</span>` : ''}
    <div class="pstrip-dots" aria-hidden="true">${dotsHtml}</div>
    <span class="pstrip-shot-count"><span aria-hidden="true">${p.shots} / ${maxShots}</span><span class="sr-only">${escHtml(t('shotsCount')(p.shots, maxShots))}</span></span>
    ${isLoser ? '<span class="skull-badge" aria-hidden="true">☠</span>' : ''}
  `;
    if (isCurrent) row.setAttribute('aria-current', 'true');
    playerStrip.appendChild(row);
  });
  syncDashboard();
}

/* ═══════════════════════════════════════════
   TURN DOTS (overlay)
═══════════════════════════════════════════ */
function renderTurnDots() {
  const shots = players[currentPlayerIdx].shots;
  const dotsHtml = Array.from({ length: maxShots }, (_, di) => {
    const isLit = di < shots;
    let cls = 'turn-dot';
    if (isLit) {
      if (maxShots === 1 || di === maxShots - 1) cls += ' lit danger';
      else if (di === maxShots - 2) cls += ' lit warn';
      else cls += ' lit';
    }
    return `<span class="${cls}" aria-hidden="true"></span>`;
  }).join('');
  turnDots.innerHTML = `${dotsHtml}<span class="turn-shot-count"><span aria-hidden="true">${shots} / ${maxShots}</span><span class="sr-only">${escHtml(t('shotsCount')(shots, maxShots))}</span></span>`;
}

/* ═══════════════════════════════════════════
   STACK
═══════════════════════════════════════════ */
function buildStack(animate = false) {
  if (animate) stackWrap.classList.add('hidden');
  stackWrap.innerHTML = '';
  for (let i = 0; i < STACK; i++) {
    const el = document.createElement('div');
    el.className = 'card';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="card-face">${CARD_BACK_ART}</div>`;
    stackWrap.appendChild(el);
  }
  if (revealCardBack) revealCardBack.innerHTML = CARD_BACK_ART;
  if (animate) {
    requestAnimationFrame(() => requestAnimationFrame(() => stackWrap.classList.remove('hidden')));
  } else {
    setTimeout(() => {
      stackWrap.classList.add('nudge');
      stackWrap.addEventListener('animationend', () => stackWrap.classList.remove('nudge'), { once: true });
    }, 900);
  }
}

/* ═══════════════════════════════════════════
   PROMPTS
═══════════════════════════════════════════ */
async function loadPrompts() {
  try {
    const cacheBust = Date.now();
    const [cardsRes, translationsRes] = await Promise.all([
      fetch(`cards.json?v=${cacheBust}`),
      fetch(`cards.en.json?v=${cacheBust}`),
    ]);
    if (!cardsRes.ok) throw new Error();
    sourcePrompts = await cardsRes.json();
    translatedPrompts = translationsRes.ok ? await translationsRes.json() : [];
  } catch {
    sourcePrompts = [
      'Could not load cards.json.',
      'Serve both files via a local server - not file://',
    ];
    translatedPrompts = [
      'Could not load cards.json.',
      'Serve both files through a local server - not file://',
    ];
  }
  rebuildDeck(true);
  playBtn.disabled = false;
}

function updateCounter() {
  if (noRepeat) {
    counterEl.textContent = I18N[language].remaining(remaining.length, prompts.length);
    counterEl.classList.add('visible');
  } else {
    counterEl.classList.remove('visible');
    counterEl.textContent = '';
  }
}

function pickCard() {
  if (noRepeat) {
    const idx = Math.floor(Math.random() * remaining.length);
    const [card] = remaining.splice(idx, 1);
    updateCounter();
    return card;
  }
  return prompts[Math.floor(Math.random() * prompts.length)];
}

toggleEl.addEventListener('click', () => {
  noRepeat = !noRepeat;
  toggleEl.classList.toggle('on', noRepeat);
  toggleEl.setAttribute('aria-checked', String(noRepeat));
  if (noRepeat) remaining = [...prompts];
  saveSettings();
  updateCounter();
});

/* ═══════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════ */
function doShuffle() {
  if (motionPreference.matches) return Promise.resolve();
  return new Promise(resolve => {
    function wave() {
      stackWrap.querySelectorAll('.card').forEach((c, i) => {
        const cls = `s${i + 1}`;
        c.classList.remove(cls);
        void c.offsetWidth;
        c.classList.add(cls);
        c.addEventListener('animationend', () => c.classList.remove(cls), { once: true });
      });
    }
    wave();
    setTimeout(wave, 920);
    setTimeout(resolve, 1860);
  });
}

function vanishStack() {
  if (motionPreference.matches) return Promise.resolve();
  return new Promise(resolve => {
    [...stackWrap.querySelectorAll('.card')].forEach((c, i) =>
      setTimeout(() => c.classList.add('gone'), i * 38)
    );
    setTimeout(resolve, 440);
  });
}

/* ═══════════════════════════════════════════
   CELEBRATION EFFECTS (BINGO cards)
═══════════════════════════════════════════ */
const FW_COLORS = ['#e8c988', '#b9905a', '#f3ead8', '#8a6a35', '#d9b06c'];
const RIBBON_COLORS = ['#b9905a', '#e8c988', '#f3ead8', '#8a6a35', '#c23b3b'];

function isBingoCard(text) {
  return /^\[bingo\]/i.test(text.trim());
}

function spawnFirework(cx, cy) {
  if (motionPreference.matches || !overlay.classList.contains('show') || !overlay.classList.contains('bingo-mode')) return;
  const count = 14 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const dist = 55 + Math.random() * 75;
    const p = document.createElement('span');
    p.className = 'fw-particle';
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    p.style.background = color;
    p.style.color = color;
    celebrationLayer.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function spawnRibbons(count = 28) {
  if (motionPreference.matches) return;
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const r = document.createElement('span');
    r.className = 'ribbon';
    const duration = 2.4 + Math.random() * 1.6;
    const delay = Math.random() * 0.4;
    r.style.left = (Math.random() * w) + 'px';
    r.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    r.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
    r.style.animationDuration = duration + 's';
    r.style.animationDelay = delay + 's';
    r.style.background = RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)];
    celebrationLayer.appendChild(r);
    setTimeout(() => r.remove(), (duration + delay) * 1000 + 100);
  }
}

function triggerCelebration() {
  if (motionPreference.matches || !overlay.classList.contains('show')) return;
  const w = window.innerWidth, h = window.innerHeight;
  spawnFirework(w * 0.28, h * 0.32);
  setTimeout(() => spawnFirework(w * 0.72, h * 0.28), 220);
  setTimeout(() => spawnFirework(w * 0.5, h * 0.42), 420);
  spawnRibbons();
}

function clearCelebration() {
  celebrationLayer.innerHTML = '';
}

/* ═══════════════════════════════════════════
   OVERLAY
═══════════════════════════════════════════ */
function showResult(card) {
  const currentReveal = ++revealId;
  drawing = false;
  syncDrawingUI();
  const p = players[currentPlayerIdx];
  const isLoser = p.shots >= maxShots;
  const sourceText = getCardFilterText(card);
  const displayText = getCardText(card);
  const isBingo = isBingoCard(sourceText);

  cardText.textContent = displayText;
  cardText.classList.toggle('is-bingo', isBingo);
  turnName.textContent = I18N[language].turn(p.name);
  renderTurnDots();

  flipFront.classList.toggle('is-loser', isLoser);
  flipFront.classList.toggle('is-bingo', isBingo);
  overlay.classList.toggle('bingo-mode', isBingo);
  cardSpring.classList.remove('bingo-pulse');
  flipInner.classList.remove('flipped');
  overlay.classList.add('show');
  syncDialogs();
  focusWithin(overlay, playOverlayBtn);
  requestAnimationFrame(fitCardText);
  setTimeout(() => {
    if (revealId === currentReveal && overlay.classList.contains('show')) flipInner.classList.add('flipped');
  }, motionPreference.matches ? 0 : 480);

  // Pre-fill countdown text with the card's text (strip BINGO prefix if any)
  resetCdForm();
  const _cdPrefill = displayText.replace(/^\[bingo\]\s*/i, '');
  cdTextEl.value = _cdPrefill;

  if (isBingo && !motionPreference.matches) {
    setTimeout(() => { if (revealId === currentReveal) triggerCelebration(); }, 1150);
    setTimeout(() => {
      if (revealId === currentReveal && overlay.classList.contains('show')) cardSpring.classList.add('bingo-pulse');
    }, 550);
  }
}

function dismissOverlay() {
  revealId++;
  drinkBtn.disabled = true;
  playOverlayBtn.disabled = true;
  clearCelebration();
  resetCdForm();
  cardSpring.classList.add('exiting');
  cardSpring.classList.remove('bingo-pulse');
  overlay.classList.remove('bingo-mode');
  setTimeout(() => {
    overlay.classList.remove('show');
    syncDialogs();
    setTimeout(() => {
      cardSpring.classList.remove('exiting');
      flipInner.classList.remove('flipped');
      buildStack(true);
      playBtn.disabled = false;
      drinkBtn.disabled = false;
      playOverlayBtn.disabled = false;
      busy = false;
      focusMainDraw();
    }, motionPreference.matches ? 0 : 450);
  }, motionPreference.matches ? 0 : 300);
}

/* ═══════════════════════════════════════════
   DRINK / PLAY
═══════════════════════════════════════════ */
drinkBtn.addEventListener('click', () => {
  const p = players[currentPlayerIdx];
  if (p.shots < maxShots) p.shots++;
  advanceTurn();
  dismissOverlay();
});

playOverlayBtn.addEventListener('click', () => {
  players[currentPlayerIdx].shots = 0;
  advanceTurn();
  dismissOverlay();
});

function advanceTurn() {
  currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
  tickCountdowns();
  renderPlayerStrip();
}

/* ═══════════════════════════════════════════
   DECK EXHAUSTED
═══════════════════════════════════════════ */
reshuffleBtn.addEventListener('click', () => {
  remaining = [...prompts];
  updateCounter();
  deckScreen.classList.remove('show');
  syncDialogs();
  focusMainDraw();
});

/* ═══════════════════════════════════════════
   MAIN PLAY
═══════════════════════════════════════════ */
playBtn.addEventListener('click', async () => {
  if (busy || !prompts.length || activeDialog()) return;
  if (noRepeat && remaining.length === 0) {
    deckScreen.classList.add('show');
    syncDialogs();
    focusWithin(deckScreen, reshuffleBtn);
    return;
  }
  busy = true;
  drawing = true;
  syncDrawingUI();
  resetTilt();
  playBtn.disabled = true;
  await doShuffle();
  await vanishStack();
  showResult(pickCard());
});

/* ═══════════════════════════════════════════
   ROUND COUNTDOWN FEATURE
═══════════════════════════════════════════ */
function syncCdRoundsUI() {
  cdValEl.textContent = cdRounds;
  cdDownBtn.disabled = cdRounds <= 1;
  cdUpBtn.disabled = cdRounds >= 20;
}

cdDownBtn.addEventListener('click', () => {
  if (cdRounds > 1) { cdRounds--; syncCdRoundsUI(); }
});

cdUpBtn.addEventListener('click', () => {
  if (cdRounds < 20) { cdRounds++; syncCdRoundsUI(); }
});

cdToggleBtn.addEventListener('click', () => {
  if (cdActivated) return;
  const isOpen = cdFormEl.classList.contains('cd-open');
  cdFormEl.classList.toggle('cd-open', !isOpen);
  cdFormEl.inert = isOpen;
  cdToggleBtn.classList.toggle('cd-open', !isOpen);
  cdToggleBtn.setAttribute('aria-expanded', String(!isOpen));
  if (!isOpen) cdTextEl.focus({ preventScroll: true });
});

cdActivateBtn.addEventListener('click', () => {
  const text = cdTextEl.value.trim();
  if (!text) { cdTextEl.focus(); return; }

  const turnsRemaining = cdRounds * players.length - 1;
  activeCountdowns.push({
    id: ++cdIdCounter,
    text,
    activatorName: players[currentPlayerIdx].name,
    turnsRemaining,
    rounds: cdRounds,
  });

  // Lock the form
  cdActivated = true;
  cdTextEl.disabled = true;
  cdDownBtn.disabled = true;
  cdUpBtn.disabled = true;
  cdActivateBtn.disabled = true;
  cdFormEl.classList.remove('cd-open');
  cdFormEl.inert = true;
  cdToggleBtn.setAttribute('aria-expanded', 'false');
  cdToggleBtn.focus({ preventScroll: true });
  cdToggleBtn.classList.remove('cd-open');
  cdToggleBtn.classList.add('cd-done');
  setIconLabel(cdToggleBtn, 'check', t('activated'));

  renderCountdownList();
});

function resetCdForm() {
  cdActivated = false;
  cdTextEl.value = '';
  cdTextEl.disabled = false;
  cdRounds = 1;
  syncCdRoundsUI();
  cdActivateBtn.disabled = false;
  cdFormEl.classList.remove('cd-open');
  cdFormEl.inert = true;
  cdToggleBtn.setAttribute('aria-expanded', 'false');
  cdToggleBtn.classList.remove('cd-open', 'cd-done');
  setIconLabel(cdToggleBtn, 'hourglass', t('setCountdown'));
}

function tickCountdowns() {
  const expired = [];
  activeCountdowns = activeCountdowns.filter(cd => {
    cd.turnsRemaining--;
    if (cd.turnsRemaining <= 0) { expired.push(cd); return false; }
    return true;
  });
  expired.forEach(showCountdownToast);
  renderCountdownList();
}

function showCountdownToast(cd) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML =
    '<span class="toast-icon">' + controlIcon('clock', 24) + '</span>' +
    '<div>' +
    '<div class="toast-title">' + escHtml(t('toastTitle')) + '</div>' +
    '<div class="toast-body">' + escHtml(cd.text) +
    '<span class="toast-by">\u2014 ' + escHtml(cd.activatorName) + '</span>' +
    '</div>' +
    '</div>';
  toastContainerEl.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out .3s ease-in forwards';
    setTimeout(() => toast.remove(), 380);
  }, 4500);
}

function renderCountdownList() {
  countdownListEl.innerHTML = '';
  if (activeCountdowns.length === 0) {
    countdownListEl.style.display = 'none';
    return;
  }
  countdownListEl.style.display = 'flex';
  activeCountdowns.forEach(cd => {
    const isUrgent = cd.turnsRemaining <= players.length;
    const chip = document.createElement('div');
    chip.className = 'cd-chip' + (isUrgent ? ' cd-urgent' : '');
    chip.innerHTML =
      '<div class="cd-chip-body">' +
      '<span class="cd-chip-text">' + escHtml(cd.text) + '</span>' +
      '<span class="cd-chip-meta">' + escHtml(cd.activatorName) + ' \u00B7 ' + cd.rounds + ' ' + escHtml(language === 'vi' ? 'vòng' : 'rounds') + '</span>' +
      '</div>' +
      '<span class="cd-chip-turns">' + cd.turnsRemaining + '</span>' +
      '<button class="cd-remove-btn" data-cd-id="' + cd.id + '" aria-label="' + escHtml(t('removeTimer')) + '">' + controlIcon('close', 16) + '</button>';
    countdownListEl.appendChild(chip);
  });
}

countdownListEl.addEventListener('click', e => {
  const btn = e.target.closest('.cd-remove-btn');
  if (!btn) return;
  activeCountdowns = activeCountdowns.filter(cd => cd.id !== Number(btn.dataset.cdId));
  renderCountdownList();
});

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
[drawer, overlay, deckScreen].forEach(dialog => {
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.tabIndex = -1;
});
overlay.setAttribute('aria-labelledby', 'turnName');
overlay.setAttribute('aria-describedby', 'cardText');
drawerOverlay.setAttribute('aria-hidden', 'true');
burgerBtn.setAttribute('aria-controls', 'drawer');
burgerBtn.setAttribute('aria-expanded', 'false');
if (tableSettings) {
  tableSettings.setAttribute('aria-controls', 'drawer');
  tableSettings.setAttribute('aria-expanded', 'false');
}
cdToggleBtn.setAttribute('aria-controls', 'cdForm');
cdToggleBtn.setAttribute('aria-expanded', 'false');
playBtn.disabled = true;
syncDialogs();
loadSettings();
syncPreferenceUI();
syncShotsUI();
syncCdRoundsUI();
buildStack();
loadPrompts();
renderPlayerList();
renderPlayerStrip();
renderCountdownList();
