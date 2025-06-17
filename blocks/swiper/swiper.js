import SwipperText from "../swiper/swiper-bundle.min.js"
export default function decorate(block) {
  var objConfig = {}
  block.classList.add("swiper");
  const swipperwrapper = document.createElement("div");
  swipperwrapper.classList.add("swiper-wrapper");
  Array.from(block.children).forEach((eleChild) => {
    eleChild.classList.add("swiper-slide");
    swipperwrapper.append(eleChild);
  })
  block.append(swipperwrapper);
  let blockClassList = Array.from(block.classList);

  //DeskTop
  if (blockClassList.indexOf("desk-pagination") != -1) {
    let paginationDots = document.createElement('div');
    paginationDots.classList.add('swiper-pagination');
    block.append(paginationDots);
    objConfig["loop"] = true;
    objConfig['pagination'] = {
      el: paginationDots,
      clickable: true,
    }
  }

  if (blockClassList.indexOf("left-right-navigation-btn") != -1) {
    let navNextbtn = document.createElement('div');
    navNextbtn.classList.add('swiper-button-next');
    block.append(navNextbtn);

    let navPrevbtn = document.createElement('div');
    navPrevbtn.classList.add('swiper-button-prev');
    block.append(navPrevbtn);
    objConfig["loop"] = true;
    objConfig["navigation"]= {
        nextEl: navNextbtn,
        prevEl: navPrevbtn,
      }
  }
  if (blockClassList.indexOf("three-point-view") != -1) {
    objConfig['slidesPerView'] = 3;
    objConfig['spaceBetween'] = 30;
  }

  //Mobile
  if (blockClassList.indexOf("mobile-auto-scroll") != -1) {
    objConfig["loop"] = true
    objConfig["autoplay"] = true
  }
  if (blockClassList.indexOf("one-point-five-view") != -1) {
    objConfig['slidesPerView'] = 1.5;
    objConfig['spaceBetween'] = 10;
  }
  if (blockClassList.indexOf("two-point-five-view") != -1) {
    objConfig['slidesPerView'] = 2.5;
    objConfig['spaceBetween'] = 20;
  }
  if (blockClassList.indexOf("three-point-five-view") != -1) {
    objConfig['slidesPerView'] = 3.5;
    objConfig['spaceBetween'] = 30;
  }

SwipperText(block,objConfig)
}