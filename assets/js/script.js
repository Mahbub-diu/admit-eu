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

  $('#copyright-year').text(new Date().getFullYear());

  // our journey desktop slider start

  jQuery(document).ready(function ($) {
    // Only run if the slider exists on the page
    if (!$('.our-journey-desktop-slider').length) {
      return;
    }

    var $window = $(window);
    var $body = $('body');
    var $section = $('.our-journey-main');
    var $slider = $('.our-journey-desktop-slider');

    // Dynamically generate timeline dots based on number of slides
    var slideCount = $slider.find('.swiper-slide').length;

    // Create timeline container and timeline-line element
    var $timeline = $('<div class="timeline"></div></div>');

    // Loop through each slide index and add a timeline-dot
    for (var i = 0; i < slideCount; i++) {
      var $dot = $(
        '<div class="timeline-dot" data-slide="' +
          i +
          '">' +
          '<div class="long-bar"></div>' +
          '<div class="time-bullet"></div>' +
          '</div>',
      );
      $timeline.append($dot);
    }

    // Prepend timeline to the slider container (adjust as needed for your layout)
    $slider.prepend($timeline);

    $('.timeline-dot[data-slide="0"]').addClass('active');

    // Initialize Swiper
    var swiper = new Swiper('.our-journey-desktop-slider', {
      direction: 'vertical',
      speed: 800,
      mousewheel: {
        releaseOnEdges: true,
      },
      on: {
        slideChange: function () {
          // Update timeline active dot on slide change
          $('.timeline-dot').removeClass('active');
          var $activeDot = $(
            '.timeline-dot[data-slide="' + this.activeIndex + '"]',
          ).addClass('active');

          // Ensure the timeline container scrolls to reveal the active dot
          var $timeline = $('.timeline');
          var containerHeight = $timeline.height();
          // Calculate the position of the active dot relative to the timeline container
          var dotOffsetTop = $activeDot.position().top;
          var dotHeight = $activeDot.outerHeight();
          var currentScroll = $timeline.scrollTop();

          // If the active dot is above the visible area
          if (dotOffsetTop < 0) {
            $timeline.animate({ scrollTop: currentScroll + dotOffsetTop }, 300);
          }
          // If the active dot is below the visible area
          if (dotOffsetTop + dotHeight > containerHeight) {
            $timeline.animate(
              {
                scrollTop:
                  currentScroll + (dotOffsetTop + dotHeight - containerHeight),
              },
              300,
            );
          }
        },
      },
    });

    //   if ($('.our-journey-mobile-slider').length) {
    //     var Swipes = new Swiper('.our-journey-mobile-slider', {
    //       loop: false,
    //       speed: 800,
    //       spaceBetween: 24,
    //       grabCursor: true,
    //       autoplay: false,
    //       centeredSlides: false,
    //       slidesPerView: 1,
    //       effect: window.innerWidth >= 981 ? 'fade' : 'slide',
    //       fadeEffect: {
    //         crossFade: true,
    //       },
    //       navigation: {
    //         nextEl: '.swiper-button-next',
    //         prevEl: '.swiper-button-prev',
    //       },
    //     });
    //   }

    // Click handler for timeline dots to jump to corresponding slide
    $('.timeline-dot').on('click', function () {
      var slideIndex = $(this).data('slide');
      swiper.slideTo(slideIndex);
    });

    // Scroll trapping variables
    var trapScroll = false;
    var mouseOverSlider = false;

    // Helper: Check if at least 90% (or full) of the section is visible
    function isSection90Visible() {
      var scrollTop = $window.scrollTop();
      var windowHeight = $window.height();
      var sectionTop = $section.offset().top;
      var sectionHeight = $section.outerHeight();
      var sectionBottom = sectionTop + sectionHeight;
      var visibleTop = Math.max(sectionTop, scrollTop);
      var visibleBottom = Math.min(sectionBottom, scrollTop + windowHeight);
      var visibleHeight = visibleBottom - visibleTop;
      var percentVisible = visibleHeight / sectionHeight;
      return percentVisible >= 1; // Change to 0.9 if you prefer 90%
    }

    // Update trapScroll flag and body overflow based on visibility and mouse hover
    function updateTrapScroll() {
      if (isSection90Visible() && mouseOverSlider) {
        if (!trapScroll) {
          trapScroll = true;
          $body.css('overflow', 'hidden');
        }
      } else {
        if (trapScroll) {
          trapScroll = false;
          $body.css('overflow', 'auto');
        }
      }
    }

    // Monitor window scroll and resize events
    $window.on('scroll resize', function () {
      updateTrapScroll();
    });

    // Monitor mouse enter/leave on the slider
    $slider.on('mouseenter', function () {
      mouseOverSlider = true;
      updateTrapScroll();
    });

    $slider.on('mouseleave', function () {
      mouseOverSlider = false;
      updateTrapScroll();
    });

    // Handle wheel scrolling while the trap is active
    $slider.on('wheel', function (e) {
      if (!trapScroll) return;

      var deltaY = e.originalEvent.deltaY;
      if (deltaY > 0) {
        // Scrolling down
        if (!swiper.isEnd) {
          e.preventDefault();
          swiper.slideNext();
        } else {
          // On the last slide, allow page scroll to resume
          $body.css('overflow', 'auto');
        }
      } else {
        // Scrolling up
        if (!swiper.isBeginning) {
          e.preventDefault();
          swiper.slidePrev();
        } else {
          // On the first slide, allow page scroll to resume
          $body.css('overflow', 'auto');
        }
      }
    });
  });

  // our journey desktop slider ends
})(jQuery);
