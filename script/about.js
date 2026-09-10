// ============================================================
// PIHUB ABOUT PAGE — FULL CREATIVE SCROLL ANIMATION ENGINE
//
// Everything below the hero is hidden initially.
// Each section reveals its elements sequentially.
//
// IMPORTANT:
// - No filter/blur system
// - No display:none
// - No visibility:hidden
// - No transform:none
// - No automatic scrolling
// - Carousel scrollIntoView only runs from carousel controls
// ============================================================


// ============================================================
// GLOBAL SCROLL SPEED TRACKER
// ============================================================

let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let currentScrollSpeed = 0;

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
  return currentScrollSpeed > FAST_SCROLL_THRESHOLD ? 0.35 : 1;
}


function isInstantScroll() {
  return currentScrollSpeed > INSTANT_THRESHOLD;
}


// ============================================================
// EASINGS
// ============================================================

const EASE_SMOOTH =
  "cubic-bezier(0.16, 1, 0.3, 1)";

const EASE_BOUNCE =
  "cubic-bezier(0.34, 1.56, 0.64, 1)";

const EASE_SOFT =
  "cubic-bezier(0.22, 1, 0.36, 1)";

const EASE_ELASTIC =
  "cubic-bezier(0.68, -0.6, 0.32, 1.6)";

const EASE_SHARP =
  "cubic-bezier(0.77, 0, 0.175, 1)";


// ============================================================
// ANIMATION HELPERS
// ============================================================

function hideElement(
  el,
  transform = "translateY(40px)"
) {
  if (!el) return;

  el.style.opacity = "0";
  el.style.transform = transform;
  el.style.transition = "none";
}


function revealElement(
  el,
  {
    duration = 900,
    delay = 0,
    easing = EASE_SMOOTH,
    transform =
      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
  } = {}
) {
  if (!el) return;

  const speed = getScrollSpeedMultiplier();

  const actualDuration =
    Math.max(1, duration * speed);

  const actualDelay =
    Math.max(0, delay * speed);


  setTimeout(() => {

    el.style.transition =
      `opacity ${actualDuration}ms ${easing}, ` +
      `transform ${actualDuration}ms ${easing}`;


    requestAnimationFrame(() => {

      el.style.opacity = "1";

      el.style.transform = transform;

    });

  }, actualDelay);
}


function snapElement(el) {
  if (!el) return;

  el.style.transition = "none";
  el.style.opacity = "1";

  el.style.transform =
    "translateX(0px) translateY(0px) scale(1) rotate(0deg)";
}


function snapElements(elements) {
  if (!elements) return;

  elements.forEach((el) => {
    snapElement(el);
  });
}


// ============================================================
// MOBILE MENU
// ============================================================

const menuToggle =
  document.getElementById("menuToggle");

const menuClose =
  document.getElementById("menuClose");

const mobileMenu =
  document.getElementById("mobileMenu");

const menuOverlay =
  document.getElementById("menuOverlay");


function openMenu() {

  if (!mobileMenu || !menuOverlay) return;

  mobileMenu.classList.add("open");
  menuOverlay.classList.add("open");

  document.body.style.overflow = "hidden";
}


function closeMenu() {

  if (!mobileMenu || !menuOverlay) return;

  mobileMenu.classList.remove("open");
  menuOverlay.classList.remove("open");

  document.body.style.overflow = "";
}


if (menuToggle) {

  menuToggle.addEventListener(
    "click",
    openMenu
  );

}


if (menuClose) {

  menuClose.addEventListener(
    "click",
    closeMenu
  );

}


if (menuOverlay) {

  menuOverlay.addEventListener(
    "click",
    closeMenu
  );

}


if (mobileMenu) {

  mobileMenu.querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });

}


// ============================================================
// ABOUT SECTION
// ============================================================

const aboutInfo =
  document.querySelector(".aboutinfo");


const aboutBlocks =
  aboutInfo
    ? Array.from(
        aboutInfo.children
      ).filter((el) =>
        el.classList.contains("scroll-reveal")
      )
    : [];


// ------------------------------------------------------------
// ABOUT — MAIN BLOCKS
// ------------------------------------------------------------

