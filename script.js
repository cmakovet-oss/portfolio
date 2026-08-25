/**
 * Serhii Makovetskyi — Portfolio Scripts
 * Vanilla JS: navigation, scroll effects, reveal animations
 */

(function () {
  'use strict';

  /* --- DOM References --- */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');
  const revealElements = document.querySelectorAll('.reveal');

  /* --- Mobile Navigation --- */
  function toggleNav() {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeNav() {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', toggleNav);

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* --- Smooth Scroll (fallback for browsers without CSS scroll-behavior) --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* --- Header Scroll Effect --- */
  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    updateActiveNavLink();
  }

  /* --- Active Nav Link Highlighting --- */
  function updateActiveNavLink() {
    const scrollPos = window.scrollY + header.offsetHeight + 100;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Reveal on Scroll (Intersection Observer) --- */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* --- Close mobile nav on resize to desktop --- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      closeNav();
    }
  });

  /* --- Close mobile nav on Escape key --- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeNav();
    }
  });

  /* --- Project media carousels --- */
  initProjectCarousels();
  initVideoLightbox();

  var GIF_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function isAnimatedImage(img) {
    var src = (img.dataset.autoplaySrc || img.getAttribute('src') || '').split('?')[0];
    return /\.gif$/i.test(src);
  }

  function storeAnimatedSrc(img) {
    if (!img.dataset.autoplaySrc && img.getAttribute('src')) {
      img.dataset.autoplaySrc = img.getAttribute('src');
    }
  }

  function playAnimatedImage(img) {
    if (!isAnimatedImage(img)) return;
    storeAnimatedSrc(img);
    var base = (img.dataset.autoplaySrc || img.getAttribute('src')).split('?')[0];
    img.src = base + '?t=' + Date.now();
  }

  function pauseAnimatedImage(img) {
    if (!isAnimatedImage(img)) return;
    storeAnimatedSrc(img);
    img.src = GIF_PLACEHOLDER;
  }

  function isCarouselInView(carousel) {
    return carousel.dataset.inView === 'true';
  }

  function syncCarouselAutoplay(carousel, activeIndex) {
    var slides = carousel.querySelectorAll('.project-carousel__slide');
    var inView = isCarouselInView(carousel);

    slides.forEach(function (slide, i) {
      var img = slide.querySelector('img');
      var slideVideo = slide.querySelector('video');

      if (img && isAnimatedImage(img)) {
        if (i === activeIndex && inView) playAnimatedImage(img);
        else pauseAnimatedImage(img);
      }

      if (slideVideo) {
        slideVideo.muted = true;
        slideVideo.loop = true;
        slideVideo.playsInline = true;
        if (i === activeIndex && inView) {
          slideVideo.play().catch(function () {});
        } else {
          slideVideo.pause();
        }
      }
    });
  }

  function pauseAllCarouselAutoplay(carousel) {
    carousel.querySelectorAll('.project-carousel__slide img').forEach(pauseAnimatedImage);
    carousel.querySelectorAll('video').forEach(function (video) {
      video.pause();
    });
  }

  function initCarouselVisibilityObserver(carousel, getActiveIndex) {
    if (!('IntersectionObserver' in window)) {
      carousel.dataset.inView = 'true';
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          carousel.dataset.inView = entry.isIntersecting ? 'true' : 'false';
          if (entry.isIntersecting) {
            syncCarouselAutoplay(carousel, getActiveIndex());
          } else {
            pauseAllCarouselAutoplay(carousel);
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(carousel);
  }

  function initStandaloneGifAutoplay() {
    document.querySelectorAll('[data-autoplay-gif], img[src$=".gif"], img[src$=".GIF"]').forEach(function (img) {
      if (img.closest('[data-carousel]')) return;

      storeAnimatedSrc(img);

      if (!('IntersectionObserver' in window)) {
        playAnimatedImage(img);
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) playAnimatedImage(entry.target);
            else pauseAnimatedImage(entry.target);
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(img);
    });
  }

  function getMediaSize(media) {
    if (media.tagName === 'VIDEO' && media.videoWidth > 0) {
      return { width: media.videoWidth, height: media.videoHeight };
    }
    if (media.tagName === 'IMG' && media.naturalWidth > 0) {
      return { width: media.naturalWidth, height: media.naturalHeight };
    }
    return null;
  }

  function fitCarouselViewport(carousel, slideIndex) {
    const viewport = carousel.querySelector('.project-carousel__viewport');
    const slides = carousel.querySelectorAll('.project-carousel__slide');
    const slide = slides[slideIndex];
    if (!viewport || !slide) return;

    const media = slide.querySelector('video, img');
    const size = media ? getMediaSize(media) : null;
    const maxHeight = Math.min(window.innerHeight * 0.75, 680);
    const containerWidth = viewport.parentElement
      ? viewport.parentElement.clientWidth
      : viewport.clientWidth;

    if (!size || !containerWidth) {
      viewport.style.height = Math.min(maxHeight, containerWidth * 0.625) + 'px';
      return;
    }

    const ratio = size.width / size.height;
    let height = containerWidth / ratio;
    let width = containerWidth;

    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * ratio;
    }

    viewport.style.height = height + 'px';
    viewport.style.maxWidth = width + 'px';
    viewport.style.marginInline = width < containerWidth ? 'auto' : '';
  }

  function initVideoLightbox() {
    const lightbox = document.getElementById('videoLightbox');
    const player = document.getElementById('videoLightboxPlayer');
    if (!lightbox || !player) return;

    function closeLightbox() {
      player.pause();
      player.removeAttribute('src');
      player.load();
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openLightbox(video) {
      const source = video.currentSrc || video.querySelector('source')?.src || video.src;
      if (!source) return;

      player.src = source;
      player.currentTime = video.currentTime || 0;
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      player.play().catch(function () {});
    }

    document.querySelectorAll('.project-carousel video').forEach(function (video) {
      const slide = video.closest('.project-carousel__slide');
      if (!slide || slide.querySelector('.project-carousel__expand')) return;

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'project-carousel__expand';
      expandBtn.setAttribute('aria-label', 'Open full-size video');
      expandBtn.textContent = '⛶';
      expandBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox(video);
      });
      slide.appendChild(expandBtn);

      video.addEventListener('loadedmetadata', function () {
        const carousel = video.closest('[data-carousel]');
        if (carousel) {
          const slides = carousel.querySelectorAll('.project-carousel__slide');
          const activeIndex = Array.prototype.indexOf.call(slides, slide);
          if (activeIndex >= 0) fitCarouselViewport(carousel, activeIndex);
        }
      });

      if (video.readyState >= 1) {
        const carousel = video.closest('[data-carousel]');
        if (carousel) {
          const slides = carousel.querySelectorAll('.project-carousel__slide');
          const activeIndex = Array.prototype.indexOf.call(slides, slide);
          if (activeIndex >= 0) fitCarouselViewport(carousel, activeIndex);
        }
      }

      video.addEventListener('dblclick', function () {
        openLightbox(video);
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  function initProjectCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      const viewport = carousel.querySelector('.project-carousel__viewport');
      const track = carousel.querySelector('.project-carousel__track');
      const slides = carousel.querySelectorAll('.project-carousel__slide');
      const prevBtn = carousel.querySelector('.project-carousel__btn--prev');
      const nextBtn = carousel.querySelector('.project-carousel__btn--next');
      const dotsContainer = carousel.querySelector('.project-carousel__dots');
      let index = 0;
      let touchStartX = 0;

      if (!track || slides.length === 0) return;

      carousel.setAttribute('tabindex', '0');

      if (slides.length === 1) {
        carousel.setAttribute('data-single', 'true');
      } else {
        slides.forEach(function (_, i) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'project-carousel__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Slide ' + (i + 1));
          dot.addEventListener('click', function () {
            goTo(i);
          });
          dotsContainer.appendChild(dot);
        });
      }

      function pauseVideos() {
        carousel.querySelectorAll('video').forEach(function (video) {
          video.pause();
        });
      }

      function updateUI() {
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        carousel.dataset.activeIndex = String(index);
        if (dotsContainer) {
          dotsContainer.querySelectorAll('.project-carousel__dot').forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
          });
        }
        fitCarouselViewport(carousel, index);
        syncCarouselAutoplay(carousel, index);
      }

      function goTo(i) {
        index = ((i % slides.length) + slides.length) % slides.length;
        pauseVideos();
        updateUI();
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          goTo(index - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          goTo(index + 1);
        });
      }

      carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) < 40) return;
        if (diff > 0) goTo(index + 1);
        else goTo(index - 1);
      }, { passive: true });

      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(index - 1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goTo(index + 1);
        }
      });

      slides.forEach(function (slide, i) {
        const media = slide.querySelector('video, img');
        if (!media) return;
        const eventName = media.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
        media.addEventListener(eventName, function () {
          if (i === index) fitCarouselViewport(carousel, index);
        });
      });

      window.addEventListener('resize', function () {
        fitCarouselViewport(carousel, index);
      });

      initCarouselVisibilityObserver(carousel, function () {
        return index;
      });

      updateUI();
    });

    initStandaloneGifAutoplay();
  }
})();
