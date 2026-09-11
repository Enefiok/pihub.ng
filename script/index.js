// ============================================================
// GLOBAL SCROLL SPEED TRACKER
// ============================================================

let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let currentScrollSpeed = 0; // px/ms

window.addEventListener(
  "scroll",
  () => {
    const now = performance.now();
    const deltaY = Math.abs(window.scrollY - lastScrollY);
    const deltaTime = now - lastScrollTime || 1;

    currentScrollSpeed = deltaY / deltaTime;

    lastScrollY = window.scrollY;
    lastScrollTime = now;
  },
  { passive: true }
);

const FAST_SCROLL_THRESHOLD = 1.5;
const INSTANT_THRESHOLD = 3;

function getScrollSpeedMultiplier() {
  if (currentScrollSpeed > FAST_SCROLL_THRESHOLD) return 0.15;
  return 1;
}

function isInstantScroll() {
  return currentScrollSpeed > INSTANT_THRESHOLD;
}

function snapToEndState(el, endStyles) {
  if (!el) return;
  Object.assign(el.style, endStyles);
}


// ============================================================
// HERO SEQUENTIAL INTRO - SPED UP
// ============================================================

function typeTextSequential(el, speed = 15, startDelay = 500) {
  if (!el) return Promise.resolve();

  const fullText = el.textContent.trim();
  el.textContent = "";

  return new Promise((resolve) => {
    setTimeout(() => {
      el.style.opacity = "1";
      let i = 0;

      function step() {
        if (i < fullText.length) {
          el.textContent += fullText.charAt(i);
          i++;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      }
      step();
    }, startDelay);
  });
}

async function initHeroIntro() {
  const heroText = document.getElementById("heroText");
  if (!heroText) {
    console.warn("Hero text #heroText was not found.");
    return;
  }

  const heroButton = document.querySelector(".hero-btn");
  heroText.style.opacity = "0";

  await typeTextSequential(heroText, 15, 500);

  if (heroButton) {
    await new Promise((resolve) => {
      heroButton.animate(
        [
          { opacity: 0, transform: "translateY(20px) scale(0.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards"
        }
      ).finished.then(resolve).catch(resolve);
    });
  }
}

initHeroIntro();


// ============================================================
// ABOUT SECTION — COOL ALTERNATING FEATURES (ZERO JUMP RISK)
// ============================================================

const aboutSection = document.querySelector(".about");

if (aboutSection) {
  const heading = aboutSection.querySelector(".about-heading");
  const intro = aboutSection.querySelector(".about-intro");
  const image = aboutSection.querySelector(".aboutPic");
  const description = aboutSection.querySelector(".about-desc");
  const features = aboutSection.querySelectorAll(".about-features span");
  const button = aboutSection.querySelector(".about-btn");
  const featuresContainer = aboutSection.querySelector(".about-features");

  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (isInstantScroll()) {
          snapToEndState(heading, { opacity: "1", transform: "none" });
          snapToEndState(intro, { opacity: "1", transform: "none" });
          snapToEndState(image, { opacity: "1", transform: "none" });
          snapToEndState(description, { opacity: "1", transform: "none" });
          if (featuresContainer) featuresContainer.style.opacity = "1";
          features.forEach((feature) => {
            feature.style.opacity = "1";
            feature.style.transform = "none";
          });
          snapToEndState(button, { opacity: "1", transform: "none" });
          aboutObserver.unobserve(entry.target);
          return;
        }

        const speedMultiplier = getScrollSpeedMultiplier();

        // 1. Heading: Smoothly drops down into place
        if (heading) {
          heading.style.willChange = "opacity, transform";
          heading.animate(
            [
              { opacity: 0, transform: "translateY(-30px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
          );
        }

        // 2. Intro: Fades and slides up slightly
        if (intro) {
          intro.style.willChange = "opacity, transform";
          setTimeout(() => {
            intro.animate(
              [{ opacity: 0, transform: "translateY(25px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 150 * speedMultiplier);
        }

        // 3. Image: Slides in from the right (Safe distance, NO 100vw)
        if (image) {
          image.style.willChange = "opacity, transform";
          setTimeout(() => {
            image.animate(
              [{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "translateX(0)" }],
              { duration: 900 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 300 * speedMultiplier);
        }

        // 4. Description: Fades and slides up
        if (description) {
          description.style.willChange = "opacity, transform";
          setTimeout(() => {
            description.animate(
              [{ opacity: 0, transform: "translateY(25px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 450 * speedMultiplier);
        }

        // 5. Features: COOL staggered alternating slide-in (100% Safe from jumps)
        const FEATURES_START = 600 * speedMultiplier;
        const FEATURE_STAGGER = 100 * speedMultiplier; // Fast, snappy stagger

        if (featuresContainer) {
          featuresContainer.style.opacity = "1";
        }

        features.forEach((feature, index) => {
          feature.style.willChange = "opacity, transform";
          feature.style.opacity = "0";
          
          // 80px is the sweet spot: noticeable and cool, but safely inside the viewport 
          // so it NEVER triggers a scrollbar or layout shift like 100vw did.
          const startTransform = index % 2 === 0 ? "translateX(-80px)" : "translateX(80px)";
          feature.style.transform = startTransform;
          
          setTimeout(() => {
            feature.animate(
              [{ opacity: 0, transform: startTransform }, { opacity: 1, transform: "translateX(0)" }],
              { duration: 600 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
            
            // Subtle icon pop for extra polish
            const icon = feature.querySelector("i");
            if (icon) {
              setTimeout(() => {
                icon.animate(
                  [
                    { transform: "scale(0.8)", opacity: 0.5 }, 
                    { transform: "scale(1.15)", opacity: 1, offset: 0.7 }, 
                    { transform: "scale(1)", opacity: 1 }
                  ],
                  { duration: 400 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
                );
              }, 200 * speedMultiplier);
            }
          }, FEATURES_START + (index * FEATURE_STAGGER));
        });

        // 6. Button: Subtle pop-in with bounce
        if (button) {
          button.style.willChange = "opacity, transform";
          const buttonStart = FEATURES_START + (features.length * FEATURE_STAGGER) + 200 * speedMultiplier;
          setTimeout(() => {
            button.animate(
              [
                { opacity: 0, transform: "translateY(15px) scale(0.95)" },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              { duration: 600 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
            );
          }, buttonStart);
        }

        aboutObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  aboutObserver.observe(aboutSection);
}


// ============================================================
// OFFER SECTION — SPED UP FOR MOBILE + DESKTOP TIMING
// ============================================================

const offerSection = document.querySelector(".offer");

if (offerSection) {
  const heading = offerSection.querySelector(".offer1");
  const subtitle = offerSection.querySelector(".offer2");
  const cards = offerSection.querySelectorAll(".offerCard");

  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  function getTimingProfile() {
    const isLargeScreen = window.innerWidth >= 1024;
    return isLargeScreen
      ? {
          headingDuration: 900,
          subtitleDelay: 500,
          subtitleDuration: 750,
          cardsStart: 1150,
          cardStagger: 450,
          cardDuration: 850,
          iconDelay: 450,
          iconDuration: 500
        }
      : {
          // 🚀 SPED UP for mobile so it feels snappy and modern, not sluggish
          headingDuration: 800,
          subtitleDelay: 400,
          subtitleDuration: 600,
          cardsStart: 800,
          cardStagger: 250,       // Much faster stagger between cards
          cardDuration: 700,       // Faster card animation
          iconDelay: 300,
          iconDuration: 400
        };
  }

  const offerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (isInstantScroll()) {
          snapToEndState(heading, { opacity: "1", transform: "none" });
          snapToEndState(subtitle, { opacity: "1", transform: "none" });
          cards.forEach((card) => {
            snapToEndState(card, { opacity: "1", transform: "none" });
            const icon = card.querySelector("span:first-child");
            snapToEndState(icon, { opacity: "1", transform: "none" });
          });
          offerObserver.unobserve(entry.target);
          return;
        }

        const timing = getTimingProfile();
        const speedMultiplier = getScrollSpeedMultiplier();

        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(40px) scale(0.92)" },
              { opacity: 1, transform: "translateY(0) scale(1.02)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            { duration: timing.headingDuration * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
          );
        }

        if (subtitle) {
          setTimeout(() => {
            subtitle.animate(
              [{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: timing.subtitleDuration * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, timing.subtitleDelay * speedMultiplier);
        }

        cards.forEach((card, index) => {
          const startAt = timing.cardsStart * speedMultiplier + index * timing.cardStagger * speedMultiplier;
          setTimeout(() => {
            card.animate(
              [
                { opacity: 0, transform: "perspective(1400px) rotateX(-45deg) translateY(70px) scale(0.85)" },
                { opacity: 1, transform: "perspective(1400px) rotateX(0deg) translateY(0) scale(1)" }
              ],
              { duration: timing.cardDuration * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );

            const icon = card.querySelector("span:first-child");
            if (icon) {
              setTimeout(() => {
                icon.animate(
                  [
                    { transform: "scale(0.4) rotate(-15deg)", opacity: 0 },
                    { transform: "scale(1.15) rotate(4deg)", opacity: 1, offset: 0.7 },
                    { transform: "scale(1) rotate(0deg)", opacity: 1 }
                  ],
                  { duration: timing.iconDuration * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
                );
              }, timing.iconDelay * speedMultiplier);
            }
          }, startAt);
        });

        offerObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  offerObserver.observe(offerSection);
}


// ============================================================
// GALLERY SECTION — ORIGINAL TIMING RESTORED
// ============================================================

const gallerySection = document.querySelector(".gallery");

if (gallerySection) {
  const heading = gallerySection.querySelector(".gallery > div:nth-child(1)");
  const subtitle = gallerySection.querySelector(".gallery > div:nth-child(2)");
  const wrap = gallerySection.querySelector(".galleryWrap");

  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (isInstantScroll()) {
          snapToEndState(heading, { opacity: "1", transform: "none" });
          snapToEndState(subtitle, { opacity: "1", transform: "none" });
          snapToEndState(wrap, { opacity: "1", transform: "none" });
          galleryObserver.unobserve(entry.target);
          return;
        }

        const speedMultiplier = getScrollSpeedMultiplier();

        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(40px) scale(0.92)" },
              { opacity: 1, transform: "translateY(0) scale(1.02)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            { duration: 900 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
          );
        }

        if (subtitle) {
          setTimeout(() => {
            subtitle.animate(
              [{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 500 * speedMultiplier);
        }

        if (wrap) {
          setTimeout(() => {
            wrap.animate(
              [{ opacity: 0, transform: "translateY(35px) scale(0.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }],
              { duration: 1000 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 1050 * speedMultiplier);
        }

        galleryObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  galleryObserver.observe(gallerySection);
}


// ============================================================
// FOOTER SECTION — CREATIVE ALTERNATING ENTRANCES
// ============================================================

const footerSection = document.querySelector(".footer");

if (footerSection) {
  const brand = footerSection.querySelector(".footerBrand");
  const columns = footerSection.querySelectorAll(".footerCol");
  const copyright = document.querySelector(".copyright");

  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (isInstantScroll()) {
          snapToEndState(brand, { opacity: "1", transform: "none", filter: "none" });
          columns.forEach((col) => snapToEndState(col, { opacity: "1", transform: "none" }));
          snapToEndState(copyright, { opacity: "1", transform: "none" });
          footerObserver.unobserve(entry.target);
          return;
        }

        const speedMultiplier = getScrollSpeedMultiplier();

        // Brand drops in with a bounce and blur
        if (brand) {
          brand.animate(
            [
              { opacity: 0, transform: "translateY(-40px) scale(0.85)", filter: "blur(5px)" },
              { opacity: 1, transform: "translateY(8px) scale(1.02)", filter: "blur(0px)", offset: 0.6 },
              { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" }
            ],
            { duration: 950 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
          );
        }

        const COLUMNS_START = 500 * speedMultiplier;
        const COLUMN_STAGGER = 150 * speedMultiplier; 

        // Columns alternate entering from left and right with a slight scale/translation
        columns.forEach((col, index) => {
          const startAt = COLUMNS_START + index * COLUMN_STAGGER;
          setTimeout(() => {
            col.animate(
              [
                { opacity: 0, transform: `${index % 2 === 0 ? "translateX(-40px)" : "translateX(40px)"} translateY(20px) scale(0.9)` },
                { opacity: 1, transform: "translateX(0) translateY(0) scale(1)" }
              ],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, startAt);
        });

        const copyrightStart = COLUMNS_START + columns.length * COLUMN_STAGGER + 400 * speedMultiplier;

        // Copyright smoothly pops up with a slight bounce
        if (copyright) {
          setTimeout(() => {
            copyright.animate(
              [
                { opacity: 0, transform: "translateY(20px) scale(0.95)" },
                { opacity: 1, transform: "translateY(-4px) scale(1.02)", offset: 0.6 },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              { duration: 700 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
            );
          }, copyrightStart);
        }

        footerObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  footerObserver.observe(footerSection);
}


// ============================================================
// SUBSCRIBE SECTION — ORIGINAL TIMING RESTORED
// ============================================================

const subscribeSection = document.querySelector(".subscribe");

if (subscribeSection) {
  const box = subscribeSection.querySelector(".subscribeBox");
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const subscribeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (isInstantScroll()) {
          snapToEndState(box, { opacity: "1", transform: "none" });
          subscribeObserver.unobserve(entry.target);
          return;
        }

        const speedMultiplier = getScrollSpeedMultiplier();

        if (box) {
          box.animate(
            [
              { opacity: 0, transform: "translateY(50px) scale(0.94)" },
              { opacity: 1, transform: "translateY(0) scale(1.02)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            { duration: 900 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
          );
        }

        subscribeObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  subscribeObserver.observe(subscribeSection);
}


// ============================================================
// NEWSLETTER SUBSCRIPTION API INTEGRATION
// ============================================================

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function showSubscribeMessage(message, type) {
  const subscribeBox = document.querySelector('.subscribeBox');
  if (!subscribeBox) return;

  subscribeBox.style.position = 'relative';

  const existingMsg = document.querySelector('.subscribe-message');
  if (existingMsg) existingMsg.remove();

  const msgDiv = document.createElement('div');
  msgDiv.className = `subscribe-message ${type}`;
  msgDiv.textContent = message;
  
  msgDiv.style.position = 'absolute';
  msgDiv.style.bottom = '-30px';
  msgDiv.style.left = '50%';
  msgDiv.style.transform = 'translateX(-50%)';
  msgDiv.style.width = '100%';
  msgDiv.style.fontSize = '13px';
  msgDiv.style.fontWeight = '500';
  msgDiv.style.color = type === 'success' ? '#22c55e' : '#ef4444'; 
  msgDiv.style.textAlign = 'center';
  msgDiv.style.whiteSpace = 'nowrap';
  msgDiv.style.zIndex = '10';
  msgDiv.style.pointerEvents = 'none';

  subscribeBox.appendChild(msgDiv);

  setTimeout(() => {
    if (msgDiv.parentNode) {
      msgDiv.style.transition = 'opacity 0.4s ease';
      msgDiv.style.opacity = '0';
      setTimeout(() => {
        if (msgDiv.parentNode) msgDiv.remove();
      }, 400);
    }
  }, 4000);
}

function initSubscribeForm() {
  const subscribeForm = document.querySelector('.subscribeForm');
  if (!subscribeForm) return;
  
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = subscribeForm.querySelector('input[name="email"]');
    const submitButton = subscribeForm.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
    if (!email) {
      showSubscribeMessage('Please enter a valid email address.', 'error');
      return;
    }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';

    try {
      const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : (typeof BASE_API_URL !== 'undefined' ? BASE_API_URL : '');
      const apiUrl = `${baseUrl}/api/core/subscribe/`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') 
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (response.ok) {
        showSubscribeMessage('Successfully subscribed to our newsletter!', 'success');
        emailInput.value = '';
      } else {
        const errorMsg = data.email ? data.email[0] : (data.detail || 'Failed to subscribe. Please try again.');
        showSubscribeMessage(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showSubscribeMessage('A network error occurred. Please try again later.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}


// ============================================================
// GALLERY API INTEGRATION
// ============================================================

async function loadGalleryImages() {
  const trackLeft = document.getElementById('gallery-track-left');
  const trackRight = document.getElementById('gallery-track-right');
  
  if (!trackLeft || !trackRight) {
    console.warn('Gallery tracks not found');
    return;
  }

  const apiUrl = typeof BASE_API_URL !== 'undefined' ? BASE_API_URL : 'http://127.0.0.1:8000';
  const galleryEndpoint = `${apiUrl}/api/core/gallery/`;

  trackLeft.innerHTML = '<span style="padding: 20px; color: #777;">Loading gallery...</span>';
  trackRight.innerHTML = '';

  try {
    const response = await fetch(galleryEndpoint);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    const images = await response.json();
    
    if (images.length === 0) {
      trackLeft.innerHTML = '<span style="padding: 20px; color: #777;">No gallery images available</span>';
      trackRight.innerHTML = '';
      return;
    }

    trackLeft.innerHTML = '';
    trackRight.innerHTML = '';

    const createImageSpan = (imageUrl, title) => {
      const span = document.createElement('span');
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = title || 'Gallery image';
      img.loading = 'lazy';
      
      img.onerror = function() {
        this.src = 'src/image/download (4).jpg';
      };
      
      span.appendChild(img);
      return span;
    };

    const MIN_IMAGES = 7;
    const repeatCount = Math.ceil(MIN_IMAGES / images.length);
    
    const extendedImages = [];
    for (let i = 0; i < repeatCount; i++) {
      extendedImages.push(...images);
    }
    
    const imagesForTrack = extendedImages.slice(0, MIN_IMAGES);

    imagesForTrack.forEach((image) => {
      trackLeft.appendChild(createImageSpan(image.image, image.title));
    });
    imagesForTrack.forEach((image) => {
      trackLeft.appendChild(createImageSpan(image.image, image.title));
    });

    const reversedImages = [...imagesForTrack].reverse();
    reversedImages.forEach((image) => {
      trackRight.appendChild(createImageSpan(image.image, image.title));
    });
    reversedImages.forEach((image) => {
      trackRight.appendChild(createImageSpan(image.image, image.title));
    });

    console.log(`Gallery loaded: ${images.length} unique images, repeated to get ${MIN_IMAGES} per track`);

  } catch (error) {
    console.error('Error loading gallery:', error);
    trackLeft.innerHTML = '<span style="padding: 20px; color: #d32f2f;">Failed to load gallery</span>';
    trackRight.innerHTML = '';
  }
}


// ============================================================
// INFINITE INNOVATION CAROUSEL FIX
// ============================================================
function fixInnovationCarousel() {
  const innovationTrack = document.querySelector('.innovation');
  if (!innovationTrack) return;

  if (innovationTrack.dataset.duplicated === 'true') return;

  const originalItems = Array.from(innovationTrack.children);
  if (originalItems.length === 0) return;

  originalItems.forEach(item => {
    innovationTrack.appendChild(item.cloneNode(true));
  });
  
  innovationTrack.dataset.duplicated = 'true';
}

document.addEventListener('DOMContentLoaded', fixInnovationCarousel);
window.addEventListener('resize', fixInnovationCarousel);


// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadGalleryImages();
  }, 100);
  
  initSubscribeForm();
});