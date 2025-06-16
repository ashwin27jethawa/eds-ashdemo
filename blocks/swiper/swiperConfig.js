let objClassSwipper = {
  "default": {
    loop: true,
    autoplay: true
  },
  "navigation": {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    }
  },
  "pagination": {
    loop: true,
    autoplay:true,
    pagination: {
      el: ".swiper-pagination",
      clickable:true
    },
  },
  "slidepreview": {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    }
  },
  "slidepreviewauto": {
    slidesPerView: "auto",
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    }
  },
  "breakpointswipper": {
    slidesPerView: 1.5,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 1.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 50,
      },
    },
  }
}

export default objClassSwipper;