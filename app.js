/* Renders the board from projects.js. No dependencies, no build step. */

(function () {
  "use strict";

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var all = [];
  GROUPS.forEach(function (g) { g.items.forEach(function (i) { all.push(i); }); });

  /* ---- counts (derived, never hardcoded) ---- */
  var live = all.filter(function (i) { return i.state === "live"; });
  document.getElementById("count-total").textContent = all.length;
  document.getElementById("count-live").textContent = live.length;

  var delivered = GROUPS[0].items.filter(function (i) { return i.role.indexOf("Founder") !== 0; });
  document.getElementById("count-client").textContent = delivered.length;

  /* ---- fleet panel: only things with a real trigger ---- */
  /* the panel claims these run without me, so on-demand tools do not belong in it */
  var fleet = all.filter(function (i) { return i.trigger && i.trigger.indexOf("on demand") === -1; });
  document.getElementById("fleet-list").innerHTML = fleet.map(function (i) {
    return '<li class="fleet__item">' +
      '<span class="lamp lamp--' + i.state + '" aria-hidden="true"></span>' +
      '<span class="fleet__name">' + esc(i.name) + '</span>' +
      '<span class="fleet__trig">' + esc(i.trigger) + '</span>' +
      '</li>';
  }).join("");

  /* ---- stack table ---- */
  document.getElementById("stack-grid").innerHTML = STACK.map(function (r) {
    return '<div class="stack__row"><dt class="stack__dt">' + esc(r[0]) + '</dt>' +
      '<dd class="stack__dd">' + esc(r[1]) + '</dd></div>';
  }).join("");

  /* ---- board rows ---- */
  var n = 0;

  function section(label, text) {
    return '<h4 class="sub__h">' + label + '</h4><p class="row__over">' + esc(text) + '</p>';
  }

  function rowHTML(item) {
    n += 1;
    var idx = String(n).padStart(2, "0");
    var id = "row-" + n;
    return (
      '<article class="row row--' + item.state + '" data-state="' + item.state + '" data-open="false">' +
        '<h3 class="row__h">' +
        '<button class="row__btn" type="button" aria-expanded="false" aria-controls="' + id + '">' +
          '<span class="row__idx">' + idx + '</span>' +
          '<span class="row__name">' + esc(item.name) + '</span>' +
          '<span class="row__state">' +
            '<span class="lamp lamp--' + item.state + '" aria-hidden="true"></span>' +
            '<span class="lamp__text">' + esc(item.stateLabel) + '</span>' +
          '</span>' +
          '<span class="row__sum">' + esc(item.summary) + '</span>' +
          '<span class="row__meta">' +
            '<span class="row__role">' + esc(item.role) + ' · ' + esc(item.period) + '</span>' +
            (item.trigger ? '<span class="trig">' + esc(item.trigger) + '</span>' : "") +
          '</span>' +
          '<span class="row__open" aria-hidden="true">Detail</span>' +
        '</button></h3>' +
        '<div class="row__panel" id="' + id + '">' +
          '<div class="row__panelin"><div class="row__body">' +
            '<div>' +
              section("The problem", item.problem) +
              section("What I built", item.solution) +
              section("Approach", item.approach) +
            '</div>' +
            '<div>' +
              '<h4 class="sub__h">Agents and components</h4>' +
              '<ul class="agents">' + item.agents.map(function (a) {
                return "<li>" + esc(a) + "</li>";
              }).join("") + '</ul>' +
              '<h4 class="sub__h">Skills developed</h4>' +
              '<p class="skills">' + esc(item.skills.join(" · ")) + '</p>' +
              '<h4 class="sub__h">Stack</h4>' +
              '<ul class="chips">' + item.stack.map(function (s) {
                return '<li class="chip">' + esc(s) + "</li>";
              }).join("") + '</ul>' +
            '</div>' +
          '</div></div>' +
        '</div>' +
      '</article>'
    );
  }

  document.getElementById("rows").innerHTML = GROUPS.map(function (g) {
    return '<section class="grp" data-group="' + g.id + '">' +
      '<div class="grp__head">' +
        '<h2 class="grp__label">' + esc(g.label) + '</h2>' +
        '<p class="grp__note">' + esc(g.note) + '</p>' +
      '</div>' +
      g.items.map(rowHTML).join("") +
      '</section>';
  }).join("");

  /* ---- expand / collapse ---- */
  document.getElementById("rows").addEventListener("click", function (e) {
    var btn = e.target.closest(".row__btn");
    if (!btn) return;
    var row = btn.closest(".row");
    var open = row.dataset.open === "true";
    row.dataset.open = open ? "false" : "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
  });

  /* ---- state filter ---- */
  var filters = document.querySelectorAll(".filter");
  var empty = document.getElementById("empty");

  function applyFilter(state) {
    var shown = 0;
    document.querySelectorAll(".row").forEach(function (row) {
      var match = state === "all" || row.dataset.state === state;
      row.hidden = !match;
      if (match) shown += 1;
      if (!match && row.dataset.open === "true") {
        row.dataset.open = "false";
        row.querySelector(".row__btn").setAttribute("aria-expanded", "false");
      }
    });
    document.querySelectorAll(".grp").forEach(function (grp) {
      var any = grp.querySelector('.row:not([hidden])');
      grp.hidden = !any;
    });
    empty.hidden = shown > 0;
  }

  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      filters.forEach(function (o) { o.classList.toggle("is-on", o === f); });
      applyFilter(f.dataset.filter);
    });
  });

  /* ---- scroll reveal ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    document.querySelectorAll(".grp__head, .row, .stack__in, .contact__in").forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  requestAnimationFrame(function () { document.body.classList.add("is-ready"); });
})();
