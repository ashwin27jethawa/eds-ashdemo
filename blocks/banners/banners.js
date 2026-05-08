export default function decorate(block) {
  const banners = [...block.children];
  
  block.textContent = '';
  
  const sliderWrapper = document.createElement('div');
  sliderWrapper.classList.add('slider-wrapper');

  banners.forEach((row, i) => {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    if (i === 0) slide.classList.add('active');


    slide.append(...row.children);
    
    sliderWrapper.append(slide);
  });

  block.append(sliderWrapper);

  if (banners.length > 1) {
    const nav = document.createElement('div');
    nav.classList.add('slider-nav');
    nav.innerHTML = `
      <button class="prev" aria-label="Previous"></button>
      <button class="next" aria-label="Next"></button>
    `;
    block.append(nav);

    nav.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const active = sliderWrapper.querySelector('.slide.active');
        active.classList.remove('active');
        
        let next = btn.classList.contains('next') 
          ? active.nextElementSibling 
          : active.previousElementSibling;

        if (!next) {
          next = btn.classList.contains('next') 
            ? sliderWrapper.firstElementChild 
            : sliderWrapper.lastElementChild;
        }
        next.classList.add('active');
      });
    });
  }
}