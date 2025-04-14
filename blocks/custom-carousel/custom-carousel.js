export default function decorate(block) {

    // === Create swiper structure ===
    const app = document.getElementById('app');

    // Main container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';

    // Track
    const track = document.createElement('div');
    track.className = 'carousel-track';

    [...block.children].forEach(text => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.textContent = text;
        track.appendChild(slide);
    });

    // Buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.innerHTML = '&#10094;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'next';
    nextBtn.innerHTML = '&#10095;';

    // Assemble the swiper
    carouselContainer.appendChild(track);
    carouselContainer.appendChild(prevBtn);
    carouselContainer.appendChild(nextBtn);
    app.appendChild(carouselContainer);

    // === Add styles dynamically (or use CSS file) ===
    const style = document.createElement('style');
    style.textContent = `
    .carousel-container {
      position: relative;
      width: 600px;
      overflow: hidden;
      margin: auto;
      border: 2px solid #000;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.5s ease-in-out;
    }

    .slide {
      min-width: 600px;
      height: 300px;
      background: #007aff;
      color: white;
      font-size: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    button.prev, button.next {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      font-size: 30px;
      cursor: pointer;
      padding: 10px;
    }

    button.prev { left: 10px; }
    button.next { right: 10px; }
  `;
    document.head.appendChild(style);

    // === Swiper logic ===
    const slides = track.children;
    let currentSlide = 0;

    function updateSlidePosition() {
        const offset = -currentSlide * 600; // slide width
        track.style.transform = `translateX(${offset}px)`;
    }

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlidePosition();
    });

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlidePosition();
    });
}