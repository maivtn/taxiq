'use strict';

const REFERENCE_DATE = new Date('2026-07-24T12:00:00');

const REVIEW_DATA = {
  business: {
    name: 'Bitcoin Nail Bar',
    initials: 'BN',
    phone: '832-786-5576'
  },
  technicians: [
    { id: 'anna', name: 'Anna Le', initials: 'AL', role: 'Senior Nail Artist' },
    { id: 'kim', name: 'Kim Nguyen', initials: 'KN', role: 'Gel-X Specialist' },
    { id: 'mai', name: 'Mai Pham', initials: 'MP', role: 'Nail Artist' },
    { id: 'linda', name: 'Linda Tran', initials: 'LT', role: 'Pedicure Specialist' }
  ],
  reviews: [
    { id: 'nexora-1', source: 'nexora', rating: 5, customer: 'Jessica Smith', initials: 'JS', date: '2026-07-22', service: 'Gel manicure', technicianId: 'anna', text: 'Anna was so careful with the shape and the chrome finish is perfect.' },
    { id: 'nexora-2', source: 'nexora', rating: 5, customer: 'Sophie Tran', initials: 'ST', date: '2026-07-18', service: 'Gel-X full set', technicianId: 'kim', text: 'Kim understood the reference photo immediately. The set looks natural and polished.' },
    { id: 'nexora-3', source: 'nexora', rating: 4, customer: 'Mai Nguyen', initials: 'MN', date: '2026-07-11', service: 'Pedicure', technicianId: 'linda', text: 'Lovely service and a relaxing appointment. I would book again.' },
    { id: 'nexora-4', source: 'nexora', rating: 3, customer: 'Rachel Vo', initials: 'RV', date: '2026-06-20', service: 'Acrylic removal', technicianId: 'mai', text: 'The result was good, although the appointment started a little late.' },
    { id: 'google-1', source: 'google', rating: 5, customer: 'Emily Carter', initials: 'EC', date: '2026-07-20', service: 'Salon visit', text: 'Bright salon, friendly team, and the booking process was easy.' },
    { id: 'google-2', source: 'google', rating: 4, customer: 'Diana Nguyen', initials: 'DN', date: '2026-07-02', service: 'Salon visit', text: 'Great color selection and clean stations. Parking was the only challenge.' },
    { id: 'yelp-1', source: 'yelp', rating: 5, customer: 'Olivia Reed', initials: 'OR', date: '2026-06-28', service: 'Salon visit', text: 'One of the best nail appointments I have had this year.' },
    { id: 'yelp-2', source: 'yelp', rating: 3, customer: 'Grace Lee', initials: 'GL', date: '2026-05-14', service: 'Salon visit', text: 'Nice work overall, but I had to wait past my appointment time.' }
  ]
};

const SOURCE_META = [
  { id: 'nexora', label: 'Nexora', note: 'Private feedback from your customer app.' },
  { id: 'google', label: 'Google', note: 'Public store reviews from Google.' },
  { id: 'yelp', label: 'Yelp', note: 'Public store reviews from Yelp.' }
];

const state = {
  tab: 'store',
  source: 'all',
  rating: 'all',
  period: '30',
  search: '',
  technicianId: 'anna'
};

