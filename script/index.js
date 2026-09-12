// ============================================================
// DISABLE BROWSER SCROLL ANCHORING GLOBALLY
// Scroll anchoring is a browser feature that silently adjusts scrollTop
// to "compensate" for layout shifts near the viewport. It's the actual
// cause of the jump — even small, transform-only shifts can trigger it.
// Turning it off here removes the entire category of jump, regardless
// of what causes the underlying shift.
// ============================================================
document.documentElement.style.overflowAnchor = "none";
document.body.style.overflowAnchor = "none";


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
// ABOUT SECTION — DYNAMIC ALTERNATING FEATURES
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

  // Belt-and-suspenders: prevent this section and its features container
  // from ever producing a scrollable overflow area that could shift layout.
  aboutSection.style.overflowAnchor = "none";
  if (featuresContainer) {
    featuresContainer.style.overflow = "hidden";
    featuresContainer.style.overflowAnchor = "none";
  }

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

        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(45px) scale(0.9)" },
              { opacity: 1, transform: "translateY(0) scale(1.03)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            { duration: 900 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
          );
        }

        if (intro) {
          setTimeout(() => {
            intro.animate(
              [{ opacity: 0, transform: "translateY(30px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 500 * speedMultiplier);
        }

        if (image) {
          setTimeout(() => {
            image.animate(
              [{ opacity: 0, transform: "translateX(70px) scale(0.92) rotate(2deg)" }, { opacity: 1, transform: "translateX(0) scale(1) rotate(0deg)" }],
              { duration: 1100 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
            image.style.willChange = "opacity, transform";
          }, 1050 * speedMultiplier);
        }

        if (description) {
          setTimeout(() => {
            description.animate(
              [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 800 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
          }, 1700 * speedMultiplier);
        }

        // --- FEATURES: ALTERNATING LEFT/RIGHT + FAST STAGGER ---
        // FIX: previously these used translateX(-100vw)/translateX(100vw) as the
        // starting position. A transform that large still contributes to the
        // element's layout box for scroll-anchoring/overflow purposes, so the
        // page's scrollable area briefly ballooned out to ~2x viewport width
        // right as this section entered view. The browser's scroll anchoring
        // then "corrected" for that shift, which is what caused the jump back
        // up the page. Using a small, container-relative offset (60px) keeps
        // the same slide-in effect without blowing out the layout bounds.
        const FEATURES_START = 2350 * speedMultiplier;
        const FAST_FEATURE_STAGGER = 120 * speedMultiplier; // Much faster stagger
        const FEATURE_SLIDE_DISTANCE = 40; // px, was 100vw

        // Setup initial hidden states with alternating directions
        features.forEach((feature, index) => {
          feature.style.opacity = "0";
          feature.style.transform = index % 2 === 0
            ? `translateX(-${FEATURE_SLIDE_DISTANCE}px)`
            : `translateX(${FEATURE_SLIDE_DISTANCE}px)`;
        });

        if (featuresContainer) {
          setTimeout(() => { featuresContainer.style.opacity = "1"; }, FEATURES_START);
        }

        features.forEach((feature, index) => {
          const startAt = FEATURES_START + index * FAST_FEATURE_STAGGER;
          const startTransform = index % 2 === 0
            ? `translateX(-${FEATURE_SLIDE_DISTANCE}px)`
            : `translateX(${FEATURE_SLIDE_DISTANCE}px)`;

          setTimeout(() => {
            feature.animate(
              [{ opacity: 0, transform: startTransform }, { opacity: 1, transform: "translateX(0)" }],
              { duration: 900 * speedMultiplier, easing: EASE_OUT, fill: "forwards" }
            );
            const icon = feature.querySelector("i");
            if (icon) {
              setTimeout(() => {
                icon.animate(
                  [
                    { transform: "scale(0.5)", opacity: 0 }, 
                    { transform: "scale(1.15)", opacity: 1, offset: 0.7 }, 
                    { transform: "scale(1)", opacity: 1 }
                  ],
                  { duration: 500 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
                );
              }, 500 * speedMultiplier);
            }
          }, startAt);
        });

        const buttonStart = FEATURES_START + features.length * FAST_FEATURE_STAGGER + 900 * speedMultiplier + 200 * speedMultiplier;
        if (button) {
          setTimeout(() => {
            button.animate(
              [
                { opacity: 0, transform: "translateY(24px) scale(0.9)" },
                { opacity: 1, transform: "translateY(-3px) scale(1.04)", offset: 0.7 },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              { duration: 700 * speedMultiplier, easing: EASE_BOUNCE, fill: "forwards" }
            );
          }, buttonStart);
        }

        aboutObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  aboutObserver.observe(aboutSection);
}


// ============================================================
// OFFER SECTION — ORIGINAL TIMING + MOBILE STACKING EFFECT
// ============================================================

const offerSection = document.querySelector(".offer");

if (offerSection) {
  const heading = offerSection.querySelector(".offer1");
  const subtitle = offerSection.querySelector(".offer2");
  const cards = offerSection.querySelectorAll(".offerCard");

  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  offerSection.style.overflowAnchor = "none";

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
          headingDuration: 1400,
          subtitleDelay: 900,
          subtitleDuration: 1200,
          cardsStart: 2200,
          cardStagger: 850,
          cardDuration: 1400,
          iconDelay: 800,
          iconDuration: 800
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

  gallerySection.style.overflowAnchor = "none";

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

  footerSection.style.overflowAnchor = "none";

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

  subscribeSection.style.overflowAnchor = "none";

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

  // Ensure the container is relatively positioned so the message anchors to it
  subscribeBox.style.position = 'relative';

  const existingMsg = document.querySelector('.subscribe-message');
  if (existingMsg) existingMsg.remove();

  const msgDiv = document.createElement('div');
  msgDiv.className = `subscribe-message ${type}`;
  msgDiv.textContent = message;
  
  // Absolute positioning prevents the container from expanding or shifting layout
  msgDiv.style.position = 'absolute';
  msgDiv.style.bottom = '-30px'; // Floats just below the box
  msgDiv.style.left = '50%';
  msgDiv.style.transform = 'translateX(-50%)';
  msgDiv.style.width = '100%';
  msgDiv.style.fontSize = '13px';
  msgDiv.style.fontWeight = '500';
  msgDiv.style.color = type === 'success' ? '#22c55e' : '#ef4444'; 
  msgDiv.style.textAlign = 'center';
  msgDiv.style.whiteSpace = 'nowrap'; // Prevents text wrapping from affecting layout
  msgDiv.style.zIndex = '10';
  msgDiv.style.pointerEvents = 'none'; // Allows clicking through the message if it overlaps anything

  subscribeBox.appendChild(msgDiv);

  // Auto-remove with a smooth fade-out
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
      // Checks for API_BASE_URL or BASE_API_URL (whichever you defined in config.js)
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
        emailInput.value = ''; // Clear input on success
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

  // ✅ FIXED: Changed BASE_API_URL to API_BASE_URL to match config.js
  const apiUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://pihub-backend.onrender.com';
  
  // ✅ FIXED: Point to the working staff gallery endpoint
  const galleryEndpoint = `${apiUrl}/api/core/staff/gallery/`;

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

    console.log(`✅ Gallery loaded successfully from: ${apiUrl}`);

  } catch (error) {
    console.error('❌ Error loading gallery:', error);
    trackLeft.innerHTML = '<span style="padding: 20px; color: #d32f2f;">Failed to load gallery</span>';
    trackRight.innerHTML = '';
  }
}


// ============================================================
// INFINITE INNOVATION CAROUSEL FIX
// Ensures the hero carousel is always duplicated for a seamless infinite loop
// This guarantees it never "finishes" and stays full-width on any device.
// ============================================================
function fixInnovationCarousel() {
  const innovationTrack = document.querySelector('.innovation');
  if (!innovationTrack) return;

  // Check if it's already been duplicated by this script to prevent infinite loops
  if (innovationTrack.dataset.duplicated === 'true') return;

  const originalItems = Array.from(innovationTrack.children);
  if (originalItems.length === 0) return;

  // Clone the original set and append it to make it exactly 2x the length.
  // This ensures the CSS animation `transform: translateX(-50%)` loops perfectly
  // without gaps, regardless of screen width.
  originalItems.forEach(item => {
    innovationTrack.appendChild(item.cloneNode(true));
  });
  
  innovationTrack.dataset.duplicated = 'true';
}

// Run on load and resize to guarantee it's always perfect
document.addEventListener('DOMContentLoaded', fixInnovationCarousel);
window.addEventListener('resize', fixInnovationCarousel);


// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadGalleryImages();
  }, 100);
  
  // Initialize subscription form handler
  initSubscribeForm();
});