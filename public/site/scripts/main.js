// Chrona — entry point. Wires router, loader, theme, search, modal, footer.
import { initTheme } from "./ui/theme.js";
import { initRouter, navigate } from "./router.js";
import { initSearch, openSearch } from "./ui/search.js";
import { initModal, openCapsule } from "./ui/modal.js";
import { store } from "./storage.js";
import { toast } from "./ui/toast.js";
import { initCursorGlow, initNavScroll, refreshFx } from "./ui/fx.js";


// Loading screen — hide after first paint (skip delay on subsequent visits)
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const seen = sessionStorage.getItem("chrona:loaded");
  const delay = seen ? 200 : 900;
  setTimeout(() => {
    loader.classList.add("is-hidden");
    sessionStorage.setItem("chrona:loaded", "1");
  }, delay);
});

initTheme();
initSearch();
initModal();
initRouter();
initCursorGlow();
initNavScroll();
refreshFx();
// Refresh FX after every route change
addEventListener("hashchange", () => setTimeout(refreshFx, 30));


// Deep-link: open capsule from ?c=<id>
const params = new URLSearchParams(location.hash.split("?")[1] || "");
const cid = params.get("c");
if (cid) setTimeout(() => openCapsule(cid), 500);

// Footer: export / import
document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(store.all(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `chrona-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Archive exported");
});

document.getElementById("import-input").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Invalid file");
    store.import(data);
    toast(`Imported ${data.length} capsules`);
    if (location.hash.startsWith("#/timeline")) navigate("/timeline");
  } catch (err) {
    toast("Import failed — invalid file");
  } finally {
    e.target.value = "";
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  if (e.key === "/") { e.preventDefault(); openSearch(); }
  if (e.key.toLowerCase() === "n") { navigate("/new"); }
  if (e.key.toLowerCase() === "t") { navigate("/timeline"); }
  if (e.key.toLowerCase() === "h") { navigate("/"); }
});
