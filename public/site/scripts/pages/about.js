export function renderAbout(app) {
  const tpl = document.getElementById("tpl-about");
  app.appendChild(tpl.content.cloneNode(true));
}
