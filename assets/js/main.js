/* Progressive enhancement only: content is fully visible without JavaScript.
   1. Reveals cards as they scroll into view (skipped when the user prefers reduced motion).
   2. Counts this page open anonymously: one GET to a free counter service (Abacus),
      key "qr" when the URL carries ?s=qr (the printed QR code), otherwise "direct".
      No cookies, no local storage, no personal data sent; the service only keeps a number.
   No scroll hijacking. */
(function () {
  "use strict";

  // ---------- 1. Reveal on scroll ----------
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    items.forEach(function (el) {
      el.classList.add("in");
    });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
    // Safety net: if anything prevents observation, make sure nothing stays hidden.
    window.setTimeout(showAll, 4000);
  }

  // ---------- 2. Anonymous open counter ----------
  var COUNTER_NAMESPACE = "mukuru-sixx-welcome-7d3f9a";
  var COUNTER_BASE =
    "https://abacus.jasoncameron.dev/hit/" + COUNTER_NAMESPACE + "/";

  try {
    var source = /[?&]s=qr(&|$)/.test(window.location.search) ? "qr-scans" : "direct";
    if (window.fetch) {
      window
        .fetch(COUNTER_BASE + source, {
          mode: "no-cors",
          cache: "no-store",
          keepalive: true,
        })
        .catch(function () {
          /* counting is best-effort; never affect the page */
        });
    }
  } catch (e) {
    /* ignore */
  }
})();
