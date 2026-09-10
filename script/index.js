// ============================================================
// GLOBAL SCROLL SPEED TRACKER
//
// Measures how fast the user is scrolling (in pixels per
// millisecond) so each section's entrance animation can adapt:
// slow/normal scroll -> full cinematic timing, fast scroll ->
// compressed timing, very fast flick -> instant snap to end
// state (skip animation entirely).
//
// This must be defined ONCE, before any section script uses it.
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

// Tune these two by testing on your own trackpad/mouse wheel/phone
const FAST_SCROLL_THRESHOLD = 1.5; // px/ms - compress timing above this
const INSTANT_THRESHOLD = 3; // px/ms - skip animation, snap to end state

// Returns a multiplier to apply to every delay/duration in a
// section's animation sequence, based on scroll speed AT THE
// MOMENT the section's observer fires.
function getScrollSpeedMultiplier() {
  if (currentScrollSpeed > FAST_SCROLL_THRESHOLD) return 0.15;
  return 1;
}

function isInstantScroll() {
  return currentScrollSpeed > INSTANT_THRESHOLD;
}

// Immediately sets an element to its animation's end state,
// with no transition, for use when the user scrolled too fast
// to realistically see an animated entrance play out.
function snapToEndState(el, endStyles) {
  if (!el) return;
  Object.assign(el.style, endStyles);
}


// ============================================================
// HERO SEQUENTIAL INTRO
// ============================================================

function typeTextSequential(el, speed = 22, startDelay = 1000) {
  if (!el) return Promise.resolve();

  const fullText = el.textContent.trim();

  // Clear paragraph before typing
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
          // Typing is COMPLETELY finished
          resolve();
        }
      }

      step();
    }, startDelay);
  });
}


// ============================================================
// HERO INTRO SEQUENCE
// ============================================================

