import { moveInstrumentation } from "../../scripts/scripts.js";
import { loadCSS } from "../../scripts/aem.js";
// import embedV1 from "../../embed-v1/embed-v1.js";
import embedV1 from "../embed-v1/embed-v1.js";

const DEFAULT_AUTO_ROTATE_SECONDS = 5;
const MIN_AUTO_ROTATE_SECONDS = 1;

function getAutoRotateDelayMs(block) {
  const section = block.closest(".section");
  const configuredSeconds =
    section?.dataset.carouselSectionSeconds ||
    block.dataset.autoplaySeconds ||
    block.dataset.carouselAutoplaySeconds ||
    block.dataset.slideTimerSeconds;

  const parsedSeconds = Number.parseFloat(configuredSeconds);
  const validSeconds =
    Number.isFinite(parsedSeconds) && parsedSeconds >= MIN_AUTO_ROTATE_SECONDS
      ? parsedSeconds
      : DEFAULT_AUTO_ROTATE_SECONDS;

  return validSeconds * 1000;
}

function updateActiveSlide(slide) {
  const block = slide.closest(".carousel");
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll(".carousel-slide").forEach((aSlide, idx) => {
    aSlide.setAttribute("aria-hidden", idx !== slideIndex);
    aSlide.querySelectorAll("a").forEach((link) => {
      if (idx !== slideIndex) link.setAttribute("tabindex", "-1");
      else link.removeAttribute("tabindex");
    });
  });

  block
    .querySelectorAll(".carousel-slide-indicator")
    .forEach((indicator, idx) => {
      const btn = indicator.querySelector("button");
      if (idx !== slideIndex) {
        btn.removeAttribute("disabled");
        btn.removeAttribute("aria-current");
      } else {
        btn.setAttribute("disabled", "true");
        btn.setAttribute("aria-current", "true");
      }
    });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll(".carousel-slide");
  let realIdx = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (realIdx >= slides.length) realIdx = 0;
  const activeSlide = slides[realIdx];
  activeSlide
    .querySelectorAll("a")
    .forEach((link) => link.removeAttribute("tabindex"));
  block.querySelector(".carousel-slides").scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: "smooth",
  });
}

function bindEvents(block, autoRotateDelayMs) {
  // Auto-rotate functions
  function startAutoRotate() {
    // Clear any existing interval
    if (block.carouselInterval) clearInterval(block.carouselInterval);

    block.carouselInterval = setInterval(() => {
      const currentSlide = parseInt(block.dataset.activeSlide || 0, 10);
      const totalSlides = block.querySelectorAll(".carousel-slide").length;
      const nextSlide = (currentSlide + 1) % totalSlides;
      showSlide(block, nextSlide);
    }, autoRotateDelayMs);
  }

  function stopAutoRotate() {
    if (block.carouselInterval) {
      clearInterval(block.carouselInterval);
      block.carouselInterval = null;
    }
  }

  // Indicator button click: pause, navigate, resume after delay
  block.querySelectorAll(".carousel-slide-indicator button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      stopAutoRotate();
      const indicator = e.currentTarget.closest(".carousel-slide-indicator");
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
      // Resume auto-rotation using the same configured interval.
      setTimeout(startAutoRotate, autoRotateDelayMs);
    });
  });

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      }),
    { threshold: 0.5 },
  );
  block
    .querySelectorAll(".carousel-slide")
    .forEach((slide) => observer.observe(slide));

  // Start auto-rotation on load
  startAutoRotate();
}

function decorateActions(contentWrapper) {
  [...contentWrapper.querySelectorAll("a")].forEach((link, i) => {
    link.classList.add("button", i === 0 ? "primary" : "secondary");
    const parent = link.parentElement;
    if (parent && parent.tagName === "P")
      parent.classList.add("button-container");
  });
}

function createSlide(row, slideIndex, totalSlides, isEmbeddedVideo) {
  const slide = document.createElement("li");
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute("id", `carousel-slide-${slideIndex}`);
  slide.setAttribute("aria-label", `Slide ${slideIndex + 1} of ${totalSlides}`);
  slide.classList.add("carousel-slide");
  moveInstrumentation(row, slide);

  const [contentCell, imageCell] = [...row.children];

  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("carousel-slide-content");
  if (contentCell) {
    contentWrapper.innerHTML = contentCell.innerHTML;
    decorateActions(contentWrapper);
  }

  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("carousel-slide-image");

  // only use the thumbnail + video link combo when embedded-video style is active,
  // otherwise fall back to the default image rendering
  if (isEmbeddedVideo) {
    const picture = imageCell?.querySelector("picture");
    const videoLinkEl = imageCell?.querySelector("a[href]");
    if (picture) imageWrapper.append(picture);
    if (videoLinkEl) imageWrapper.append(videoLinkEl);
    if (picture || videoLinkEl) embedV1(imageWrapper);
  } else if (imageCell) {
    imageWrapper.innerHTML = imageCell.innerHTML;
  }

  slide.append(contentWrapper, imageWrapper);
  return slide;
}

let carouselId = 0;

export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute("id", `carousel-${carouselId}`);
  const autoRotateDelayMs = getAutoRotateDelayMs(block);
  const rows = [...block.querySelectorAll(":scope > div")];
  const isSingleSlide = rows.length < 2;
  const isEmbeddedVideo = block.classList.contains("embedded-video");
  if (isEmbeddedVideo) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/embed-v1/embed-v1.css`);
  }

  block.setAttribute("role", "region");
  block.setAttribute("aria-roledescription", "Carousel");

  const container = document.createElement("div");
  container.classList.add("carousel-slides-container");

  const slidesWrapper = document.createElement("ul");
  slidesWrapper.classList.add("carousel-slides");
  container.append(slidesWrapper);

  let slideIndicators;

  if (!isSingleSlide) {
    slideIndicators = document.createElement("ol");
    slideIndicators.classList.add("carousel-slide-indicators");

    const indicatorsNav = document.createElement("nav");
    indicatorsNav.setAttribute("aria-label", "Carousel Slide Controls");
    indicatorsNav.append(slideIndicators);

    const controls = document.createElement("div");
    controls.classList.add("carousel-controls");
    controls.append(indicatorsNav);
    container.append(controls);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, rows.length, isEmbeddedVideo);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement("li");
      indicator.classList.add("carousel-slide-indicator");
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }

    row.remove();
  });

  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block, autoRotateDelayMs);
    showSlide(block, 0);
  }
}
