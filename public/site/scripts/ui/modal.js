import { store } from "../storage.js";
import { toast } from "./toast.js";
import { formatDate, timeUntil } from "../utils/date.js";
import { mountSlider } from "./slider.js";

export function initModal() {
  const modal = document.getElementById("modal");
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
}

let lastFocus = null;

export function openCapsule(id) {
  const c = store.get(id);
  if (!c) return toast("Capsule not found");
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  const sealed = store.isSealed(c);

  body.innerHTML = `
    <div class="modal__body">
      <div class="capsule-detail__meta">
        <span>${formatDate(c.createdAt)}</span>
        <span>·</span>
        <span>${sealed ? "opens " + timeUntil(c.unsealAt) : "open"}</span>
      </div>
      <h2 id="modal-title" class="capsule-detail__title">${escapeHtml(c.title)}</h2>
      ${sealed
        ? `<div class="capsule-detail__sealed">
             <svg viewBox="0 0 48 48" width="64" height="64" aria-hidden="true">
               <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.15"/>
               <circle cx="24" cy="24" r="12" fill="currentColor"/>
               <path d="M24 18v12M18 24h12" stroke="var(--bg-elev)" stroke-width="2" stroke-linecap="round"/>
             </svg>
             <p>This capsule is sealed until <strong>${formatDate(c.unsealAt)}</strong>.</p>
             <p class="muted small">Come back then. Or break the seal early if you must.</p>
             <div class="capsule-detail__actions" style="justify-content:center">
               <button class="btn btn--ghost" data-action="break">Break seal early</button>
             </div>
           </div>`
        : `${c.images?.length ? `<div class="slider" data-slider></div>` : ""}
           <p class="capsule-detail__body">${escapeHtml(c.body)}</p>
           <div class="tl-card__tags">
             ${(c.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
           </div>`}
      <div class="capsule-detail__actions">
        <button class="btn btn--ghost" data-action="share">Copy share link</button>
        <button class="btn btn--ghost" data-action="print">Print</button>
        <button class="btn btn--ghost" data-action="delete" style="color:var(--danger)">Delete</button>
      </div>
    </div>
  `;

  const sliderEl = body.querySelector("[data-slider]");
  if (sliderEl && c.images?.length) mountSlider(sliderEl, c.images);

  body.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn.dataset.action, c));
  });

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  lastFocus = document.activeElement;
  setTimeout(() => body.querySelector("h2")?.focus?.(), 40);
  document.body.style.overflow = "hidden";
}

function close() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocus?.focus?.();
}

function handleAction(action, c) {
  if (action === "share") {
    const url = `${location.origin}${location.pathname}#/timeline?c=${c.id}`;
    navigator.clipboard.writeText(url).then(() => toast("Link copied"));
  } else if (action === "print") {
    window.print();
  } else if (action === "delete") {
    if (confirm(`Delete "${c.title}"? This cannot be undone.`)) {
      store.remove(c.id); close(); toast("Capsule deleted");
      if (location.hash.startsWith("#/timeline")) location.reload();
    }
  } else if (action === "break") {
    if (confirm("Break the seal early?")) {
      store.update(c.id, { unsealAt: new Date().toISOString() });
      toast("Seal broken");
      openCapsule(c.id);
    }
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
