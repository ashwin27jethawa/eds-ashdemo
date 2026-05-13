export default function decorate(block) {
  if (window.location.origin.includes("author-p")) {
    return false;
  }

  const banners = [...block.children];
  block.textContent = "";

  const sliderWrapper = document.createElement("div");
  sliderWrapper.classList.add("slider-wrapper");

  banners.forEach((row) => {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    slide.append(...row.children);
    sliderWrapper.append(slide);
  });

  block.append(sliderWrapper);

  let currentIndex = 0;
  const slides = sliderWrapper.querySelectorAll(".slide");
  const totalSlides = slides.length;

  const updateSlides = () => {
    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
    });
  };

  updateSlides();

  const moveSlide = (direction = "next") => {
    if (direction === "next") {
      currentIndex = (currentIndex + 1) % totalSlides;
    } else {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    }

    updateSlides();
  };

  const slideDelay = 4000;
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
    startX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;
  };

  const handleEnd = (e) => {
    if (!isDragging) return;

    const endX = e.type.includes("touch")
      ? e.changedTouches[0].clientX
      : e.clientX;

    const distance = startX - endX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        moveSlide("next");
      } else {
        moveSlide("prev");
      }
    }

    isDragging = false;
    startAuto();
  };

  sliderWrapper.addEventListener("mousedown", handleStart);
  window.addEventListener("mouseup", handleEnd);

  sliderWrapper.addEventListener("touchstart", handleStart, {
    passive: true,
  });

  sliderWrapper.addEventListener("touchend", handleEnd, {
    passive: true,
  });
}