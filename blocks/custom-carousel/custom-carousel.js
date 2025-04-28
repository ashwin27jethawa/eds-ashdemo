export default function decorate(block) {
  const SLIDE_WIDTH = 600;

  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  const originalSlides = [...block.children];
  const slides = [];

  // Build original slides and save them
  originalSlides.forEach(text => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.append(text);
    slides.push(slide);
  });

  // Clone first and last slide
  const firstClone = slides[0].cloneNode(true);
  firstClone.classList.add('clone');
  const lastClone = slides[slides.length - 1].cloneNode(true);
  lastClone.classList.add('clone');

  // Assemble track
  track.appendChild(lastClone);
  slides.forEach(slide => track.appendChild(slide));
  track.appendChild(firstClone);

  // Buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'prev';
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'next';
  nextBtn.innerHTML = '&#10095;';

  // Pagination
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'carousel-pagination';

  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.addEventListener('click', () => goToSlide(index));
    paginationContainer.appendChild(dot);
  });

  // Assemble carousel
  carouselContainer.appendChild(track);
  carouselContainer.appendChild(prevBtn);
  carouselContainer.appendChild(nextBtn);
  carouselContainer.appendChild(paginationContainer);
  block.innerHTML = ''; // Clear the original content
  block.append(carouselContainer);

  const allSlides = track.children; // includes clones
  const dots = paginationContainer.children;
  let currentSlide = 1; // start at real first slide (index 1)
  let isTransitioning = false;

  function updateSlidePosition(animate = true) {
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s ease';
    }

    let offset = "";
    if (slides.length < Math.floor(currentSlide) && currentSlide.toString().includes(".")) {
      currentSlide = 0.2
      offset = -currentSlide * SLIDE_WIDTH;
    } else {
      offset = -currentSlide * SLIDE_WIDTH;
    }

    track.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(() => {
      track.offsetHeight; // force reflow
      if (!animate) track.style.transition = '';
    });

    updatePagination();
    updateSlidePreviews();
  }

  function updatePagination() {
    [...dots].forEach(dot => dot.classList.remove('active'));
    const realIndex = (currentSlide - 1 + slides.length) % slides.length;
    dots[realIndex].classList.add('active');
  }

  function updateSlidePreviews() {
    [...allSlides].forEach((slide, index) => {
      slide.style.transform = 'translateX(0.8)';
      slide.style.opacity = 0.3;
      if (index === currentSlide) {
        slide.style.transform = 'translateX(1)';
        slide.style.opacity = 1;
      } else if (index === currentSlide - 1 || index === currentSlide + 1) {
        slide.style.transform = 'translateX(0.9)';
        slide.style.opacity = 0.5;
      }
    });
  }

  function goToSlide(index) {
    currentSlide = index + 1; // adjust for clone at start
    updateSlidePosition();
  }

  function nextSlide() {
    if (isTransitioning) return;
    currentSlide++;
    updateSlidePosition();
    isTransitioning = true;
  }

  function prevSlide() {
    if (isTransitioning) return;
    currentSlide--;
    updateSlidePosition();
    isTransitioning = true;
  }

  // Handle circular loop on transition end
  track.addEventListener('transitionend', () => {
    if (allSlides[currentSlide].classList.contains('clone')) {
      if (currentSlide === 0) {
        currentSlide = slides.length;
      } else if (currentSlide === allSlides.length - 1) {
        currentSlide = 1;
      }
      updateSlidePosition(false); // jump without animation
    }
    isTransitioning = false;
  });

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // let autoplayInterval = setInterval(nextSlide, 3000);

  // // Init
  // updateSlidePosition();
}