const SOURCE_IDS = SOURCE_META.map((source) => source.id);

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function sourceLabel(source) {
  return ({ all: 'All sources', nexora: 'Nexora', google: 'Google', yelp: 'Yelp' })[source] || source;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${isoDate}T12:00:00`));
}

function withinPeriod(review, period) {
  const days = Number(period);
  if (!Number.isFinite(days)) return true;
  const age = Math.floor((REFERENCE_DATE - new Date(`${review.date}T12:00:00`)) / 86400000);
  return age >= 0 && age <= days;
}

function getPeriodReviews(period = state.period) {
  return REVIEW_DATA.reviews.filter((review) => withinPeriod(review, period));
}

function getFilteredReviews({ includeSources = SOURCE_IDS, technicianId = null } = {}) {
  const query = state.search.toLowerCase();
  return REVIEW_DATA.reviews.filter((review) => {
    const sourceMatches = includeSources.includes(review.source);
    const technicianMatches = technicianId === null || review.technicianId === technicianId;
    const ratingMatches = state.rating === 'all' || review.rating === Number(state.rating);
    const searchMatches = !query || `${review.customer} ${review.text}`.toLowerCase().includes(query);
    return sourceMatches && technicianMatches && withinPeriod(review, state.period) && ratingMatches && searchMatches;
  });
}

function getAverageRating(reviews) {
  return reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
}

function getStarCounts(reviews) {
  return reviews.reduce((counts, review) => {
    counts[review.rating] += 1;
    return counts;
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
}

function renderAvatar(initials, className = 'review-avatar') {
  return `<span class="${escapeHtml(className)}" data-avatar-initials="${escapeHtml(initials)}" aria-hidden="true">${escapeHtml(initials)}</span>`;
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return `<span class="review-stars" aria-label="${safeRating} out of 5 stars">${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}</span>`;
}

function renderBusinessSummary() {
  const target = document.querySelector('[data-business-summary]');
  if (!target) return;
  target.innerHTML = `${renderAvatar(REVIEW_DATA.business.initials, 'review-business-avatar')}<div><div class="review-business-name">${escapeHtml(REVIEW_DATA.business.name)}</div><div class="review-business-meta">${escapeHtml(REVIEW_DATA.business.phone)} · Review dashboard</div></div>`;
}

function renderSummary() {
  const reviews = getPeriodReviews();
  const average = getAverageRating(reviews);
  const counts = getStarCounts(reviews);
  const maximum = Math.max(1, ...Object.values(counts));
  const scoreTarget = document.querySelector('[data-summary-card]');
  const distributionTarget = document.querySelector('[data-summary-distribution]');
  const trendTarget = document.querySelector('[data-summary-trend]');
  if (!scoreTarget || !distributionTarget || !trendTarget) return;

  scoreTarget.innerHTML = `<div class="review-card-kicker">Store rating</div><div class="review-summary-main"><strong class="review-summary-number">${average}</strong><span class="review-summary-stars">★</span></div><p class="review-summary-copy">${reviews.length} reviews in the selected period</p>`;

  distributionTarget.innerHTML = `<div class="review-card-kicker">Rating distribution</div><div class="review-distribution-list">${[5, 4, 3, 2, 1].map((rating) => `<div class="review-distribution-row"><span>${rating} star</span><span class="review-distribution-track"><span class="review-distribution-fill" style="width:${Math.round((counts[rating] / maximum) * 100)}%"></span></span><strong>${counts[rating]}</strong></div>`).join('')}</div>`;

  const current = getPeriodReviews('30');
  const previous = REVIEW_DATA.reviews.filter((review) => {
    const age = Math.floor((REFERENCE_DATE - new Date(`${review.date}T12:00:00`)) / 86400000);
    return age > 30 && age <= 60;
  });
  const delta = previous.length ? (Number(getAverageRating(current)) - Number(getAverageRating(previous))).toFixed(1) : null;
  const trendClass = delta === null || Number(delta) === 0 ? 'review-trend-value is-neutral' : 'review-trend-value';
  const trendText = delta === null ? 'Fresh feedback' : `${Number(delta) > 0 ? '↑' : '↓'} ${Math.abs(Number(delta)).toFixed(1)}`;
  trendTarget.innerHTML = `<div class="review-card-kicker">Recent trend</div><div class="${trendClass}">${trendText}</div><p class="review-summary-note">Compared with the prior 30-day period</p>`;
}

function renderSourceCards() {
  const target = document.querySelector('[data-source-grid]');
  if (!target) return;
  const periodReviews = getPeriodReviews();
  target.innerHTML = SOURCE_META.map((source) => {
    const sourceReviews = periodReviews.filter((review) => review.source === source.id);
    const selected = state.source === source.id;
    return `<button class="review-source-card${selected ? ' is-selected' : ''}" type="button" data-review-source="${source.id}" aria-pressed="${selected ? 'true' : 'false'}"><div class="review-source-card-head"><span class="review-source-name">${source.label}</span><span class="review-source-badge">${source.id === 'nexora' ? 'Private' : 'Public'}</span></div><div class="review-source-rating">${getAverageRating(sourceReviews)} <span class="review-summary-stars">★</span></div><div class="review-source-count">${sourceReviews.length} reviews · ${state.period === '30' ? 'Last 30 days' : state.period === '90' ? 'Last 90 days' : 'This year'}</div><p class="review-source-note">${source.note}</p></button>`;
  }).join('') + `<button class="review-source-reset" type="button" data-review-source="all" aria-pressed="${state.source === 'all' ? 'true' : 'false'}"><i data-lucide="layers-2" aria-hidden="true"></i> View all sources</button>`;
}

function renderReviewCard(review) {
  const technician = REVIEW_DATA.technicians.find((item) => item.id === review.technicianId);
  const technicianMarkup = technician ? `<span class="review-card-technician">${escapeHtml(technician.name)}</span>` : '';
  return `<article class="review-card" data-review-id="${escapeHtml(review.id)}"><div>${renderAvatar(review.initials)}</div><div class="review-card-main"><div class="review-card-head"><div><div class="review-card-customer">${escapeHtml(review.customer)}</div><div class="review-card-meta">${escapeHtml(sourceLabel(review.source))} · ${escapeHtml(formatDate(review.date))}</div></div></div><div class="review-card-service">${escapeHtml(review.service)}</div>${technicianMarkup}<p class="review-card-text">${escapeHtml(review.text)}</p></div><div class="review-card-rating">${renderStars(review.rating)}<span class="sr-only"> ${review.rating} stars</span></div></article>`;
}

function renderReviewList() {
  const target = document.querySelector('[data-review-list]');
  if (!target) return [];
  const includeSources = state.source === 'all' ? SOURCE_IDS : [state.source];
  const reviews = getFilteredReviews({ includeSources });
  target.innerHTML = reviews.map(renderReviewCard).join('');
  return reviews;
}

function renderTechnicianList() {
  const target = document.querySelector('[data-technician-list]');
  if (!target) return;
  const periodNexoraReviews = getPeriodReviews().filter((review) => review.source === 'nexora');
  target.innerHTML = REVIEW_DATA.technicians.map((technician) => {
    const reviews = periodNexoraReviews.filter((review) => review.technicianId === technician.id);
    const selected = state.technicianId === technician.id;
    return `<button class="review-technician-button${selected ? ' is-selected' : ''}" type="button" data-technician-id="${technician.id}" aria-pressed="${selected ? 'true' : 'false'}">${renderAvatar(technician.initials)}<span><span class="review-technician-name">${escapeHtml(technician.name)}</span><span class="review-technician-role">${escapeHtml(technician.role)} · ${reviews.length} reviews</span></span><span class="review-technician-rating">${getAverageRating(reviews)} ★</span></button>`;
  }).join('');
}

function renderTechnicianReviews() {
  const target = document.querySelector('[data-technician-review-list]');
  if (!target) return [];
  const reviews = getFilteredReviews({ includeSources: ['nexora'], technicianId: state.technicianId });
  target.innerHTML = reviews.map(renderReviewCard).join('');
  return reviews;
}

function updateTabs() {
  document.querySelectorAll('[data-review-tab]').forEach((button) => {
    const selected = button.dataset.reviewTab === state.tab;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('[data-review-panel]').forEach((panel) => {
    const selected = panel.dataset.reviewPanel === state.tab;
    panel.classList.toggle('is-active', selected);
    panel.hidden = !selected;
  });
}

function updateReviewCount(count) {
  const target = document.querySelector('[data-review-count]');
  if (target) target.textContent = `${count} review${count === 1 ? '' : 's'} shown`;
}

function renderAll() {
  renderBusinessSummary();
  renderSummary();
  renderSourceCards();
  updateTabs();

  const activeReviews = state.tab === 'store' ? renderReviewList() : (renderTechnicianList(), renderTechnicianReviews());
  updateReviewCount(activeReviews.length);

  const empty = document.querySelector('[data-review-empty]');
  if (empty) empty.hidden = activeReviews.length > 0;

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

document.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-review-tab]');
  const source = event.target.closest('[data-review-source]');
  const technician = event.target.closest('[data-technician-id]');
  if (tab) state.tab = tab.dataset.reviewTab;
  if (source) state.source = source.dataset.reviewSource;
  if (technician) state.technicianId = technician.dataset.technicianId;
  if (tab || source || technician) renderAll();
});

document.addEventListener('keydown', (event) => {
  const tabs = Array.from(document.querySelectorAll('[data-review-tab]'));
  const activeTab = event.target.closest('[data-review-tab]');
  if (!activeTab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = tabs.indexOf(activeTab);
  const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  state.tab = tabs[nextIndex].dataset.reviewTab;
  renderAll();
  tabs[nextIndex].focus();
});

document.querySelector('[data-review-search]').addEventListener('input', (event) => {
  state.search = event.target.value.trim();
  renderAll();
});

document.querySelector('[data-rating-filter]').addEventListener('change', (event) => {
  state.rating = event.target.value;
  renderAll();
});

document.querySelector('[data-period-filter]').addEventListener('change', (event) => {
  state.period = event.target.value;
  renderAll();
});

window.NEXORA_REVIEW = {
  data: REVIEW_DATA,
  state,
  setState(nextState) {
    Object.assign(state, nextState);
    renderAll();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAll);
} else {
  renderAll();
}
