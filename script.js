(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Active nav link ---------- */
  const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Terminal typing animation ---------- */
  const term = document.getElementById("term");
  const suites = [
    ["Java (OOP, Collections)", "PASSED"],
    ["Selenium WebDriver / Selenide", "PASSED"],
    ["TestNG + Page Object Model", "PASSED"],
    ["Allure reporting", "PASSED"],
    ["Pairwise test design", "PASSED"],
    ["Defect hunting (95+ logged)", "PASSED"],
  ];
  const pad = (s, n) => s + " " + ".".repeat(Math.max(2, n - s.length)) + " ";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const finalHTML = () => {
    let h = `<span class="prompt">$</span> <span class="cmd">./gradlew test --tests "PortfolioSuite"</span>\n`;
    h += `<span class="dimtxt">&gt; Task :test</span>\n\n`;
    suites.forEach(([n, r]) => (h += `<span class="pass">✓</span> ${esc(pad(n, 32))}<span class="pass">${r}</span>\n`));
    h += `\n<span class="ok">BUILD SUCCESSFUL</span> <span class="dimtxt">· ${suites.length} passed, 0 failed</span>\n`;
    h += `<span class="dimtxt">Report: allure-report/index.html</span>\n\n<span class="prompt">$</span> <span class="cursor"></span>`;
    return h;
  };

  if (term) {
    if (reduceMotion) {
      term.innerHTML = finalHTML();
    } else {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      (async () => {
        const cmd = './gradlew test --tests "PortfolioSuite"';
        let out = `<span class="prompt">$</span> <span class="cmd">`;
        for (const ch of cmd) {
          out += esc(ch);
          term.innerHTML = out + `</span><span class="cursor"></span>`;
          await sleep(38);
        }
        out += `</span>\n<span class="dimtxt">&gt; Task :test</span>\n\n`;
        term.innerHTML = out;
        await sleep(400);
        for (const [n, r] of suites) {
          term.innerHTML = out + `<span class="run">⟳</span> ${esc(pad(n, 32))}<span class="run">RUNNING</span>`;
          await sleep(420);
          out += `<span class="pass">✓</span> ${esc(pad(n, 32))}<span class="pass">${r}</span>\n`;
          term.innerHTML = out;
        }
        await sleep(300);
        term.innerHTML = finalHTML();
      })();
    }
  }

  /* ---------- Tabs (Experience) ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      let j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      if (j !== null) { e.preventDefault(); tabs[j].focus(); select(tabs[j]); }
    });
  });

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const countUp = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now(), dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(".section h2, .card, .job, .timeline li, .prose, .stats");
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in-view");
        if (en.target.classList.contains("stats")) counters.forEach(countUp);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));
})();
