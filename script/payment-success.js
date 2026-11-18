/*
 * ============================================================
 * payment-success.js
 * Confirms a Paystack payment on payment-success.html.
 *
 * Reads from script/config.js:
 *   API_BASE_URL                  (top-level const, only used if the
 *                                  endpoint below is a relative path)
 *   API_ENDPOINTS.PAYMENT_STATUS  (already a FULL url in config.js,
 *                                  so it is used as-is)
 *
 * Request:
 *   GET {PAYMENT_STATUS}?reference=<encodeURIComponent(reference)>
 *   No auth header (public endpoint).
 *
 * API FIELD NAMES ASSUMED (please check against the backend):
 *   status        "paid" | "pending" | "cancelled"
 *                 Also tolerated: success, successful, completed (paid);
 *                 canceled, failed, failure, abandoned, declined,
 *                 reversed, expired (cancelled). Anything else is
 *                 treated as pending.
 *   course_title  fallbacks: course.title, course_name, title
 *   final_price   fallbacks: amount_paid, amount, price
 *                 (string or number, parsed with parseFloat)
 *
 * Polling: every 3 seconds, up to 10 attempts, only while pending.
 * Requests never overlap (each attempt waits for the previous one).
 * ============================================================
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------
  const POLL_INTERVAL_MS = 3000;
  const MAX_ATTEMPTS = 10;
  const REQUEST_TIMEOUT_MS = 15000;
  const MIN_REFERENCE_LENGTH = 4;
  const MAX_REFERENCE_LENGTH = 100;

  const COURSES_URL = 'offer.html#courses';
  const HOME_URL = 'index.html';
  const CONTACT_URL = 'contactus.html';

  const PAID_STATUSES = ['paid', 'success', 'successful', 'completed'];
  const CANCELLED_STATUSES = [
    'cancelled', 'canceled', 'failed', 'failure',
    'abandoned', 'declined', 'reversed', 'expired'
  ];

  // ----------------------------------------------------------
  // DOM HOOKS
  // ----------------------------------------------------------
  const card = document.getElementById('paymentCard');
  if (!card) return;
  const stateEl = card.querySelector('.payState');
  if (!stateEl) return;

  // ----------------------------------------------------------
  // STATIC ICONS (hard-coded markup, never built from API data)
  // ----------------------------------------------------------
  const SVG_OPEN =
    '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" ' +
    'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true" focusable="false">';
  const ICONS = {
    check: SVG_OPEN + '<path d="M5 13l4 4L19 7"></path></svg>',
    clock: SVG_OPEN + '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
    cross: SVG_OPEN + '<path d="M6 6l12 12M18 6L6 18"></path></svg>',
    alert: SVG_OPEN + '<path d="M12 8v5M12 17h.01"></path><path d="M10.3 3.9L2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path></svg>'
  };

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------
  let runId = 0;                 // increments on every (re)start, cancels older loops
  let currentController = null;  // AbortController of the in-flight request
  let loadingMessageEl = null;

  // ----------------------------------------------------------
  // SMALL HELPERS
  // ----------------------------------------------------------
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function pick(obj, paths) {
    for (let i = 0; i < paths.length; i++) {
      const parts = paths[i].split('.');
      let value = obj;
      for (let j = 0; j < parts.length; j++) {
        if (value === null || value === undefined || typeof value !== 'object') {
          value = undefined;
          break;
        }
        value = value[parts[j]];
      }
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return undefined;
  }

  function formatNaira(value) {
    const n = parseFloat(value);
    if (!isFinite(n) || n <= 0) return '';
    return '\u20A6' + n.toLocaleString('en-NG', {
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  }

  function setBusy(isBusy) {
    card.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  }

  // ----------------------------------------------------------
  // REFERENCE + ENDPOINT
  // ----------------------------------------------------------
  function getReference() {
    let raw = '';
    try {
      const params = new URLSearchParams(window.location.search);
      raw = (params.get('reference') || params.get('trxref') || '').trim();
    } catch (e) {
      raw = '';
    }
    if (raw.length < MIN_REFERENCE_LENGTH || raw.length > MAX_REFERENCE_LENGTH) return '';
    if (!/^[A-Za-z0-9_.\-=:]+$/.test(raw)) return '';
    return raw;
  }

  function getEndpoint() {
    let endpoint = (typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS && API_ENDPOINTS.PAYMENT_STATUS) || '';
    endpoint = String(endpoint || '').trim();
    if (!endpoint) return '';

    // config.js already stores a full URL. Only prefix the base for a relative path.
    if (!/^https?:\/\//i.test(endpoint)) {
      const base = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL)
        ? String(API_BASE_URL).replace(/\/+$/, '')
        : '';
      endpoint = base + '/' + endpoint.replace(/^\/+/, '');
    }
    return endpoint;
  }

  function buildUrl(endpoint, reference) {
    return endpoint + (endpoint.indexOf('?') === -1 ? '?' : '&') +
      'reference=' + encodeURIComponent(reference);
  }

  // ----------------------------------------------------------
  // API CALL
  // ----------------------------------------------------------
  function StatusError(kind) {
    this.kind = kind;
  }

  function normaliseStatus(rawStatus) {
    const value = String(rawStatus === undefined || rawStatus === null ? '' : rawStatus)
      .trim().toLowerCase();
    if (PAID_STATUSES.indexOf(value) !== -1) return 'paid';
    if (CANCELLED_STATUSES.indexOf(value) !== -1) return 'cancelled';
    return 'pending';
  }

  async function fetchStatus(url) {
    const controller = new AbortController();
    currentController = controller;
    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });
    } catch (err) {
      throw new StatusError('network');
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 404) throw new StatusError('notfound');
    if (response.status === 429) throw new StatusError('ratelimit');
    if (!response.ok) throw new StatusError('server');

    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw new StatusError('server');
    }
    if (!data || typeof data !== 'object' || pick(data, ['status']) === undefined) {
      throw new StatusError('server');
    }

    const title = pick(data, ['course_title', 'course.title', 'course_name', 'title']);
    const price = pick(data, ['final_price', 'amount_paid', 'amount', 'price']);

    return {
      state: normaliseStatus(data.status),
      courseTitle: title === undefined ? '' : String(title).trim(),
      amount: price === undefined ? '' : formatNaira(price)
    };
  }

  // ----------------------------------------------------------
  // RENDERING
  // ----------------------------------------------------------
  function linkButton(text, href, kind) {
    const a = make('a', 'payBtn payBtn-' + kind, text);
    a.href = href;
    return a;
  }

  function actionButton(text, kind, onClick) {
    const b = make('button', 'payBtn payBtn-' + kind, text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  function textLink(text, href) {
    const a = make('a', 'payLink', text);
    a.href = href;
    return a;
  }

  function detailsList(rows) {
    const list = make('dl', 'payDetails');
    rows.forEach(function (row) {
      if (!row.value) return;
      const wrap = make('div', 'payDetailRow');
      wrap.appendChild(make('dt', 'payDetailLabel', row.label));
      wrap.appendChild(make('dd', 'payDetailValue' + (row.emphasis ? ' payDetailValue-amount' : ''), row.value));
      list.appendChild(wrap);
    });
    return list.children.length ? list : null;
  }

  // o: { variant, icon, title, message, details, note, actions, links, docTitle, final }
  function render(o) {
    const nodes = [];

    const iconWrap = make('div', 'payIcon payIcon-' + o.variant);
    if (o.variant === 'loading') {
      iconWrap.appendChild(make('span', 'spinner payBigSpinner'));
    } else {
      iconWrap.innerHTML = ICONS[o.icon] || '';
    }
    nodes.push(iconWrap);

    const title = make('h1', 'payTitle', o.title);
    title.tabIndex = -1;
    nodes.push(title);

    const message = make('p', 'payMessage', o.message);
    nodes.push(message);

    if (o.details) nodes.push(o.details);
    if (o.note) nodes.push(make('p', 'payNote', o.note));

    if (o.actions && o.actions.length) {
      const actions = make('div', 'payActions');
      o.actions.forEach(function (a) { actions.appendChild(a); });
      nodes.push(actions);
    }
    if (o.links && o.links.length) {
      const links = make('div', 'payLinks');
      o.links.forEach(function (l) { links.appendChild(l); });
      nodes.push(links);
    }

    stateEl.textContent = '';
    nodes.forEach(function (n) { stateEl.appendChild(n); });

    loadingMessageEl = o.variant === 'loading' ? message : null;
    if (o.docTitle) document.title = o.docTitle;

    if (o.final) {
      setBusy(false);
      title.focus({ preventScroll: true });
    }
  }

  function renderLoading() {
    setBusy(true);
    render({
      variant: 'loading',
      title: 'Confirming your payment',
      message: 'Please wait while we check your payment.',
      docTitle: 'Payment Status | PIHUB'
    });
  }

  function renderPaid(result, reference) {
    render({
      variant: 'success',
      icon: 'check',
      title: 'Payment successful',
      message: 'Thank you. Your payment has been received and confirmed.',
      details: detailsList([
        { label: 'Course', value: result.courseTitle },
        { label: 'Amount paid', value: result.amount, emphasis: true },
        { label: 'Reference', value: reference }
      ]),
      note: 'Our team will contact you shortly with the next steps for your course.',
      actions: [linkButton('Back to courses', COURSES_URL, 'primary')],
      links: [textLink('Go to home', HOME_URL)],
      docTitle: 'Payment Successful | PIHUB',
      final: true
    });
  }

  function renderPending(reference) {
    render({
      variant: 'warning',
      icon: 'clock',
      title: 'Still processing',
      message: 'Your payment may take a few minutes to show. Once it is confirmed, we will contact you with the next steps. Please avoid paying again while it is pending.',
      details: detailsList([{ label: 'Reference', value: reference }]),
      actions: [actionButton('Check again', 'primary', start)],
      links: [textLink('Contact us', CONTACT_URL)],
      docTitle: 'Payment Processing | PIHUB',
      final: true
    });
  }

  function renderCancelled(reference) {
    render({
      variant: 'error',
      icon: 'cross',
      title: 'Payment not completed',
      message: 'Your payment was cancelled or did not go through. If money was taken from your account, please contact us and quote your reference.',
      details: detailsList([{ label: 'Reference', value: reference }]),
      actions: [linkButton('Try again', COURSES_URL, 'primary')],
      links: [textLink('Contact us', CONTACT_URL)],
      docTitle: 'Payment Not Completed | PIHUB',
      final: true
    });
  }

  function renderMissingReference() {
    render({
      variant: 'warning',
      icon: 'alert',
      title: 'No payment reference found',
      message: 'We could not find a payment reference in this link. Please return to the courses page and start again.',
      actions: [linkButton('Back to courses', COURSES_URL, 'primary')],
      docTitle: 'Payment Status | PIHUB',
      final: true
    });
  }

  function renderError(kind, reference) {
    const messages = {
      network: 'We could not reach the server. Please check your internet connection and try again.',
      notfound: 'We could not find a payment with this reference. If you were charged, please contact us and quote your reference.',
      ratelimit: 'Too many requests were sent. Please wait a moment and try again.',
      server: 'Something went wrong on our side while checking your payment. Please try again in a moment.',
      config: 'The payment check is not available right now. Please contact us and quote your reference.'
    };
    const canRetry = kind !== 'config';
    render({
      variant: 'warning',
      icon: 'alert',
      title: 'We could not check your payment',
      message: messages[kind] || messages.server,
      details: detailsList([{ label: 'Reference', value: reference }]),
      actions: canRetry ? [actionButton('Try again', 'primary', start)] : [],
      links: [textLink('Contact us', CONTACT_URL)],
      docTitle: 'Payment Status | PIHUB',
      final: true
    });
  }

  // ----------------------------------------------------------
  // POLLING
  // ----------------------------------------------------------
  async function poll(myRun, url, reference) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (myRun !== runId) return;

      if (attempt > 1 && loadingMessageEl) {
        loadingMessageEl.textContent =
          'Still waiting for confirmation (check ' + attempt + ' of ' + MAX_ATTEMPTS + '). Please keep this page open.';
      }

      let result;
      try {
        result = await fetchStatus(url);
      } catch (err) {
        if (myRun !== runId) return;
        const kind = err && err.kind ? err.kind : 'server';
        console.error('Payment status check failed:', kind);
        renderError(kind, reference);
        return;
      }
      if (myRun !== runId) return;

      if (result.state === 'paid') {
        renderPaid(result, reference);
        return;
      }
      if (result.state === 'cancelled') {
        renderCancelled(reference);
        return;
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(POLL_INTERVAL_MS);
      }
    }

    if (myRun !== runId) return;
    renderPending(reference);
  }

  function start() {
    const reference = getReference();
    if (!reference) {
      runId++;
      renderMissingReference();
      return;
    }

    const endpoint = getEndpoint();
    if (!endpoint) {
      runId++;
      console.error('PAYMENT_STATUS endpoint is missing in script/config.js');
      renderError('config', reference);
      return;
    }

    runId++;
    const myRun = runId;
    if (currentController) currentController.abort();
    renderLoading();
    poll(myRun, buildUrl(endpoint, reference), reference);
  }

  // Stop any pending work when the page is left or restored from cache
  window.addEventListener('pagehide', function () {
    runId++;
    if (currentController) currentController.abort();
  });

  start();
});