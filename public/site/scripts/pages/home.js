export function renderHome(app) {
  const tpl = document.getElementById("tpl-home");
  app.appendChild(tpl.content.cloneNode(true));
}
