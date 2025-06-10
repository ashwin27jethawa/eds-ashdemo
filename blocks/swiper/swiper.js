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
  let LeftArrow, RightArrow;
  if (!Array.from(block.classList).includes("cards-carousel-v3")) {
    LeftArrow = document.createElement("div");
    LeftArrow.classList.add("swiper-button-prev");
    btnWrapper.appendChild(LeftArrow);

    RightArrow = document.createElement("div")
    RightArrow.classList.add("swiper-button-next");
    btnWrapper.appendChild(RightArrow);
  }


  block.append(btnWrapper)
  SwiperText(block, {
    loop: true,
    navigation: {
      nextEl: Array.from(block.classList).includes("cards-carousel-v3") ? "" : RightArrow,
      prevEl: Array.from(block.classList).includes("cards-carousel-v3") ? "" : LeftArrow,
    },
    pagination: {
      el: divPagination,
      clickable: true,
      slidesPerView: Array.from(block.classList).includes("cards-carousel-v3") ? 3 : 1,
      spaceBetween: Array.from(block.classList).includes("cards-carousel-v3") ? 10 :  0,
      // renderBullet: function (index, className) {
      //   // Use your text for each bullet based on index
      //   return '<span class="' + className + '">' + paginationTexts[index] + '</span>';
      // }
    },
  })

}