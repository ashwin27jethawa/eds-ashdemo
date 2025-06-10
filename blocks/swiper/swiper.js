import SwiperText from "../swiper/swiper-bundle.min.js"


export default function decorate(block) {
  const paginationTexts = ['First', 'Second', 'Third', 'Fourth'];
  console.log(block);
  block.classList.add("swiper");
  const swapperWapper = document.createElement("div");
  swapperWapper.classList.add("swiper-wrapper")
  Array.from(block.children).forEach((element) => {
    element.classList.add("swiper-slide")
    swapperWapper.append(element);
  })
  block.append()
  // swiper-paginationswapperWapper
  const btnWrapper = document.createElement("div");
  btnWrapper.classList.add("btnWrapper");

  const divPagination = document.createElement("div");
  divPagination.classList.add("swiper-pagination");
  btnWrapper.append(divPagination);

  const LeftArrow = document.createElement("div");
  LeftArrow.classList.add("swiper-button-prev");
  btnWrapper.appendChild(LeftArrow);

  const RightArrow = document.createElement("div")
  RightArrow.classList.add("swiper-button-next");
  btnWrapper.appendChild(RightArrow);

  block.append(btnWrapper)
  let swiperProperties;
  if (Array.from(block.classList).indexOf("cards-carousel-v3") != -1) {
    swiperProperties = {
      loop: true,
      slidesPerView: 3,
      spaceBetween: 30,
      pagination: {
        el: divPagination,
        clickable: true,
      }
    }
  } else {
    swiperProperties = {
      loop: true,
      navigation: {
        nextEl: RightArrow,
        prevEl: LeftArrow,
      },
      slidesPerView: 1,
      pagination: {
        el: divPagination,
        clickable: true,
        renderBullet: function (index, className) {
          // Use your text for each bullet based on index
          return '<span class="' + className + '">' + paginationTexts[index] + '</span>';
        }
      },
    }
  }

  const swiperContainer = Array.from(block.classList).indexOf('swiper') != -1;
  if (!swiperContainer) {
    console.warn('Swiper container not found');
    return;
  }

  SwiperText(swiperContainer, swiperProperties)

}