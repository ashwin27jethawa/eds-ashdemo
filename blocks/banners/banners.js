export default function decorate(block) {
  if (window.location.origin.includes("author-p")) {
    return false;
  }
  const banners = [...block.children];
  block.textContent = "";

  const sliderWrapper = document.createElement("div");
  sliderWrapper.classList.add("slider-wrapper");

  banners.forEach((row, i) => {
    const slide = document.createElement("div");
    slide.classList.add("slide");
    if (i === 0) slide.classList.add("active");
    slide.append(...row.children);

    sliderWrapper.append(slide);
  });

  block.append(sliderWrapper);

  const moveSlide = (direction = "next") => {
    const active = sliderWrapper.querySelector(".slide.active");
    active.classList.remove("active");
    let target;
    if (direction === "next") {
      target = active.nextElementSibling || sliderWrapper.firstElementChild;
    } else {
      target = active.previousElementSibling || sliderWrapper.lastElementChild;
    }
    target.classList.add("active");
  };

  const slideDelay = 3000;
  let autoSlideInterval = setInterval(() => moveSlide("next"), slideDelay);

  const stopAuto = () => clearInterval(autoSlideInterval);
  const startAuto = () => {
    stopAuto();
    autoSlideInterval = setInterval(() => moveSlide("next"), slideDelay);
  };

  block.addEventListener("mouseenter", stopAuto);
  block.addEventListener("mouseleave", startAuto);

  let startX = 0;
  let isDragging = false;

  const handleStart = (e) => {
    stopAuto();
    isDragging = true;
    startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    const endX = e.type.includes("touch")
      ? e.changedTouches[0].clientX
      : e.clientX;
    const distance = startX - endX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) moveSlide("next");
      else moveSlide("prev");
    }

    isDragging = false;
    startAuto();
  };

  sliderWrapper.addEventListener("mousedown", handleStart);
  window.addEventListener("mouseup", handleEnd);

  sliderWrapper.addEventListener("touchstart", handleStart, { passive: true });
  sliderWrapper.addEventListener("touchend", handleEnd, { passive: true });
}
