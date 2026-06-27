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

        $('.swiper-slide').each(function () {
          const $slide = $(this);
          const iframe = $slide.find('iframe')[0];
          if (iframe) {
            const $playButton = $(
              '<img class="gsi_video_play" src="/india/wp-content/uploads/sites/3/2025/03/play.svg">',
            );
            $slide.find('.gsi_slider_slide').append($playButton);

            const player = new Vimeo.Player(iframe);
            $slide.data('player', player);

            player.on('play', function () {
              $('.swiper-slide')
                .not($slide)
                .each(function () {
                  const otherPlayer = $(this).data('player');
                  if (otherPlayer) otherPlayer.pause().catch(() => {});
                });

              const targetIndex = swiper.getSlideIndex($slide[0]);
              if (targetIndex !== swiper.activeIndex) {
                swiper.slideTo(targetIndex);
              }

              $playButton.hide();
              autoPlayEnabled = true;
            });

            player.on('pause', function () {
              if ($slide.hasClass('swiper-slide-active')) {
                player.getCurrentTime().then(function (currentTime) {
                  player.getDuration().then(function (duration) {
                    if (currentTime < duration && !isProgrammaticPause) {
                      autoPlayEnabled = false;
                    }
                  });
                });
                $playButton.show();
              }
            });

            player.on('ended', function () {
              $playButton.show();
            });
          }
        });
      },
      slideChangeTransitionEnd: function () {
        isProgrammaticPause = true;
        // Pause all videos during slide change
        $('.swiper-slide').each(function () {
          const player = $(this).data('player');
          const $playButton = $(this).find('.gsi_video_play');
          if (player) {
            player.pause().catch(() => {});
            if ($(this).hasClass('swiper-slide-active')) {
              $playButton.toggle(!player.paused); // Fixed: was using player.paused incorrectly
            }
          }
        });

        // Handle autoplay based on viewport visibility
        if (autoPlayEnabled && isSliderInView) {
          const activeSlide = swiper.slides[swiper.activeIndex];
          const activePlayer = $(activeSlide).data('player');
          const $playButton = $(activeSlide).find('.gsi_video_play');
          if (activePlayer) {
            activePlayer.play().catch(() => {});
            $playButton.hide();
          }
        }

        setTimeout(() => {
          isProgrammaticPause = false;
        }, 100);
      },
    },
  });

  // Play button click handler
  $('.swiper').on('click', '.hear-play-btn', function (e) {
    e.preventDefault();
    const $slide = $(this).closest('.swiper-slide');
    const player = $slide.data('player');
    const targetIndex = swiper.getSlideIndex($slide[0]);

    if (player) {
      swiper.slideTo(targetIndex, 300, () => {
        player.play().catch(() => {});
      });
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
            $('.swiper-slide').each(function () {
              const player = $(this).data('player');
              if (player) player.pause().catch(() => {});
            });
          } else if (autoPlayEnabled) {
            // Resume playback when returning to viewport
            const activeSlide = swiper.slides[swiper.activeIndex];
            const activePlayer = $(activeSlide).data('player');
            if (activePlayer) {
              activePlayer.play().catch(() => {});
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    // Observe main slider container
    const sliderContainer = document.querySelector('.gsi_slider_container');
    if (sliderContainer) {
      sliderObserver.observe(sliderContainer);
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
      sliderObserver.disconnect();
      $('.swiper-slide').each(function () {
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
})(jQuery);
