/*
  Winny French analytics loader (Plausible).

  Plausible is cookie-free: no cookies, no local storage, no personal data.
  It records the source of each visit on its own (utm_source, utm_medium,
  utm_campaign and the referring site, for example chatgpt.com or google).

  ONE THING TO EDIT: after adding winnyfrench.com in Plausible, open
  Site settings > Site installation and copy the script URL that looks like
  https://plausible.io/js/pa-XXXXXXXX.js into PLAUSIBLE_SRC below.
  Until then the standard script with data-domain is used, which also works
  once the site exists in your Plausible account.

  Conversions (set these up as Goals in Plausible > Site settings > Goals):
    "Trial request"        free-trial / book-a-class form submitted
    "Lead magnet sign-up"  free guide (lead magnet) form submitted
  Each conversion carries these custom properties (add them in
  Site settings > Custom properties so they show in the dashboard):
    landing_page  first page of the visit (the page the visitor landed on)
    form_page     page the form was submitted from
    form_id       which form on that page
    magnet        which free guide (lead magnet forms only)
*/
(function () {
  var PLAUSIBLE_SRC = 'https://plausible.io/js/pa-E89r0pXEl-ZB2o-O9rKi0.js';
  var DOMAIN = 'winnyfrench.com';

  // Queue stub, so events fired before the script loads are not lost.
  var p = window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  p.init = p.init || function (o) { p.o = o || {}; };

  var siteSpecific = /\/pa-[^\/]+\.js$/.test(PLAUSIBLE_SRC);
  if (siteSpecific) { p.init(); }

  var s = document.createElement('script');
  s.async = true;
  s.src = PLAUSIBLE_SRC;
  if (!siteSpecific) { s.setAttribute('data-domain', DOMAIN); }
  document.head.appendChild(s);

  // First page of this visit, kept for this browser tab only (sessionStorage,
  // cleared when the tab closes). Used to break conversions down by landing page.
  var landing = location.pathname;
  try {
    var saved = sessionStorage.getItem('wf_lp');
    if (saved) { landing = saved; } else { sessionStorage.setItem('wf_lp', landing); }
  } catch (e) {}

  // wfTrack(goal, form): sends a conversion and resolves when it has been sent
  // (or after 1 second at most), so a page can safely redirect afterwards.
  window.wfTrack = function (goal, form) {
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      var props = { landing_page: landing, form_page: location.pathname };
      if (form) {
        if (form.id) { props.form_id = form.id; }
        if (form.dataset && form.dataset.magnet) { props.magnet = form.dataset.magnet; }
      }
      try { window.plausible(goal, { props: props, callback: finish }); } catch (e) {}
      setTimeout(finish, 1000);
    });
  };
})();
