// Modern micro-interactions: cursor spotlight, magnetic buttons,
// pointer-tracked card glow, scroll-driven nav + timeline progress,
// view-transition-friendly re-init hook.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Cursor glow follow ---------- */
export function initCursorGlow() {
  const el = document.querySelector(".cursor-glow");
  if (!el || reduce) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const tick = () => {
    x += (tx - x) * 0.15; y += (ty - y) * 0.15;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ---------- Magnetic buttons ---------- */
export function initMagnetic(scope = document) {
  if (reduce) return;
  scope.querySelectorAll("[data-magnetic]").forEach((btn) => {
    if (btn.__magnetic) return;
    btn.__magnetic = true;
    const strength = 18;
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      btn.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}

/* ---------- Pointer-tracked glow on cards / steps ---------- */
export function initSurfaceGlow(scope = document) {
  scope.querySelectorAll(".step, .tl-card, .about__grid > div").forEach((el) => {
    if (el.__glow) return;
    el.__glow = true;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* ---------- Sticky nav shadow on scroll ---------- */
export function initNavScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Timeline scroll progress line ---------- */
export function initTimelineProgress() {
  const tl = document.querySelector(".timeline");
  if (!tl) return;
  const update = () => {
    const r = tl.getBoundingClientRect();
    const total = r.height + innerHeight * 0.5;
    const scrolled = Math.min(Math.max(-r.top + innerHeight * 0.5, 0), total);
    tl.style.setProperty("--tl-progress", `${(scrolled / total) * 100}%`);
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  requestAnimationFrame(update);
}

/* ---------- Re-init effects after route changes ---------- */
export function refreshFx() {
  initMagnetic();
  initSurfaceGlow();
  initTimelineProgress();
}
