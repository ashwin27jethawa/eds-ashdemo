import SwiperBlock from "../swiper/swiper.js"
export default function decorate(block) {
  Array.from(block.children).forEach((element, index) => {
    element.classList.add("cards-carousel inner-" + (index + 1))
  })
  
}