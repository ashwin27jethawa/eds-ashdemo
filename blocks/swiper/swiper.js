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

  SwiperText(block, {
    pagination: {
      el: divPagination,
      clickable: true,
      renderBullet: function (index, className) {
        // Use your text for each bullet based on index
        return '<span class="' + className + '">' + paginationTexts[index] + '</span>';
      },
    },
  })

}