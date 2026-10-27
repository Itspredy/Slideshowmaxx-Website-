const asset = number => `assets/slide-${String(number).padStart(2, '0')}.jpg`;

// Keep the existing carousel imagery and order.
document.querySelectorAll('.slide-card').forEach(card => {
  const images = card.dataset.images.split(',').map(Number);
  const image = card.querySelector('img');
  const counter = card.querySelector('.slide-counter');
  const dots = [...card.querySelectorAll('.dots i')];
  let index = 0;

  function render() {
    image.src = asset(images[index]);
    counter.textContent = `${index + 1}/${images.length}`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle('current', dotIndex === index));
  }

  card.querySelector('.slide-prev').addEventListener('click', () => {
    index = (index + images.length - 1) % images.length;
    render();
  });
  card.querySelector('.slide-next').addEventListener('click', () => {
    index = (index + 1) % images.length;
    render();
  });
  render();
});

const nav = [...document.querySelectorAll('.sidebar nav a, .jump-nav a')];
const timeline = document.querySelector('.timeline');
const jumpNav = timeline.querySelector('.jump-nav');
function updateNav() {
  let current = null;
  for (const id of ['how', 'outputs', 'distribution', 'questions', 'pricing-timeline']) {
    if (document.getElementById(id).getBoundingClientRect().top < window.innerHeight * .47) current = id;
  }
  nav.forEach(link => link.classList.toggle('active', link.hash === `#${current}`));
}
function updateTimelineProgress() {
  const navHeight = jumpNav.offsetHeight;
  const lineStart = timeline.getBoundingClientRect().top + window.scrollY + navHeight;
  const travel = Math.max(1, timeline.offsetHeight - navHeight - window.innerHeight * .4);
  const progress = Math.max(0, Math.min(1, (window.scrollY + window.innerHeight * .6 - lineStart) / travel));
  timeline.style.setProperty('--jump-nav-height', `${navHeight}px`);
  timeline.style.setProperty('--timeline-progress', progress.toFixed(4));
}
let scrollUiFrame = 0;
function scheduleScrollUi() {
  if (scrollUiFrame) return;
  scrollUiFrame = window.requestAnimationFrame(() => {
    scrollUiFrame = 0;
    updateNav();
    updateTimelineProgress();
  });
}
window.addEventListener('scroll', scheduleScrollUi, { passive: true });
window.addEventListener('resize', scheduleScrollUi);
window.addEventListener('load', scheduleScrollUi);
new ResizeObserver(scheduleScrollUi).observe(timeline);
scheduleScrollUi();

// Let readers open every carousel slide and workflow screenshot at full resolution.
document.body.insertAdjacentHTML('beforeend', `
  <div class="image-viewer" id="image-viewer" role="dialog" aria-modal="true" aria-label="Full-size image" aria-hidden="true" hidden>
    <div class="viewer-panel">
      <div class="viewer-toolbar">
        <strong id="viewer-title">Full-size image</strong>
        <div class="viewer-actions">
          <button type="button" id="viewer-zoom">Actual size</button>
          <a id="viewer-original" target="_blank" rel="noopener">Open original</a>
          <button type="button" id="viewer-close" aria-label="Close full-size image">×</button>
        </div>
      </div>
      <div class="viewer-stage"><img id="viewer-image" alt=""></div>
      <p class="viewer-help">Use “Actual size” to zoom and scroll when the text is small.</p>
    </div>
  </div>
`);

const viewer = document.getElementById('image-viewer');
const viewerImage = document.getElementById('viewer-image');
const viewerTitle = document.getElementById('viewer-title');
const viewerOriginal = document.getElementById('viewer-original');
const viewerZoom = document.getElementById('viewer-zoom');
const viewerClose = document.getElementById('viewer-close');
const viewerStage = viewer.querySelector('.viewer-stage');
let viewerTrigger = null;

function openViewer(image) {
  pauseTimedOffer();
  viewerTrigger = image;
  const stepTitle = image.closest('.step')?.querySelector('h3')?.textContent;
  const slideCount = image.closest('.slide-card')?.querySelector('.slide-counter')?.textContent;
  viewerTitle.textContent = stepTitle || (slideCount ? `Carousel slide ${slideCount}` : 'Full-size image');
  viewerImage.src = image.currentSrc || image.src;
  viewerImage.alt = image.alt || viewerTitle.textContent;
  viewerOriginal.href = viewerImage.src;
  viewerImage.classList.remove('actual-size');
  viewerStage.classList.remove('actual-size');
  viewerZoom.textContent = 'Actual size';
  viewer.hidden = false;
  viewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-open');
  viewerClose.focus();
}

