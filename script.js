
/* ==========================================================
   Jasim Hamza & Fathima Safa Kunnil — Nikah Invitation
   ========================================================== */
(function () {
  "use strict";

  /* 5:00 PM India Standard Time (Asia/Kolkata, UTC+5:30) on
     19 December 2026 is 11:30 UTC. Using UTC means the countdown
     is correct on every phone, whatever its own time zone. */
  var WEDDING_TIME = Date.UTC(2026, 11, 19, 11, 30, 0); // month 11 = December

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var body = document.body;
  var opening = document.getElementById("opening");
  var openBtn = document.getElementById("openBtn");
  var invitation = document.getElementById("invitation");
  var audio = document.getElementById("bgMusic");
  var musicBtn = document.getElementById("musicBtn");

  /* ---------- Opening envelope ---------- */
  function openInvitation() {
    openBtn.disabled = true;
    opening.classList.add("is-open");
    startMusic(); // must run inside the click so browsers allow sound

    var t = reduceMotion ? 0 : 2300;
    setTimeout(function () {
      window.scrollTo(0, 0);
      opening.classList.add("is-leaving");
      body.classList.remove("is-locked");
      invitation.removeAttribute("aria-hidden");
      invitation.classList.add("is-visible");
      document.querySelectorAll(".hero .reveal").forEach(function (el) { el.classList.add("is-in"); });
    }, t);

    setTimeout(function () { opening.remove(); }, t + 1300);
  }
  openBtn.addEventListener("click", openInvitation);

  /* ---------- Countdown ---------- */
  var nums = {};
  document.querySelectorAll(".timer__num").forEach(function (el) { nums[el.dataset.unit] = el; });
  var timerDone = document.getElementById("timerDone");
  var timer = document.getElementById("timer");
  var tick;

  function pad(n, len) { n = String(n); while (n.length < len) n = "0" + n; return n; }

  function updateCountdown() {
    var diff = WEDDING_TIME - Date.now();
    if (diff <= 0) {
      clearInterval(tick);
      timer.hidden = true;
      timerDone.hidden = false;
      return;
    }
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    nums.days.textContent = pad(days, days > 99 ? 3 : 2);
    nums.hours.textContent = pad(Math.floor((s % 86400) / 3600), 2);
    nums.minutes.textContent = pad(Math.floor((s % 3600) / 60), 2);
    nums.seconds.textContent = pad(s % 60, 2);
  }
  updateCountdown();
  tick = setInterval(updateCountdown, 1000);
  // Phones pause timers in background tabs; refresh straight away on return.
  document.addEventListener("visibilitychange", function () { if (!document.hidden) updateCountdown(); });

  /* ---------- Optional background music ----------
     Plays assets/background-music.mp3 if it exists. If the file is
     missing, the music button simply stays hidden.               */
  var musicAvailable = true;

  function setPlaying(playing) {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  }

  function hideMusic() {
    musicAvailable = false;
    musicBtn.hidden = true;
  }

  function startMusic() {
    if (!musicAvailable) return;
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        musicBtn.hidden = false;
        setPlaying(true);
      }).catch(function (err) {
        // NotAllowedError: the browser blocked sound — let the guest tap to play.
        if (err && err.name === "NotAllowedError") { musicBtn.hidden = false; setPlaying(false); }
        else hideMusic(); // file missing or unsupported
      });
    }
  }

  audio.addEventListener("error", hideMusic);
  audio.addEventListener("pause", function () { setPlaying(false); });
  audio.addEventListener("play", function () { setPlaying(true); });

  musicBtn.addEventListener("click", function () {
    if (audio.paused) startMusic();
    else audio.pause();
  });

  /* ---------- Gentle fade-in while scrolling ---------- */
  var revealEls = document.querySelectorAll("section:not(.hero) .reveal, footer .reveal, .venue__card");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }
})();