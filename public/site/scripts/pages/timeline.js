import { store } from "../storage.js";
import { openCapsule } from "../ui/modal.js";
import { formatDate, timeUntil } from "../utils/date.js";

let currentFilter = "all";

export function renderTimeline(app) {
  const tpl = document.getElementById("tpl-timeline");
  app.appendChild(tpl.content.cloneNode(true));

  const filters = app.querySelector("#tl-filters");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    paint();
  });

  paint();
}

function paint() {
  const wrap = document.getElementById("timeline");
  const empty = document.getElementById("empty");
  const count = document.getElementById("tl-count");
  if (!wrap) return;
  wrap.innerHTML = "";

  const all = store.all();
  const list = all.filter((c) => {
    if (currentFilter === "sealed") return store.isSealed(c);
    if (currentFilter === "open") return !store.isSealed(c);
    return true;
  });

  count.textContent = `${all.length} capsule${all.length === 1 ? "" : "s"} · ${all.filter(store.isSealed).length} sealed`;

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const c of list) {
    const sealed = store.isSealed(c);
    const item = document.createElement("div");
    item.className = "tl-item" + (sealed ? " is-sealed" : "");
    item.innerHTML = `
      <button class="tl-card" aria-label="Open ${escapeHtml(c.title)}">
        <div class="tl-card__meta">
          ${sealed
            ? `<span class="seal-icon" title="Sealed">🔒</span><span class="countdown">opens ${timeUntil(c.unsealAt)}</span>`
            : `<span class="badge">open</span><span>${formatDate(c.createdAt)}</span>`}
        </div>
        <h3 class="tl-card__title">${escapeHtml(c.title)}</h3>
        <p class="tl-card__excerpt">${sealed ? "This capsule is sealed until " + formatDate(c.unsealAt) + "." : escapeHtml(c.body)}</p>
        <div class="tl-card__tags">
          ${(c.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </button>
    `;
    item.querySelector(".tl-card").addEventListener("click", () => openCapsule(c.id));
    wrap.appendChild(item);
  }

  // Re-run reveal observer
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }, { rootMargin: "-30px" });
  wrap.querySelectorAll(".tl-item").forEach((el) => io.observe(el));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
