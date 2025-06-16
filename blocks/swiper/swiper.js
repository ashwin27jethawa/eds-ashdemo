import SwipperText from "../swiper/swiper-bundle.min.js"
import swipperConfig from "./swiperConfig.js"
const mobile = 480;
export default function decorate(block) {
  var obj = {}
  block.classList.add("swiper");
  const swipperwrapper = document.createElement("div");
  swipperwrapper.classList.add("swiper-wrapper");
  Array.from(block.children).forEach((eleChild) => {
    eleChild.classList.add("swiper-slide");
    swipperwrapper.append(eleChild);
  })
  block.append(swipperwrapper);
  
  let leftprevbtn, rightprevbtn, swiperPagination;
  let config = Array.from(block.classList).filter((itemclass) => {
    if (itemclass) {
      obj.pagination = {
        el: swiperPagination,
        clickable: true
      }
    }
    if (itemclass == "mobile-pagination") {
      obj.breakpoints[480].pagination = {
        el: swiperPagination,
        clickable: true
      }
    }
    if (itemclass == "mobile-pagination") {
      obj.pagination = {
        el: swiperPagination,
        clickable: true
      }
    }
    let decryptObj = swipperConfig; //[itemclass];//JSON.parse(window.btoa(swipperConfig[itemclass]))
    if (decryptObj[itemclass] != undefined) {
      if (itemclass == "navigation") {
        leftprevbtn = document.createElement("div");
        leftprevbtn.classList.add("swiper-button-prev")
        block.append(leftprevbtn)

        rightprevbtn = document.createElement("div");
        rightprevbtn.classList.add("swiper-button-next")
        block.append(rightprevbtn)

        if (decryptObj[itemclass]['navigation'] != undefined) {
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        } else {
          decryptObj[itemclass]['navigation'] = {}
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        }


      } else if (itemclass == "pagination") {
        swiperPagination = document.createElement("div");
        swiperPagination.classList.add("swiper-pagination");
        block.append(swiperPagination);

        if (decryptObj[itemclass]['pagination'] != undefined) {
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination    
        } else {
          decryptObj[itemclass]['pagination'] = {}
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination
        }

      } else if (itemclass == "slidepreview") {
        leftprevbtn = document.createElement("div");
        leftprevbtn.classList.add("swiper-button-prev")
        block.append(leftprevbtn)

        rightprevbtn = document.createElement("div");
        rightprevbtn.classList.add("swiper-button-next")
        block.append(rightprevbtn)

        if (decryptObj[itemclass]['navigation'] != undefined) {
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        } else {
          decryptObj[itemclass]['navigation'] = {}
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        }

      } else if (itemclass == "slidepreviewauto") {
        swiperPagination = document.createElement("div");
        swiperPagination.classList.add("swiper-pagination");
        block.append(swiperPagination);

        if (decryptObj[itemclass]['pagination'] != undefined) {
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination    
        } else {
          decryptObj[itemclass]['pagination'] = {}
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination
        }

      } else if (itemclass == "breakpointswipper") {
        swiperPagination = document.createElement("div");
        swiperPagination.classList.add("swiper-pagination");
        block.append(swiperPagination);

        if (decryptObj[itemclass]['pagination'] != undefined) {
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination    
        } else {
          decryptObj[itemclass]['pagination'] = {}
          decryptObj[itemclass]['pagination']["el"] = swiperPagination; //pagination
        }
        leftprevbtn = document.createElement("div");
        leftprevbtn.classList.add("swiper-button-prev")
        block.append(leftprevbtn)

        rightprevbtn = document.createElement("div");
        rightprevbtn.classList.add("swiper-button-next")
        block.append(rightprevbtn)

        if (decryptObj[itemclass]['navigation'] != undefined) {
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        } else {
          decryptObj[itemclass]['navigation'] = {}
          decryptObj[itemclass]['navigation']["nextEl"] = rightprevbtn
          decryptObj[itemclass]['navigation']["prevEl"] = leftprevbtn
        }
      }
      return decryptObj[itemclass]
    }
  })
  SwipperText(block, swipperConfig[config[0]])
}