aboutBlocks.forEach(
  (block, index) => {

    const animations = [

      // First content block
      "translateY(65px) scale(0.9)",

      // First image
      "translateX(-70px) rotate(-3deg) scale(0.92)",

      // Second image
      "translateX(70px) rotate(3deg) scale(0.92)",

      // What we do block
      "translateY(70px) scale(0.9)"

    ];


    hideElement(
      block,
      animations[
        index % animations.length
      ]
    );

  }
);


// ------------------------------------------------------------
// ABOUT — INNER ELEMENTS
//
// These are animated after their parent section appears.
// ------------------------------------------------------------

const aboutIntro =
  aboutBlocks[0] || null;


const aboutDetails =
  aboutIntro
    ? aboutIntro.querySelector(".aboutinfo1")
    : null;


if (aboutIntro) {

  const introSpans =
    aboutIntro.querySelectorAll(":scope > span");


  introSpans.forEach(
    (span, index) => {

      hideElement(
        span,
        index === 0
          ? "translateX(-45px) scale(0.92)"
          : "translateX(45px) scale(0.92)"
      );

    }
  );


  if (aboutDetails) {

    hideElement(
      aboutDetails,
      "translateY(55px) scale(0.94)"
    );


    const detailParagraphs =
      aboutDetails.querySelectorAll(
        "p"
      );


    detailParagraphs.forEach(
      (paragraph, index) => {

        hideElement(
          paragraph,
          index === 0
            ? "translateX(-35px)"
            : "translateX(35px)"
        );

      }
    );

  }

}


// ============================================================
// WHAT WE DO
// ============================================================

const whatWeDo =
  aboutBlocks[3] || null;


if (whatWeDo) {

  const whatTop =
    whatWeDo.querySelectorAll(
      ":scope > span"
    );


  whatTop.forEach(
    (span, index) => {

      hideElement(
        span,
        index === 0
          ? "translateX(-45px) scale(0.92)"
          : "translateX(45px) scale(0.92)"
      );

    }
  );


  // Feature list

  const featureGroups =
    whatWeDo.querySelectorAll(
      ":scope > span:last-child p"
    );


  featureGroups.forEach(
    (feature, index) => {

      hideElement(
        feature,
        index % 2 === 0
          ? "translateX(-55px)"
          : "translateX(55px)"
      );

    }
  );

}


// ============================================================
// ABOUT OBSERVER
// ============================================================

