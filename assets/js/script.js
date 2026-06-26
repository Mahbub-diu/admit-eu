(function ($) {
  ('use strict');

  // home slider
  var swiper = new Swiper('.home-slider', {
    effect: 'fade',
    speed: 2000,

    // autoplay: {
    //   delay: 5000,
    // },
    autoplay: false,

    loop: true,

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  $('.swiper-video').on('loadeddata', function () {
    var duration = this.duration;

    var autoplayDelay = Math.round(duration * 1000);

    $(this).closest('.video-slide').attr('data-swiper-autoplay', autoplayDelay);

    console.log('Video Duration: ' + duration + ' seconds');
  });

  // home slider end here
})(jQuery);
