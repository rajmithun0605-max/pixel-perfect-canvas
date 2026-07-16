import { store } from "../storage.js";
import { openCapsule } from "./modal.js";
import { debounce } from "../utils/dom.js";

export function initSearch() {
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  document.getElementById("search-toggle").addEventListener("click", openSearch);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeSearch();
  });

  const run = debounce(() => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ""; return; }
    const matches = store.all().filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.body.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(q))
    ).slice(0, 8);
    results.innerHTML = matches.length
      ? matches.map((c) => `
        <button class="search-result" data-id="${c.id}">
          <h4>${escapeHtml(c.title)}</h4>
          <p>${escapeHtml(store.isSealed(c) ? "Sealed capsule" : c.body.slice(0, 90))}</p>
        </button>`).join("")
      : `<p class="search-hint">No matches for "${escapeHtml(q)}"</p>`;
    results.querySelectorAll(".search-result").forEach((el) => {
      el.addEventListener("click", () => { closeSearch(); openCapsule(el.dataset.id); });
    });
  }, 120);

  input.addEventListener("input", run);
}

export function openSearch() {
  const overlay = document.getElementById("search-overlay");
  overlay.hidden = false;
  setTimeout(() => document.getElementById("search-input").focus(), 30);
}
export function closeSearch() {
  document.getElementById("search-overlay").hidden = true;
  document.getElementById("search-input").value = "";
  document.getElementById("search-results").innerHTML = "";
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
