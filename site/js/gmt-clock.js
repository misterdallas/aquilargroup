/**
 * Live GMT wall clock (UTC) — same reference as https://time.is/GMT
 * Uses Date#toISOString so the value is always true UTC, never page elapsed time.
 */
(function () {
  "use strict";

  function formatGmt(date) {
    // ISO is always UTC: "2026-08-08T17:34:51.123Z" → "17:34:51"
    return date.toISOString().slice(11, 19);
  }

  function tick() {
    var text = "LOG " + formatGmt(new Date()) + " GMT";
    var nodes = document.querySelectorAll("[data-gmt-clock]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = text;
    }
  }

  tick();
  setInterval(tick, 1000);
})();
