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

  block.append(swapperWapper)
  // swiper-pagination
  const divPagination = document.createElement("div");
  divPagination.classList.add("swiper-pagination");
  block.append(divPagination);

  const LeftArrow = document.createElement("div");
  LeftArrow.classList.add("swiper-button-prev");
  block.appendChild(LeftArrow);

  const RightArrow = document.createElement("div")
  RightArrow.classList.add("swiper-button-next");
  block.appendChild(RightArrow);

  SwiperText(block, {
    pagination: {
      loop:true,
      el: divPagination,
      clickable: true,
      renderBullet: function (index, className) {
        // Use your text for each bullet based on index
        return '<span class="' + className + '">' + paginationTexts[index] + '</span>';
      },
      navigation: {
          nextEl: RightArrow,
          prevEl: LeftArrow,
      },
    },
  })

}