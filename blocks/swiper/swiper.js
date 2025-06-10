import SwiperText from "../swiper/swiper-bundle.min.js"

export default function decorate(block) {
  console.log(block);
  block.add.classList("swiper");
  const swapperWapper = document.createElement("div");
  swapperWapper.add.classList("swiper-wrapper")

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
    loop: true,
    autoplay: true,
    pagination: {
      el: divPagination,
      clickable: true
    },
  })

}