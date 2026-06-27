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

  //   home course filter select2 start

  $('.select2').select2({
    placeholder: 'Select an option',
    allowClear: true,
    width: '100%',
    minimumResultsForSearch: 0,
    placeholder: $(this).data('placeholder'),
  });

  //   home course filter select2 ends

  // hear slider start

  var autoPlayEnabled = false;
  var isProgrammaticPause = false;
  var isSliderInView = false;

  function pauseHearSlidesExcept(exceptSlideEl) {
    $('.hear-students-slider .swiper-slide').each(function () {
      if (exceptSlideEl && this === exceptSlideEl) return;
      const player = $(this).data('player');
      if (player) player.pause().catch(() => {});
    });
  }

  var swiper = new Swiper('.hear-students-slider', {
    slidesPerView: 7,
    centeredSlides: true,
    loop: true,
    spaceBetween: 0,
    grabCursor: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      320: { slidesPerView: 1.55, centeredSlides: true },
      768: { slidesPerView: 2.5, spaceBetween: 0 },
      1024: { slidesPerView: 3.5, spaceBetween: 0 },
      1200: { slidesPerView: 4.5, spaceBetween: 0 },
      1300: { slidesPerView: 4.8, spaceBetween: 0 },
      1440: { slidesPerView: 5.2, spaceBetween: 0 },
      1700: { slidesPerView: 5.25, spaceBetween: 0 },
      1800: { slidesPerView: 5.75, spaceBetween: 0 },
      1900: { slidesPerView: 6, spaceBetween: 0 },
    },
    on: {
      init: function () {
        // Check if Vimeo Player API is loaded
        if (
          typeof Vimeo === 'undefined' ||
          typeof Vimeo.Player === 'undefined'
        ) {
          console.error(
            'Vimeo Player API is not loaded. Please ensure it is loaded before this script.',
          );
          return;
        }

        $('.hear-students-slider .swiper-slide').each(function () {
          const $slide = $(this);
          const iframe = $slide.find('iframe')[0];
          if (iframe) {
            const player = new Vimeo.Player(iframe);
            $slide.data('player', player);

            player.on('play', function () {
              pauseHearSlidesExcept($slide[0]);

              const targetIndex = $slide.index();
              if (targetIndex !== swiper.activeIndex) {
                swiper.slideTo(targetIndex);
              }

              autoPlayEnabled = true;
            });

            player.on('pause', function () {
              if (
                $slide.hasClass('swiper-slide-active') &&
                !isProgrammaticPause
              ) {
                player.getCurrentTime().then(function (currentTime) {
                  player.getDuration().then(function (duration) {
                    if (currentTime < duration) {
                      autoPlayEnabled = false;
                    }
                  });
                });
              }
            });
          }
        });
      },
      slideChange: function () {
        isProgrammaticPause = true;
        // Pause every slide's video as soon as the active slide changes
        pauseHearSlidesExcept(null);
      },
      slideChangeTransitionEnd: function () {
        // Handle autoplay based on viewport visibility
        if (autoPlayEnabled && isSliderInView) {
          const activeSlide = swiper.slides[swiper.activeIndex];
          const activePlayer = $(activeSlide).data('player');
          if (activePlayer) {
            pauseHearSlidesExcept(activeSlide);
            activePlayer.play().catch(() => {});
          }
        }

        setTimeout(() => {
          isProgrammaticPause = false;
        }, 100);
      },
    },
  });

  // Clicking anywhere on a slide makes it the active/centered slide
  $('.hear-students-slider').on('click', '.swiper-slide', function () {
    const targetIndex = $(this).index();
    if (targetIndex !== swiper.activeIndex) {
      swiper.slideTo(targetIndex);
    }
  });

  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    // Slider viewport observer
    const sliderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSliderInView = entry.isIntersecting;

          if (!isSliderInView) {
            // Pause all when leaving viewport
            pauseHearSlidesExcept(null);
          } else if (autoPlayEnabled) {
            // Resume playback when returning to viewport
            const activeSlide = swiper.slides[swiper.activeIndex];
            const activePlayer = $(activeSlide).data('player');
            if (activePlayer) {
              pauseHearSlidesExcept(activeSlide);
              activePlayer.play().catch(() => {});
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    // Observe main slider container
    const sliderContainer = document.querySelector('.hear-studen-wrapper');
    if (sliderContainer) {
      sliderObserver.observe(sliderContainer);
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
      sliderObserver.disconnect();
      $('.hear-students-slider .swiper-slide').each(function () {
        const player = $(this).data('player');
        if (player) player.unload().catch(() => {});
      });
    });
  } else {
    console.warn(
      'IntersectionObserver not supported in this browser. Viewport-based video pausing will not work.',
    );
  }
  // hear slider ends

  // uni fair select start
  $('.uni-fair-search-wrapper select').select2({
    width: '100%',
  });

  // uni fair select ends

  // home faq accordion start
  $('.accordion-wrapper').each(function () {
    var $items = $(this).find('.single-accordion-wrapper');

    // set initial state instantly, without the CSS transition kicking in
    $items.addClass('no-transition').removeClass('open');
    $items.first().addClass('open');

    // re-enable transitions on the next frame
    requestAnimationFrame(function () {
      $items.removeClass('no-transition');
    });
  });

  $('.accordion-wrapper').on(
    'click',
    '.single-accordion-wrapper > .title-box',
    function () {
      var $current = $(this).closest('.single-accordion-wrapper');
      var $wrapper = $current.closest('.accordion-wrapper');
      var wasOpen = $current.hasClass('open');

      $wrapper.find('.single-accordion-wrapper.open').removeClass('open');

      if (!wasOpen) {
        $current.addClass('open');
      }
    },
  );
  // home faq accordion ends
})(jQuery);
