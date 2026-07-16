export function mountSlider(el, images) {
  let index = 0;
  el.innerHTML = `
    <div class="slider__track">
      ${images.map((src) => `<div class="slider__slide"><img src="${src}" alt="" loading="lazy" /></div>`).join("")}
    </div>
    ${images.length > 1 ? `
      <button class="slider__nav prev" aria-label="Previous">‹</button>
      <button class="slider__nav next" aria-label="Next">›</button>
      <div class="slider__dots">${images.map((_, i) => `<button class="slider__dot" data-i="${i}" aria-label="Slide ${i+1}"></button>`).join("")}</div>
    ` : ""}
  `;
  const track = el.querySelector(".slider__track");
  const dots = el.querySelectorAll(".slider__dot");
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  };
  el.querySelector(".prev")?.addEventListener("click", () => { index = (index - 1 + images.length) % images.length; update(); });
  el.querySelector(".next")?.addEventListener("click", () => { index = (index + 1) % images.length; update(); });
  dots.forEach((d) => d.addEventListener("click", () => { index = Number(d.dataset.i); update(); }));

  // Touch swipe
  let startX = 0;
  track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { index = (index + (dx < 0 ? 1 : -1) + images.length) % images.length; update(); }
  });

  // Keyboard
  el.tabIndex = 0;
  el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { index = (index - 1 + images.length) % images.length; update(); }
    if (e.key === "ArrowRight") { index = (index + 1) % images.length; update(); }
  });

  update();
}