function closeViewer() {
  viewer.hidden = true;
  viewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-open');
  viewerImage.removeAttribute('src');
  viewerTrigger?.focus();
  resumeTimedOffer();
}

document.querySelectorAll('.slide-display img, .terminal-shot img, .proof-image img').forEach(image => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', 'View full image');
  image.addEventListener('click', () => openViewer(image));
  image.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openViewer(image);
    }
  });
});
viewerClose.addEventListener('click', closeViewer);
viewer.addEventListener('click', event => {
  if (event.target === viewer) closeViewer();
});
viewerZoom.addEventListener('click', () => {
  const actual = viewerImage.classList.toggle('actual-size');
  viewerStage.classList.toggle('actual-size', actual);
  viewerStage.scrollTo(0, 0);
  viewerZoom.textContent = actual ? 'Fit to screen' : 'Actual size';
});

// Preserve the current offer interaction, while keeping its accessibility state in sync.
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');
const purchaseToast = document.getElementById('purchase-toast');
const purchaseName = document.getElementById('purchase-name');
const purchaseLocation = document.getElementById('purchase-location');
const sampleNames = [
  'Maya R.', 'Liam C.', 'Ava M.', 'Noah P.', 'Sofia L.',
  'Ethan B.', 'Isla K.', 'Oliver T.', 'Amelia S.', 'Lucas D.',
  'Mia H.', 'Leo W.', 'Zoe F.', 'Aria J.', 'Jack N.',
  'Ella V.', 'Theo G.', 'Nina A.', 'Daniel E.', 'Grace Q.'
];
const sampleLocations = [
  'New York, USA', 'Los Angeles, USA', 'Austin, USA', 'Seattle, USA',
  'Toronto, Canada', 'Vancouver, Canada', 'London, UK', 'Manchester, UK',
  'Berlin, Germany', 'Munich, Germany', 'Paris, France', 'Amsterdam, Netherlands',
  'Madrid, Spain', 'Rome, Italy', 'Stockholm, Sweden', 'Sydney, Australia',
  'Melbourne, Australia', 'Auckland, New Zealand', 'Singapore', 'Dubai, UAE'
];
function shuffledIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swap]] = [indexes[swap], indexes[index]];
  }
  return indexes;
}
let nameOrder = shuffledIndexes(sampleNames.length);
let locationOrder = shuffledIndexes(sampleLocations.length);
let samplePurchaseIndex = 0;
function showDemoPurchase() {
  if (!viewer.hidden || overlay.classList.contains('show')) return;
  if (samplePurchaseIndex === sampleNames.length) {
    nameOrder = shuffledIndexes(sampleNames.length);
    locationOrder = shuffledIndexes(sampleLocations.length);
    samplePurchaseIndex = 0;
  }
  purchaseName.textContent = sampleNames[nameOrder[samplePurchaseIndex]];
  purchaseLocation.textContent = sampleLocations[locationOrder[samplePurchaseIndex]];
  samplePurchaseIndex += 1;
  purchaseToast.hidden = false;
  purchaseToast.classList.remove('appearing');
  void purchaseToast.offsetWidth;
  purchaseToast.classList.add('appearing');
}
purchaseToast.querySelector('.purchase-toast-close').addEventListener('click', () => {
  purchaseToast.hidden = true;
});
let purchaseSwipeStart = null;
purchaseToast.addEventListener('pointerdown', event => {
  if (event.target.closest('.purchase-toast-close')) return;
  purchaseSwipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  purchaseToast.setPointerCapture(event.pointerId);
});
purchaseToast.addEventListener('pointerup', event => {
  if (!purchaseSwipeStart || event.pointerId !== purchaseSwipeStart.id) return;
  const horizontalDistance = Math.abs(event.clientX - purchaseSwipeStart.x);
  const verticalDistance = Math.abs(event.clientY - purchaseSwipeStart.y);
  if (horizontalDistance >= 60 && horizontalDistance > verticalDistance * 1.25) {
    purchaseToast.hidden = true;
  }
  purchaseSwipeStart = null;
});
purchaseToast.addEventListener('pointercancel', () => { purchaseSwipeStart = null; });
let demoStockCount = 10;
let demoStockTimer = null;
function renderDemoStock() {
  document.querySelectorAll('[data-stock-count]').forEach(label => {
    label.textContent = String(demoStockCount);
  });
}
function scheduleDemoStockDrop() {
  clearTimeout(demoStockTimer);
  if (document.hidden || demoStockCount <= 5) return;
  demoStockTimer = window.setTimeout(() => {
    demoStockCount -= 1;
    renderDemoStock();
    if (toast.style.display !== 'none') {
      toast.classList.remove('stock-updated');
      void toast.offsetWidth;
      toast.classList.add('stock-updated');
    }
    showDemoPurchase();
    scheduleDemoStockDrop();
  }, 5000 + Math.floor(Math.random() * 5001));
}
renderDemoStock();
scheduleDemoStockDrop();
document.addEventListener('visibilitychange', scheduleDemoStockDrop);
let offerTrigger = null;
const offerStateKey = 'slideshowmaxx-offer-state';
const offerCountKey = 'slideshowmaxx-auto-offer-count';
const offerDelays = [5000, 5000, 10000, 15000, 20000, 30000, 60000];
function readOfferState() {
  try { return sessionStorage.getItem(offerStateKey); } catch { return null; }
}
function saveOfferState(state) {
  try { sessionStorage.setItem(offerStateKey, state); } catch { /* The popup still works without storage. */ }
}
function readOfferCount() {
  try {
    const count = Number(localStorage.getItem(offerCountKey));
    return Number.isInteger(count) ? Math.max(0, Math.min(offerDelays.length, count)) : 0;
  } catch { return 0; }
}
let autoOfferCount = readOfferCount();
function saveOfferCount() {
  try { localStorage.setItem(offerCountKey, String(autoOfferCount)); } catch { /* Keep the count for this page. */ }
}
let timedOfferTimer = null;
let offerVisibleMs = 0;
let offerVisibleSince = null;
function pauseTimedOffer() {
  if (offerVisibleSince !== null) {
    offerVisibleMs += performance.now() - offerVisibleSince;
    offerVisibleSince = null;
  }
  clearTimeout(timedOfferTimer);
  timedOfferTimer = null;
}
function resumeTimedOffer() {
  if (autoOfferCount >= offerDelays.length || document.hidden || !viewer.hidden || overlay.classList.contains('show') || offerVisibleSince !== null) return;
  offerVisibleSince = performance.now();
  timedOfferTimer = window.setTimeout(() => {
    pauseTimedOffer();
    if (document.hidden || !viewer.hidden || overlay.classList.contains('show')) return;
    autoOfferCount += 1;
    saveOfferCount();
    openOffer(null);
  }, Math.max(0, offerDelays[autoOfferCount] - offerVisibleMs));
}
function openOffer(trigger) {
  pauseTimedOffer();
  offerVisibleMs = 0;
  saveOfferState('open');
  offerTrigger = trigger;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.querySelector('.modal-close').focus();
}
function closeOffer() {
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  saveOfferState('closed');
  offerTrigger?.focus();
  resumeTimedOffer();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseTimedOffer();
  else resumeTimedOffer();
});
window.addEventListener('pagehide', pauseTimedOffer);
window.addEventListener('pageshow', resumeTimedOffer);
const savedOfferState = readOfferState();
if (savedOfferState === 'open') openOffer(null);
else resumeTimedOffer();
document.querySelector('.toast-close').addEventListener('click', () => { toast.style.display = 'none'; });
document.querySelector('.modal-close').addEventListener('click', closeOffer);
document.querySelector('.decline').addEventListener('click', () => {
  closeOffer();
  window.location.assign(checkoutLink('/checkout/start?offer=regular'));
});
overlay.addEventListener('click', event => { if (event.target === overlay) closeOffer(); });
function checkoutLink(path) {
  const configuredOrigin = window.SLIDESHOWMAX_CHECKOUT_ORIGIN;
  if (!configuredOrigin) return path;
  try {
    const origin = new URL(configuredOrigin);
    if (origin.protocol !== 'https:' && origin.hostname !== 'localhost') return path;
    return new URL(path, origin).toString();
  } catch { return path; }
}
document.querySelectorAll('a[href^="/checkout/start"]').forEach(link => {
  link.href = checkoutLink(link.getAttribute('href'));
});
document.getElementById('discount-cta').addEventListener('click', () => saveOfferState('closed'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!viewer.hidden) closeViewer();
    else if (overlay.classList.contains('show')) closeOffer();
  }
});
