// ============================================================
// DISABLE BROWSER SCROLL ANCHORING GLOBALLY
// ============================================================
document.documentElement.style.overflowAnchor = "none";
document.body.style.overflowAnchor = "none";

// ============================================================
// GLOBAL SCROLL SPEED TRACKER
// ============================================================
let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let currentScrollSpeed = 0;

window.addEventListener("scroll", () => {
  const now = performance.now();
  const deltaY = Math.abs(window.scrollY - lastScrollY);
  const deltaTime = now - lastScrollTime || 1;
  currentScrollSpeed = deltaY / deltaTime;
  lastScrollY = window.scrollY;
  lastScrollTime = now;
}, { passive: true });

const FAST_SCROLL_THRESHOLD = 1.5;
const INSTANT_THRESHOLD = 3;

function getScrollSpeedMultiplier() {
  return currentScrollSpeed > FAST_SCROLL_THRESHOLD ? 0.15 : 1;
}

function isInstantScroll() {
  return currentScrollSpeed > INSTANT_THRESHOLD;
}

function snapToEndState(el, endStyles) {
  if (!el) return;
  Object.assign(el.style, endStyles);
}

// ============================================================
// HERO SEQUENTIAL & CONCURRENT ANIMATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  
  const motto = document.getElementById('motto');
  const staticTextEl = document.getElementById('staticText');
  const heroNextEl = document.getElementById('heroNext');
  const heroText = document.getElementById('heroText');
  const buttons = document.querySelector('.buttons');
  const toWordEl = document.querySelector('.toWord');
  const cursorEl = document.querySelector('.cursor');

  // 1. FORCE HIDE & KILL CSS ANIMATIONS (Prevents Flashing)
  [motto, heroText, buttons].forEach(el => {
    if(el) {
      el.style.animation = 'none';
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
    }
  });

  // Hide "to" and the cursor until the static text finishes typing (prevents them appearing instantly)
  if (toWordEl) toWordEl.style.opacity = '0';
  if (cursorEl) {
    // The CSS blink animation overrides inline opacity while running, so it
    // must be disabled here too, not just faded to 0 — otherwise the cursor
    // keeps blinking in place during the "Your all in one space" typing.
    cursorEl.style.animation = 'none';
    cursorEl.style.opacity = '0';
  }

  // 2. START HERO TEXT & BUTTONS IMMEDIATELY (Concurrent)
  setTimeout(() => {
    if (heroText) {
      heroText.style.visibility = 'visible';
      heroText.animate(
        [
          { opacity: 0, transform: 'translateX(-100px)' }, 
          { opacity: 1, transform: 'translateX(0)' }       
        ],
        { 
          duration: 1000, 
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)', 
          fill: 'forwards' 
        }
      );
    }

    if (buttons) {
      buttons.style.visibility = 'visible';
      buttons.animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { 
          duration: 800, 
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)', 
          fill: 'forwards',
          delay: 200
        }
      );
    }
  }, 400);

  // 3. START MOTTO TYPING SEQUENCE
  setTimeout(() => {
    if (motto) {
      motto.style.visibility = 'visible';
      motto.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    }

    // ✅ FIXED: Clear the text first before typing
    staticTextEl.textContent = '';
    
    // Type the static text
    const staticString = "Your all in one space ";
    let sIndex = 0;
    
    function typeStatic() {
      if (sIndex < staticString.length) {
        staticTextEl.textContent += staticString.charAt(sIndex);
        sIndex++;
        setTimeout(typeStatic, 40);
      } else {
        // Reveal "to" and the cursor right after "space" finishes typing, then start cycling words
        if (toWordEl) {
          toWordEl.style.transition = 'opacity 0.3s ease';
          toWordEl.style.opacity = '1';
        }
        if (cursorEl) {
          cursorEl.style.transition = 'opacity 0.3s ease';
          cursorEl.style.opacity = '1';
          // Re-enable the blink animation only after the fade-in finishes,
          // so it doesn't immediately fight the opacity transition.
          setTimeout(() => {
            cursorEl.style.animation = 'blink 1s step-end infinite';
          }, 300);
        }
        setTimeout(startCycling, 250);
      }
    }
    typeStatic();

    // Infinite Cycling Loop
    function startCycling() {
      const words = ['Learn', 'Build', 'Connect'];
      let wIndex = 0;
      let cIndex = 0;
      let isDeleting = false;

      function cycle() {
        const word = words[wIndex];
        
        if (isDeleting) {
          heroNextEl.textContent = word.substring(0, cIndex - 1);
          cIndex--;
          
          if (cIndex === 0) {
            isDeleting = false;
            wIndex = (wIndex + 1) % words.length;
            setTimeout(cycle, 300);
          } else {
            setTimeout(cycle, 40);
          }
        } else {
          heroNextEl.textContent = word.substring(0, cIndex + 1);
          cIndex++;
          
          if (cIndex === word.length) {
            isDeleting = true;
            setTimeout(cycle, 2000);
          } else {
            setTimeout(cycle, 80);
          }
        }
      }
      cycle();
    }
  }, 800);
});

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

        const FEATURES_START = 2350 * speedMultiplier;
        const FAST_FEATURE_STAGGER = 120 * speedMultiplier;
        const FEATURE_SLIDE_DISTANCE = 40;

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
          headingDuration: 700,
          subtitleDelay: 300,
          subtitleDuration: 550,
          cardsStart: 650,
          cardStagger: 220,
          cardDuration: 600,
          iconDelay: 250,
          iconDuration: 400
        }
      : {
          headingDuration: 800,
          subtitleDelay: 400,
          subtitleDuration: 650,
          cardsStart: 900,
          cardStagger: 350,
          cardDuration: 700,
          iconDelay: 350,
          iconDuration: 450
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

  const apiUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://pihub-backend.onrender.com';
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