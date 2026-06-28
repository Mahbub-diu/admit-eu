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
