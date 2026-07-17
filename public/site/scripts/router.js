// Hash-based router. Renders the right page template into #app.
import { renderHome } from "./pages/home.js";
import { renderTimeline } from "./pages/timeline.js";
import { renderNew } from "./pages/new.js";
import { renderAbout } from "./pages/about.js";

const routes = {
  "/": renderHome,
  "/timeline": renderTimeline,
  "/new": renderNew,
  "/about": renderAbout,
};

export function navigate(path) {
  if (location.hash === `#${path}`) {
    render();
  } else {
    location.hash = `#${path}`;
  }
}

function currentPath() {
  const h = location.hash.replace(/^#/, "").split("?")[0] || "/";
  return h;
}

function render() {
  const doRender = () => {
    const path = currentPath();
    const view = routes[path];
    const app = document.getElementById("app");
    app.innerHTML = "";
    if (view) {
      view(app);
    } else {
      const tpl = document.getElementById("tpl-404");
      app.appendChild(tpl.content.cloneNode(true));
    }
    document.querySelectorAll(".nav__links a").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.route === path);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    app.focus({ preventScroll: true });
    observeReveals();
  };

  // View Transitions API for smooth cross-fades between pages
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(doRender);
  } else {
    doRender();
  }
}


let io;
function observeReveals() {
  io?.disconnect();
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: "-40px" });
  document.querySelectorAll(".reveal, .tl-item").forEach((el) => io.observe(el));
}

export function initRouter() {
  window.addEventListener("hashchange", render);
  render();
}