async function initHeroIntro() {

  const heroText = document.getElementById("heroText");

  if (!heroText) {
    console.warn("Hero text #heroText was not found.");
    return;
  }

  // ----------------------------------------------------------
  // Find the hero button
  //
  // FIX: this previously fell back to `.about-btn` when
  // `.hero-btn` wasn't found, which always matched the About
  // section's "Learn more" button instead. Only ever target
  // `.hero-btn`, no fallback. Add class="hero-btn" to the
  // hero's "Explore" link in the HTML.
  // ----------------------------------------------------------

  const heroButton = document.querySelector(".hero-btn");


  // ----------------------------------------------------------
  // Make sure paragraph starts hidden
  // ----------------------------------------------------------

  heroText.style.opacity = "0";


  // ----------------------------------------------------------
  // TYPE PARAGRAPH
  //
  // Nothing after this happens until typing is 100% complete.
  // Hero intro runs once on page load, before any scrolling can
  // happen, so it does not need scroll-speed adaptation.
  // ----------------------------------------------------------

  await typeTextSequential(heroText, 22, 1000);


  // ----------------------------------------------------------
  // PARAGRAPH IS FINISHED
  // Now introduce the button.
  // ----------------------------------------------------------

  if (heroButton) {

    await new Promise((resolve) => {
      heroButton.animate(
        [
          {
            opacity: 0,
            transform: "translateY(20px) scale(0.96)"
          },
          {
            opacity: 1,
            transform: "translateY(0) scale(1)"
          }
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


// ============================================================
// START HERO
// ============================================================

initHeroIntro();



// ============================================================
// ABOUT SECTION — DRAMATIC SEQUENTIAL ENTRANCE
// Now scroll-speed adaptive: fast scroll compresses timing,
// very fast scroll snaps straight to the end state.
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

        // ------------------------------------------------
        // VERY FAST SCROLL — skip animation, snap to final
        // ------------------------------------------------

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

        // ------------------------------------------------
        // NORMAL OR FAST SCROLL — play animation, timing
        // compressed by speedMultiplier when scrolling fast
        // ------------------------------------------------

        const speedMultiplier = getScrollSpeedMultiplier();

        // 1. HEADING
        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(45px) scale(0.9)" },
              { opacity: 1, transform: "translateY(0) scale(1.03)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            {
              duration: 900 * speedMultiplier,
              easing: EASE_BOUNCE,
              fill: "forwards"
            }
          );
        }

        // 2. INTRO TEXT
        if (intro) {
          setTimeout(() => {
            intro.animate(
              [
                { opacity: 0, transform: "translateY(30px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 800 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, 500 * speedMultiplier);
        }

        // 3. IMAGE
        if (image) {
          setTimeout(() => {
            image.animate(
              [
                { opacity: 0, transform: "translateX(70px) scale(0.92) rotate(2deg)" },
                { opacity: 1, transform: "translateX(0) scale(1) rotate(0deg)" }
              ],
              {
                duration: 1100 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, 1050 * speedMultiplier);

          image.style.willChange = "opacity, transform";
        }

        // 4. DESCRIPTION
        if (description) {
          setTimeout(() => {
            description.animate(
              [
                { opacity: 0, transform: "translateY(28px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 800 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, 1700 * speedMultiplier);
        }

        // 5. FEATURES
        const FEATURES_START = 2350 * speedMultiplier;
        const FEATURE_STAGGER = 650 * speedMultiplier;

        features.forEach((feature) => {
          feature.style.opacity = "0";
          feature.style.transform = "translateX(-100vw)";
        });

        if (featuresContainer) {
          setTimeout(() => {
            featuresContainer.style.opacity = "1";
          }, FEATURES_START);
        }

        features.forEach((feature, index) => {
          const startAt = FEATURES_START + index * FEATURE_STAGGER;

          setTimeout(() => {
            feature.animate(
              [
                { opacity: 0, transform: "translateX(-100vw)" },
                { opacity: 1, transform: "translateX(0)" }
              ],
              {
                duration: 1300 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );

            const icon = feature.querySelector("i");
            if (icon) {
              setTimeout(() => {
                icon.animate(
                  [
                    { transform: "scale(0.7)", opacity: 0 },
                    { transform: "scale(1)", opacity: 1 }
                  ],
                  {
                    duration: 400 * speedMultiplier,
                    easing: EASE_OUT,
                    fill: "forwards"
                  }
                );
              }, 900 * speedMultiplier);
            }
          }, startAt);
        });

        // 6. LEARN MORE BUTTON
        const buttonStart =
          FEATURES_START +
          (features.length - 1) * FEATURE_STAGGER +
          1300 * speedMultiplier +
          200 * speedMultiplier;

        if (button) {
          setTimeout(() => {
            button.animate(
              [
                { opacity: 0, transform: "translateY(24px) scale(0.9)" },
                { opacity: 1, transform: "translateY(-3px) scale(1.04)", offset: 0.7 },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              {
                duration: 700 * speedMultiplier,
                easing: EASE_BOUNCE,
                fill: "forwards"
              }
            );
          }, buttonStart);
        }

        aboutObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.2
    }
  );

  aboutObserver.observe(aboutSection);
}

// ============================================================
// OFFER SECTION — SEQUENTIAL ENTRANCE
// Desktop/mobile speed profile PLUS scroll-speed adaptation.
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

        // VERY FAST SCROLL — snap to final state
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

        // 1. HEADING
        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(40px) scale(0.92)" },
              { opacity: 1, transform: "translateY(0) scale(1.02)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            {
              duration: timing.headingDuration * speedMultiplier,
              easing: EASE_BOUNCE,
              fill: "forwards"
            }
          );
        }

        // 2. SUBTITLE
        if (subtitle) {
          setTimeout(() => {
            subtitle.animate(
              [
                { opacity: 0, transform: "translateY(26px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: timing.subtitleDuration * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, timing.subtitleDelay * speedMultiplier);
        }

        // 3. CARDS
        cards.forEach((card, index) => {

          const startAt =
            timing.cardsStart * speedMultiplier +
            index * timing.cardStagger * speedMultiplier;

          setTimeout(() => {

            card.animate(
              [
                {
                  opacity: 0,
                  transform:
                    "perspective(1400px) rotateX(-45deg) translateY(70px) scale(0.85)"
                },
                {
                  opacity: 1,
                  transform:
                    "perspective(1400px) rotateX(0deg) translateY(0) scale(1)"
                }
              ],
              {
                duration: timing.cardDuration * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
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
                  {
                    duration: timing.iconDuration * speedMultiplier,
                    easing: EASE_BOUNCE,
                    fill: "forwards"
                  }
                );
              }, timing.iconDelay * speedMultiplier);
            }

          }, startAt);

        });

        offerObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.15
    }
  );

  offerObserver.observe(offerSection);
}

// ============================================================
// GALLERY SECTION — SEQUENTIAL ENTRANCE (scroll-speed adaptive)
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

        // 1. HEADING
        if (heading) {
          heading.animate(
            [
              { opacity: 0, transform: "translateY(40px) scale(0.92)" },
              { opacity: 1, transform: "translateY(0) scale(1.02)", offset: 0.75 },
              { opacity: 1, transform: "translateY(0) scale(1)" }
            ],
            {
              duration: 900 * speedMultiplier,
              easing: EASE_BOUNCE,
              fill: "forwards"
            }
          );
        }

        // 2. SUBTITLE
        if (subtitle) {
          setTimeout(() => {
            subtitle.animate(
              [
                { opacity: 0, transform: "translateY(26px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 800 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, 500 * speedMultiplier);
        }

        // 3. GALLERY STRIP
        if (wrap) {
          setTimeout(() => {
            wrap.animate(
              [
                { opacity: 0, transform: "translateY(35px) scale(0.97)" },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              {
                duration: 1000 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, 1050 * speedMultiplier);
        }

        galleryObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.15
    }
  );

  galleryObserver.observe(gallerySection);
}


// ============================================================
// FOOTER SECTION — SEQUENTIAL ENTRANCE (scroll-speed adaptive)
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
          snapToEndState(brand, { opacity: "1", transform: "none" });
          columns.forEach((col) => snapToEndState(col, { opacity: "1", transform: "none" }));
          snapToEndState(copyright, { opacity: "1", transform: "none" });

          footerObserver.unobserve(entry.target);
          return;
        }

        const speedMultiplier = getScrollSpeedMultiplier();

        // 1. BRAND
        if (brand) {
          brand.animate(
            [
              { opacity: 0, transform: "translateX(-40px)" },
              { opacity: 1, transform: "translateX(0)" }
            ],
            {
              duration: 900 * speedMultiplier,
              easing: EASE_OUT,
              fill: "forwards"
            }
          );
        }

        // 2. COLUMNS
        const COLUMNS_START = 400 * speedMultiplier;
        const COLUMN_STAGGER = 250 * speedMultiplier;

        columns.forEach((col, index) => {
          const startAt = COLUMNS_START + index * COLUMN_STAGGER;

          setTimeout(() => {
            col.animate(
              [
                { opacity: 0, transform: "translateY(30px)" },
                { opacity: 1, transform: "translateY(0)" }
              ],
              {
                duration: 700 * speedMultiplier,
                easing: EASE_OUT,
                fill: "forwards"
              }
            );
          }, startAt);
        });

        // 3. COPYRIGHT
        const copyrightStart =
          COLUMNS_START + columns.length * COLUMN_STAGGER + 300 * speedMultiplier;

        if (copyright) {
          setTimeout(() => {
            copyright.animate(
              [
                { opacity: 0, transform: "translateY(14px) scale(0.98)" },
                { opacity: 1, transform: "translateY(0) scale(1.01)", offset: 0.7 },
                { opacity: 1, transform: "translateY(0) scale(1)" }
              ],
              {
                duration: 600 * speedMultiplier,
                easing: EASE_BOUNCE,
                fill: "forwards"
              }
            );
          }, copyrightStart);
        }

        footerObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.1
    }
  );

  footerObserver.observe(footerSection);
}

// ============================================================
// SUBSCRIBE SECTION — ENTRANCE (scroll-speed adaptive)
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
            {
              duration: 900 * speedMultiplier,
              easing: EASE_BOUNCE,
              fill: "forwards"
            }
          );
        }

        subscribeObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.2
    }
  );

  subscribeObserver.observe(subscribeSection);
}