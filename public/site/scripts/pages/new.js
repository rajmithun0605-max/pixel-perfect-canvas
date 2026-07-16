import { store } from "../storage.js";
import { navigate } from "../router.js";
import { toast } from "../ui/toast.js";

export function renderNew(app) {
  const tpl = document.getElementById("tpl-new");
  app.appendChild(tpl.content.cloneNode(true));

  const form = document.getElementById("new-form");
  const stepper = document.getElementById("stepper");
  const panels = form.querySelectorAll(".step-panel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const charCount = document.getElementById("char-count");

  let step = 1;
  let images = []; // dataURL strings

  const setStep = (n) => {
    step = Math.max(1, Math.min(3, n));
    panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.step) === step));
    stepper.querySelectorAll("li").forEach((li, i) => {
      li.classList.toggle("is-active", i + 1 === step);
      li.classList.toggle("is-done", i + 1 < step);
    });
    prevBtn.disabled = step === 1;
    nextBtn.hidden = step === 3;
    submitBtn.hidden = step !== 3;
    if (step === 3) updatePreview();
  };

  const bodyEl = form.querySelector('textarea[name="body"]');
  bodyEl.addEventListener("input", () => { charCount.textContent = bodyEl.value.length; });

  // Validation
  const validateStep = () => {
    const invalid = [];
    if (step === 1) {
      const title = form.title.value.trim();
      const body = form.body.value.trim();
      if (!title) invalid.push({ el: form.title, msg: "Give this capsule a title." });
      if (body.length < 20) invalid.push({ el: form.body, msg: "Write at least 20 characters." });
    }
    if (step === 3) {
      const date = form.unsealAt.value;
      if (!date) invalid.push({ el: form.unsealAt, msg: "Pick an unseal date." });
      else if (new Date(date) < new Date(new Date().toDateString())) invalid.push({ el: form.unsealAt, msg: "Date must be today or later." });
      if (!form.confirm.checked) invalid.push({ el: form.confirm, msg: "Please confirm." });
    }
    // Clear old
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
    form.querySelectorAll("[data-error]").forEach((e) => (e.textContent = ""));
    for (const { el, msg } of invalid) {
      const field = el.closest(".field");
      field?.classList.add("has-error");
      const errEl = field?.querySelector("[data-error]");
      if (errEl) errEl.textContent = msg;
    }
    if (invalid[0]) invalid[0].el.focus();
    return invalid.length === 0;
  };

  prevBtn.addEventListener("click", () => setStep(step - 1));
  nextBtn.addEventListener("click", () => { if (validateStep()) setStep(step + 1); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    const capsule = {
      title: form.title.value.trim(),
      body: form.body.value.trim(),
      tags: form.tags.value.split(",").map((t) => t.trim()).filter(Boolean),
      images,
      unsealAt: new Date(form.unsealAt.value).toISOString(),
    };
    store.add(capsule);
    toast("Capsule sealed 🔒");
    navigate("/timeline");
  });

  // Image upload
  const dz = document.getElementById("dropzone");
  const fi = document.getElementById("file-input");
  document.getElementById("browse-btn").addEventListener("click", () => fi.click());
  dz.addEventListener("click", (e) => { if (e.target === dz || e.target.tagName === "P") fi.click(); });
  dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fi.click(); } });
  ["dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("is-drag"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove("is-drag")));
  dz.addEventListener("drop", (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
  fi.addEventListener("change", (e) => handleFiles(e.target.files));

  async function handleFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 2 * 1024 * 1024) { toast(`${file.name} is over 2MB`); continue; }
      const dataURL = await new Promise((res) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file);
      });
      images.push(dataURL);
    }
    paintThumbs();
  }

  function paintThumbs() {
    const wrap = document.getElementById("thumbs");
    wrap.innerHTML = images.map((src, i) => `
      <div class="thumb"><img src="${src}" alt="" /><button type="button" data-i="${i}" aria-label="Remove">×</button></div>
    `).join("");
    wrap.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      images.splice(Number(b.dataset.i), 1); paintThumbs();
    }));
  }

  function updatePreview() {
    document.getElementById("pv-title").textContent = form.title.value.trim() || "Untitled";
    document.getElementById("pv-body").textContent = form.body.value.trim() || "Your letter will appear here.";
    const date = form.unsealAt.value;
    const tags = form.tags.value.split(",").map((t) => t.trim()).filter(Boolean);
    document.getElementById("pv-meta").textContent =
      (date ? `Opens ${new Date(date).toLocaleDateString(undefined, { dateStyle: "long" })}` : "No date yet") +
      (tags.length ? ` · ${tags.map(t => `#${t}`).join(" ")}` : "");
  }

  // Default date = 1 year from today
  const d = new Date(); d.setFullYear(d.getFullYear() + 1);
  form.unsealAt.value = d.toISOString().slice(0, 10);
  form.unsealAt.min = new Date().toISOString().slice(0, 10);

  setStep(1);
}
