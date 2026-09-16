/* Progressive enhancement only: content is fully visible without JavaScript.
   1. Reveals cards as they scroll into view (skipped when the user prefers reduced motion).
   2. Counts this page open anonymously: one GET to a free counter service (Abacus),
      key "qr-scans" when the URL carries ?s=qr (the printed QR code), otherwise "direct".
      No cookies, no personal data sent; the service only keeps a number.
   3. Runs the 15-minute claim countdown on the pint card. The start time is kept in
      localStorage so a reload or a scroll back up does not restart it; without
      JavaScript or storage the card simply says "within 15 minutes of scanning".
   No scroll hijacking. */
(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Reveal on scroll ----------
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
    var source = /[?&]s=qr(&|$)/.test(window.location.search)
      ? "qr-scans"
      : "direct";
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

  // ---------- 3. Claim countdown ----------
  var box = document.getElementById("claim");
  if (!box) {
    return;
  }

  var MINUTES = Number(box.getAttribute("data-minutes")) || 15;
  var WINDOW_MS = MINUTES * 60 * 1000;
  var STORE_KEY = "mukuru_claim_start_v1";

  function readStart() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var n = raw ? Number(raw) : 0;
      // Ignore anything absent, unparsable, in the future, or older than a day.
      if (!n || n > Date.now() || Date.now() - n > 86400000) {
        return null;
      }
      return n;
    } catch (e) {
      return null;
    }
  }

  function writeStart(n) {
    try {
      window.localStorage.setItem(STORE_KEY, String(n));
    } catch (e) {
      /* private mode */
    }
  }

  var start = readStart();
  if (start === null) {
    start = Date.now();
    writeStart(start);
  }

  // Build the countdown, replacing the no-JavaScript sentence.
  box.textContent = "";
  var label = document.createElement("p");
  label.className = "claim-label";

  var time = document.createElement("p");
  time.className = "claim-time";
  // The digits change every second; announcing each tick would flood a screen reader,
  // so the number itself is not a live region and milestones are announced separately.
  time.setAttribute("aria-hidden", "true");

  var note = document.createElement("p");
  note.className = "claim-note";

  var announce = document.createElement("p");
  announce.className = "visually-hidden";
  announce.setAttribute("role", "status");
  announce.setAttribute("aria-live", "polite");

  box.appendChild(label);
  box.appendChild(time);
  box.appendChild(note);
  box.appendChild(announce);

  var announced = {};

  function say(message) {
    if (announced[message]) {
      return;
    }
    announced[message] = true;
    announce.textContent = message;
  }

  function twoDigits(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function tick() {
    var left = start + WINDOW_MS - Date.now();

    if (left <= 0) {
      box.classList.remove("is-live");
      box.classList.add("is-expired");
      label.textContent = "Claim window finished";
      time.textContent = "00:00";
      note.textContent = "Please speak to the team — they can still help.";
      say(
        "The " +
          MINUTES +
          "-minute claim window has finished. Please speak to the team.",
      );
      if (timer !== null) {
        window.clearInterval(timer);
      }
      timer = 0; // already expired: never start a repeating tick
      return;
    }

    box.classList.add("is-live");
    var seconds = Math.ceil(left / 1000);
    label.textContent = "Claim within";
    time.textContent =
      twoDigits(Math.floor(seconds / 60)) + ":" + twoDigits(seconds % 60);
    note.textContent = "Your free pint is ready to claim.";

    if (seconds <= 60) {
      say("Less than one minute left to claim your free pint.");
    } else if (seconds <= 300) {
      say("Five minutes left to claim your free pint.");
    } else {
      say(MINUTES + " minutes to claim your free pint at the bar.");
    }
  }

  var timer = null;
  tick();
  if (timer === null) {
    timer = window.setInterval(tick, 1000);
  }

  // Phones pause timers in background tabs; re-sync as soon as the page is shown again.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      tick();
    }
  });
})();