if (
  aboutInfo &&
  aboutBlocks.length
) {

  let aboutPlayed = false;


  const aboutObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting ||
              aboutPlayed
            ) return;


            aboutPlayed = true;


            // ------------------------------------------------
            // INSTANT REVEAL
            // ------------------------------------------------

            if (isInstantScroll()) {

              snapElements(
                aboutBlocks
              );


              if (aboutIntro) {

                snapElements(
                  aboutIntro.querySelectorAll(
                    ":scope > span"
                  )
                );

              }


              if (aboutDetails) {

                snapElement(
                  aboutDetails
                );

                snapElements(
                  aboutDetails.querySelectorAll(
                    "p"
                  )
                );

              }


              if (whatWeDo) {

                snapElements(
                  whatWeDo.querySelectorAll(
                    ":scope > span"
                  )
                );

                snapElements(
                  whatWeDo.querySelectorAll(
                    ":scope > span:last-child p"
                  )
                );

              }


              aboutObserver.unobserve(
                entry.target
              );

              return;

            }


            // ------------------------------------------------
            // FIRST CONTENT BLOCK
            // ------------------------------------------------

            revealElement(
              aboutBlocks[0],
              {
                duration: 950,
                delay: 0,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // FIRST ABOUT IMAGE
            //
            // Comes from the left with a little bounce.
            // ------------------------------------------------

            revealElement(
              aboutBlocks[1],
              {
                duration: 950,
                delay: 500,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // SECOND ABOUT IMAGE
            //
            // Comes from the right with an elastic landing.
            // ------------------------------------------------

            revealElement(
              aboutBlocks[2],
              {
                duration: 950,
                delay: 850,
                easing: EASE_ELASTIC,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // INTRO HEADINGS
            // ------------------------------------------------

            if (aboutIntro) {

              const introSpans =
                aboutIntro.querySelectorAll(
                  ":scope > span"
                );


              introSpans.forEach(
                (span, index) => {

                  revealElement(
                    span,
                    {
                      duration: 750,
                      delay:
                        250 + index * 300,
                      easing:
                        index === 0
                          ? EASE_SHARP
                          : EASE_BOUNCE,
                      transform:
                        "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                    }
                  );

                }
              );


              // ------------------------------------------------
              // ABOUT INFORMATION BOX
              // ------------------------------------------------

              if (aboutDetails) {

                revealElement(
                  aboutDetails,
                  {
                    duration: 900,
                    delay: 850,
                    easing: EASE_ELASTIC,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                const paragraphs =
                  aboutDetails.querySelectorAll(
                    "p"
                  );


                paragraphs.forEach(
                  (paragraph, index) => {

                    revealElement(
                      paragraph,
                      {
                        duration: 750,
                        delay:
                          1150 + index * 300,
                        easing:
                          index % 2 === 0
                            ? EASE_SMOOTH
                            : EASE_SOFT,
                        transform:
                          "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                      }
                    );

                  }
                );

              }

            }


            // ------------------------------------------------
            // WHAT WE DO
            // ------------------------------------------------

            if (whatWeDo) {

              revealElement(
                whatWeDo,
                {
                  duration: 950,
                  delay: 1500,
                  easing: EASE_ELASTIC,
                  transform:
                    "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                }
              );


              const headings =
                whatWeDo.querySelectorAll(
                  ":scope > span"
                );


              headings.forEach(
                (span, index) => {

                  revealElement(
                    span,
                    {
                      duration: 750,
                      delay:
                        1800 + index * 300,
                      easing:
                        index === 0
                          ? EASE_BOUNCE
                          : EASE_SMOOTH,
                      transform:
                        "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                    }
                  );

                }
              );


              const features =
                whatWeDo.querySelectorAll(
                  ":scope > span:last-child p"
                );


              features.forEach(
                (feature, index) => {

                  revealElement(
                    feature,
                    {
                      duration: 700,
                      delay:
                        2400 + index * 300,
                      easing:
                        index % 2 === 0
                          ? EASE_SHARP
                          : EASE_BOUNCE,
                      transform:
                        "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                    }
                  );

                }
              );

            }


            aboutObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.1
      }
    );


  aboutObserver.observe(
    aboutInfo
  );

}


// ============================================================
// MEET THE TEAM
// ============================================================

const meetSection =
  document.querySelector(".meet");


const meetHeading =
  meetSection
    ? meetSection.querySelector(
        ":scope > div.scroll-reveal"
      )
    : null;


const meetSubtitle =
  meetSection
    ? meetSection.querySelector(
        ".meetSubtitle"
      )
    : null;


const meetCards =
  meetSection
    ? Array.from(
        meetSection.querySelectorAll(
          ".meet2"
        )
      )
    : [];


const meetCarouselWrap =
  meetSection
    ? meetSection.querySelector(
        ".meetCarouselWrap"
      )
    : null;


const meetLeftArrow =
  meetSection
    ? meetSection.querySelector(
        ".meetArrowLeft"
      )
    : null;


const meetRightArrow =
  meetSection
    ? meetSection.querySelector(
        ".meetArrowRight"
      )
    : null;


const meetDots =
  meetSection
    ? meetSection.querySelector(
        ".meetDots"
      )
    : null;


// ------------------------------------------------------------
// MEET HEADING
// ------------------------------------------------------------

hideElement(
  meetHeading,
  "translateY(55px) scale(0.78)"
);


hideElement(
  meetSubtitle,
  "translateX(-50px) translateY(25px)"
);


// ------------------------------------------------------------
// MEET ARROWS
// ------------------------------------------------------------

hideElement(
  meetLeftArrow,
  "translateX(-35px) scale(0.7)"
);


hideElement(
  meetRightArrow,
  "translateX(35px) scale(0.7)"
);


// ------------------------------------------------------------
// MEET CARDS
// ------------------------------------------------------------

meetCards.forEach(
  (card, index) => {

    const cardAnimations = [

      "translateX(-85px) rotate(-5deg) scale(0.88)",

      "translateX(85px) rotate(5deg) scale(0.88)",

      "translateY(90px) scale(0.72) rotate(-4deg)",

      "translateX(60px) translateY(70px) rotate(5deg) scale(0.84)",

      "translateX(-60px) translateY(70px) rotate(-5deg) scale(0.84)"

    ];


    hideElement(
      card,
      cardAnimations[
        index %
        cardAnimations.length
      ]
    );


    // Image

    const image =
      card.querySelector(
        ".meetImgWrap"
      );


    // Name

    const name =
      card.querySelector(
        ".meetName"
      );


    // Role

    const role =
      card.querySelector(
        ".meetRole"
      );


    // Socials

    const socials =
      card.querySelector(
        ".meetSocials"
      );


    hideElement(
      image,
      "translateY(35px) scale(0.78)"
    );


    hideElement(
      name,
      "translateY(25px) scale(0.9)"
    );


    hideElement(
      role,
      "translateY(20px)"
    );


    hideElement(
      socials,
      "translateY(25px) scale(0.8)"
    );

  }
);


// ------------------------------------------------------------
// MEET DOTS
// ------------------------------------------------------------

hideElement(
  meetDots,
  "translateY(25px) scale(0.8)"
);


// ============================================================
// MEET OBSERVER
// ============================================================

if (meetSection) {

  let meetPlayed = false;


  const meetObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting ||
              meetPlayed
            ) return;


            meetPlayed = true;


            // ------------------------------------------------
            // INSTANT
            // ------------------------------------------------

            if (isInstantScroll()) {

              snapElement(
                meetHeading
              );

              snapElement(
                meetSubtitle
              );

              snapElement(
                meetLeftArrow
              );

              snapElement(
                meetRightArrow
              );

              snapElements(
                meetCards
              );

              snapElement(
                meetDots
              );


              meetCards.forEach(
                (card) => {

                  snapElement(
                    card.querySelector(
                      ".meetImgWrap"
                    )
                  );

                  snapElement(
                    card.querySelector(
                      ".meetName"
                    )
                  );

                  snapElement(
                    card.querySelector(
                      ".meetRole"
                    )
                  );

                  snapElement(
                    card.querySelector(
                      ".meetSocials"
                    )
                  );

                }
              );


              meetObserver.unobserve(
                entry.target
              );

              return;

            }


            // ------------------------------------------------
            // HEADING
            // ------------------------------------------------

            revealElement(
              meetHeading,
              {
                duration: 950,
                delay: 0,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // SUBTITLE
            // ------------------------------------------------

            revealElement(
              meetSubtitle,
              {
                duration: 800,
                delay: 350,
                easing: EASE_SMOOTH,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // ARROWS
            // ------------------------------------------------

            revealElement(
              meetLeftArrow,
              {
                duration: 700,
                delay: 650,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            revealElement(
              meetRightArrow,
              {
                duration: 700,
                delay: 750,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // CARDS
            // ------------------------------------------------

            meetCards.forEach(
              (card, index) => {

                const baseDelay =
                  900 + index * 500;


                const easings = [
                  EASE_SMOOTH,
                  EASE_BOUNCE,
                  EASE_ELASTIC,
                  EASE_SHARP
                ];


                // Card itself

                revealElement(
                  card,
                  {
                    duration: 950,
                    delay: baseDelay,
                    easing:
                      easings[
                        index %
                        easings.length
                      ],
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Image

                revealElement(
                  card.querySelector(
                    ".meetImgWrap"
                  ),
                  {
                    duration: 800,
                    delay:
                      baseDelay + 180,
                    easing: EASE_BOUNCE,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Name

                revealElement(
                  card.querySelector(
                    ".meetName"
                  ),
                  {
                    duration: 650,
                    delay:
                      baseDelay + 400,
                    easing: EASE_SMOOTH,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Role

                revealElement(
                  card.querySelector(
                    ".meetRole"
                  ),
                  {
                    duration: 600,
                    delay:
                      baseDelay + 520,
                    easing: EASE_SOFT,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Socials

                revealElement(
                  card.querySelector(
                    ".meetSocials"
                  ),
                  {
                    duration: 650,
                    delay:
                      baseDelay + 650,
                    easing: EASE_BOUNCE,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );

              }
            );


            // ------------------------------------------------
            // DOTS
            // ------------------------------------------------

            revealElement(
              meetDots,
              {
                duration: 700,
                delay:
                  1100 +
                  meetCards.length * 500,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            meetObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  meetObserver.observe(
    meetSection
  );

}


// ============================================================
// SUBSCRIBE
// ============================================================

const subscribeSection =
  document.querySelector(".subscribe");


const subscribeBox =
  subscribeSection
    ? subscribeSection.querySelector(
        ".subscribeBox"
      )
    : null;


const subscribeHeading =
  subscribeSection
    ? subscribeSection.querySelector(
        ".subscribeHeading"
      )
    : null;


const subscribeForm =
  subscribeSection
    ? subscribeSection.querySelector(
        ".subscribeForm"
      )
    : null;


const subscribeInput =
  subscribeForm
    ? subscribeForm.querySelector(
        "input"
      )
    : null;


const subscribeButton =
  subscribeForm
    ? subscribeForm.querySelector(
        "button"
      )
    : null;


// ------------------------------------------------------------
// INITIAL STATES
// ------------------------------------------------------------

hideElement(
  subscribeBox,
  "translateY(70px) scale(0.88)"
);


hideElement(
  subscribeHeading,
  "translateX(-55px) translateY(20px) rotate(-3deg)"
);


hideElement(
  subscribeForm,
  "translateY(45px) scale(0.94)"
);


hideElement(
  subscribeInput,
  "translateX(-35px)"
);


hideElement(
  subscribeButton,
  "translateX(35px) scale(0.88)"
);


// ============================================================
// SUBSCRIBE OBSERVER
// ============================================================

if (subscribeSection) {

  let subscribePlayed = false;


  const subscribeObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting ||
              subscribePlayed
            ) return;


            subscribePlayed = true;


            // ------------------------------------------------
            // INSTANT
            // ------------------------------------------------

            if (isInstantScroll()) {

              snapElement(
                subscribeBox
              );

              snapElement(
                subscribeHeading
              );

              snapElement(
                subscribeForm
              );

              snapElement(
                subscribeInput
              );

              snapElement(
                subscribeButton
              );


              subscribeObserver.unobserve(
                entry.target
              );

              return;

            }


            // ------------------------------------------------
            // BOX
            // ------------------------------------------------

            revealElement(
              subscribeBox,
              {
                duration: 1050,
                delay: 0,
                easing: EASE_ELASTIC,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // HEADING
            // ------------------------------------------------

            revealElement(
              subscribeHeading,
              {
                duration: 800,
                delay: 350,
                easing: EASE_SHARP,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // FORM
            // ------------------------------------------------

            revealElement(
              subscribeForm,
              {
                duration: 700,
                delay: 650,
                easing: EASE_SMOOTH,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // INPUT
            // ------------------------------------------------

            revealElement(
              subscribeInput,
              {
                duration: 700,
                delay: 850,
                easing: EASE_SOFT,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // BUTTON
            // ------------------------------------------------

            revealElement(
              subscribeButton,
              {
                duration: 750,
                delay: 1000,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            subscribeObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.15
      }
    );


  subscribeObserver.observe(
    subscribeSection
  );

}


// ============================================================
// FOOTER
// ============================================================

const footerSection =
  document.querySelector(".footer");


const footerBrand =
  footerSection
    ? footerSection.querySelector(
        ".footerBrand"
      )
    : null;


const footerColumns =
  footerSection
    ? Array.from(
        footerSection.querySelectorAll(
          ".footerCol"
        )
      )
    : [];


const copyright =
  footerSection
    ? footerSection.querySelector(
        ".copyright"
      )
    : null;


// ------------------------------------------------------------
// FOOTER BRAND
// ------------------------------------------------------------

hideElement(
  footerBrand,
  "translateX(-70px) rotate(-4deg) scale(0.92)"
);


// ------------------------------------------------------------
// FOOTER APP ICONS
// ------------------------------------------------------------

const footerApps =
  footerBrand
    ? footerBrand.querySelector(
        ".footerApps"
      )
    : null;


hideElement(
  footerApps,
  "translateY(30px) scale(0.85)"
);


// ------------------------------------------------------------
// FOOTER COLUMNS
// ------------------------------------------------------------

footerColumns.forEach(
  (column, index) => {

    const columnAnimations = [

      "translateX(-55px)",

      "translateY(55px) scale(0.9)",

      "translateX(55px)"

    ];


    hideElement(
      column,
      columnAnimations[
        index %
        columnAnimations.length
      ]
    );


    // Heading

    hideElement(
      column.querySelector(
        ".footerHeading"
      ),
      "translateY(20px) scale(0.9)"
    );


    // Links

    column.querySelectorAll(
      "a"
    ).forEach(
      (link, linkIndex) => {

        hideElement(
          link,
          linkIndex % 2 === 0
            ? "translateX(-25px)"
            : "translateX(25px)"
        );

      }
    );


    // Social paragraph

    const socialParagraph =
      column.querySelector(
        "p"
      );


    hideElement(
      socialParagraph,
      "translateY(25px)"
    );


    // Social icons

    const socialIcons =
      column.querySelector(
        ".footerSocialIcons"
      );


    hideElement(
      socialIcons,
      "translateY(25px) scale(0.85)"
    );

  }
);


// ------------------------------------------------------------
// COPYRIGHT
// ------------------------------------------------------------

hideElement(
  copyright,
  "translateY(30px) scale(0.8)"
);


// ============================================================
// FOOTER OBSERVER
// ============================================================

if (footerSection) {

  let footerPlayed = false;


  const footerObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting ||
              footerPlayed
            ) return;


            footerPlayed = true;


            // ------------------------------------------------
            // INSTANT
            // ------------------------------------------------

            if (isInstantScroll()) {

              snapElement(
                footerBrand
              );

              snapElement(
                footerApps
              );

              snapElements(
                footerColumns
              );

              snapElement(
                copyright
              );


              footerColumns.forEach(
                (column) => {

                  snapElements(
                    column.querySelectorAll(
                      ".footerHeading, a, p, .footerSocialIcons"
                    )
                  );

                }
              );


              footerObserver.unobserve(
                entry.target
              );

              return;

            }


            // ------------------------------------------------
            // BRAND
            // ------------------------------------------------

            revealElement(
              footerBrand,
              {
                duration: 900,
                delay: 0,
                easing: EASE_SMOOTH,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // APP ICONS
            // ------------------------------------------------

            revealElement(
              footerApps,
              {
                duration: 700,
                delay: 400,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            // ------------------------------------------------
            // COLUMNS
            // ------------------------------------------------

            footerColumns.forEach(
              (column, index) => {

                const columnDelay =
                  500 + index * 450;


                // Column

                revealElement(
                  column,
                  {
                    duration: 800,
                    delay: columnDelay,
                    easing:
                      index % 2 === 0
                        ? EASE_SMOOTH
                        : EASE_BOUNCE,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Heading

                revealElement(
                  column.querySelector(
                    ".footerHeading"
                  ),
                  {
                    duration: 650,
                    delay:
                      columnDelay + 180,
                    easing: EASE_BOUNCE,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Links

                column.querySelectorAll(
                  "a"
                ).forEach(
                  (link, linkIndex) => {

                    revealElement(
                      link,
                      {
                        duration: 550,
                        delay:
                          columnDelay +
                          350 +
                          linkIndex * 100,
                        easing:
                          linkIndex % 2 === 0
                            ? EASE_SMOOTH
                            : EASE_SOFT,
                        transform:
                          "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                      }
                    );

                  }
                );


                // Social paragraph

                revealElement(
                  column.querySelector(
                    "p"
                  ),
                  {
                    duration: 650,
                    delay:
                      columnDelay + 350,
                    easing: EASE_SOFT,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );


                // Social icons

                revealElement(
                  column.querySelector(
                    ".footerSocialIcons"
                  ),
                  {
                    duration: 700,
                    delay:
                      columnDelay + 650,
                    easing: EASE_BOUNCE,
                    transform:
                      "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
                  }
                );

              }
            );


            // ------------------------------------------------
            // COPYRIGHT
            // ------------------------------------------------

            revealElement(
              copyright,
              {
                duration: 750,
                delay:
                  900 +
                  footerColumns.length * 450,
                easing: EASE_BOUNCE,
                transform:
                  "translateX(0px) translateY(0px) scale(1) rotate(0deg)"
              }
            );


            footerObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.05
      }
    );


  footerObserver.observe(
    footerSection
  );

}


// ============================================================
// MEET THE TEAM CAROUSEL — auto-advancing, with manual controls
// ============================================================

const meetTrack = document.getElementById("meetTrack");
const meetPrev = document.getElementById("meetPrev");
const meetNext = document.getElementById("meetNext");
const meetDotsContainer = document.getElementById("meetDots");

if (meetTrack && meetPrev && meetNext && meetDotsContainer) {

  const allCards = Array.from(meetTrack.querySelectorAll(".meet2"));
  const totalOriginal = allCards.length / 2; // requires cards duplicated once in HTML

  let currentIndex = 0;

  // ----------------------------------------------------------
  // CREATE DOTS (one per ORIGINAL card only)
  // ----------------------------------------------------------

  for (let i = 0; i < totalOriginal; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "meetDot";
    dot.setAttribute("aria-label", `Go to team member ${i + 1}`);

    dot.addEventListener("click", () => {
      currentIndex = i;
      goToCard(currentIndex, true);
      resetAutoplay();
    });

    meetDotsContainer.appendChild(dot);
  }

  const dots = Array.from(meetDotsContainer.children);

  function updateDots(realIndex) {
    dots.forEach((dot, i) => dot.classList.toggle("active", i === realIndex));
  }

  // ----------------------------------------------------------
  // MOVE TO A GIVEN CARD INDEX
  // ----------------------------------------------------------

  function goToCard(index, smooth) {
    const targetCard = allCards[index];
    if (!targetCard) return;

    meetTrack.style.scrollBehavior = smooth ? "smooth" : "auto";
    meetTrack.scrollTo({ left: targetCard.offsetLeft });

    updateDots(index % totalOriginal);
  }

  // ----------------------------------------------------------
  // NEXT — loops seamlessly through the duplicated set
  // ----------------------------------------------------------

  function nextSlide() {
    currentIndex++;
    goToCard(currentIndex, true);

    if (currentIndex >= totalOriginal) {
      // once we've scrolled onto the cloned cards, silently
      // snap back to the real first card with no visible jump
      setTimeout(() => {
        currentIndex = 0;
        goToCard(currentIndex, false);
      }, 500);
    }
  }

  // ----------------------------------------------------------
  // PREVIOUS
  // ----------------------------------------------------------

  function prevSlide() {
    if (currentIndex === 0) {
      // jump invisibly to the cloned card just past the end,
      // then animate backward from there for a seamless wrap
      goToCard(totalOriginal, false);
      currentIndex = totalOriginal - 1;
      setTimeout(() => goToCard(currentIndex, true), 20);
      return;
    }

    currentIndex--;
    goToCard(currentIndex, true);
  }

  meetNext.addEventListener("click", () => {
    nextSlide();
    resetAutoplay();
  });

  meetPrev.addEventListener("click", () => {
    prevSlide();
    resetAutoplay();
  });

  // ----------------------------------------------------------
  // AUTOPLAY
  // ----------------------------------------------------------

  let autoplay = setInterval(nextSlide, 3000);

  function resetAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(nextSlide, 3000);
  }

  meetTrack.addEventListener("mouseenter", () => clearInterval(autoplay));
  meetTrack.addEventListener("mouseleave", resetAutoplay);

  // ----------------------------------------------------------
  // INITIAL STATE
  // ----------------------------------------------------------

  updateDots(0);

}


// ============================================================
// DONE
// ============================================================

console.log(
  "PIHUB About page — full creative element animation system initialized."
);