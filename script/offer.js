// ============================================================
// MOBILE MENU
// ============================================================
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
  if (mobileMenu) mobileMenu.classList.add("open");
  if (menuOverlay) menuOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  if (mobileMenu) mobileMenu.classList.remove("open");
  if (menuOverlay) menuOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

if (menuToggle) {
  menuToggle.addEventListener("click", openMenu);
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

if (menuOverlay) {
  menuOverlay.addEventListener("click", closeMenu);
}

if (mobileMenu) {
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

if (menuToggle) {
  menuToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeMenu();
    }
  });
}


// ============================================================
// SCROLL REVEAL (BASE ELEMENTS)
// ============================================================
const scrollRevealElements =
  document.querySelectorAll(".scroll-reveal");

if (scrollRevealElements.length > 0) {

  const revealObserver = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);
        }

      });

    },
    {
      threshold: 0.15
    }
  );


  scrollRevealElements.forEach((element) => {
    revealObserver.observe(element);
  });

}


// ============================================================
// SUBSCRIBE ANIMATION
// ============================================================
const subscribeElement =
  document.querySelector(".subscribe > div");

if (subscribeElement) {

  const subscribeObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            subscribeObserver.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -30px 0px"
      }
    );

  subscribeObserver.observe(subscribeElement);
}


// ============================================================
// FOOTER ANIMATIONS
// ============================================================
document
  .querySelectorAll(".footer > div")
  .forEach((el, index) => {

    const footerObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              setTimeout(() => {
                entry.target.classList.add("visible");
              }, index * 100);

              footerObserver.unobserve(entry.target);
            }

          });

        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px"
        }
      );

    footerObserver.observe(el);
  });


// ============================================================
// COPYRIGHT ANIMATION
// ============================================================
const copyrightElement =
  document.querySelector(".copyright");

if (copyrightElement) {

  const copyrightObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            copyrightObserver.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

  copyrightObserver.observe(copyrightElement);
}


// ============================================================
// PANEL SWITCHING
// ============================================================
//
// IMPORTANT:
//
// WORKSPACE:
// - Can have an active state.
//
// OTHER SERVICES:
// - NEVER receive .active.
// - They only use CSS :hover.
// - Clicking them still switches the panel.
//
// ============================================================

const optionBtns =
  document.querySelectorAll(".option-btn");


const panels = {

  workspace:
    document.querySelector(
      '.offer-panel[data-panel="workspace"]'
    ),

  privateRoom:
    document.querySelector(
      '.offer-panel[data-panel="privateRoom"]'
    ),

  conferenceRoom:
    document.querySelector(
      '.offer-panel[data-panel="conferenceRoom"]'
    ),

  podcast:
    document.querySelector(
      '.offer-panel[data-panel="podcast"]'
    ),

  courses:
    document.querySelector(
      '.offer-panel[data-panel="courses"]'
    )

};


const heroSection =
  document.querySelector(".heronav");


const bookingForm =
  document.getElementById("bookingForm");


// ============================================================
// OPTION BUTTON VISUAL STATE
// ============================================================
//
// Only Workspace can receive .active.
//
// Every other service button has .active removed.
//
// This is intentionally separate from the workspace
// plan-card selection system.
// ============================================================

function updateOptionButtonState(panelId) {

  optionBtns.forEach((btn) => {

    const buttonPanel =
      btn.dataset.panel;

    // Remove active from EVERYTHING first
    btn.classList.remove("active");


    // Only Workspace is allowed to be active
    if (
      buttonPanel === "workspace" &&
      panelId === "workspace"
    ) {

      btn.classList.add("active");

    }

  });

}


// ============================================================
// REVEAL PANEL CONTENTS
// ============================================================
function revealPanelContents(panelId, panel) {

  if (!panel) return;


  // Workspace has its own observers
  if (panelId === "workspace") {

    initWorkspaceObservers();

    return;
  }


  panel.classList.remove("visible");


  const panelObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            panel.classList.add("visible");

            panelObserver.unobserve(entry.target);


            // ==================================================
            // COURSE CARD ANIMATIONS
            // ==================================================
            if (panelId === "courses") {

              const cards =
                panel.querySelectorAll(".courseCard");


              cards.forEach((card, index) => {

                card.classList.remove("visible");


                setTimeout(() => {

                  card.classList.add("visible");

                }, index * 150 + 200);

              });

            }

          }

        });

      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );


  panelObserver.observe(panel);
}


// ============================================================
// SWITCH PANEL
// ============================================================
function switchToPanel(panelId) {

  const targetPanel = panels[panelId];

  if (!targetPanel) return;

  // FIX: Save the active panel to localStorage so it survives a page refresh
  localStorage.setItem("targetPanel", panelId);

  // ==========================================================
  // IMPORTANT
  // ==========================================================
  // Only Workspace is allowed to have an active button.
  // Private Office, Conference Room, Podcast / Showroom, Courses
  // will NEVER stay active.
  // ==========================================================

  updateOptionButtonState(panelId);

  // ==========================================================
  // HIDE ALL PANELS
  // ==========================================================
  Object.values(panels).forEach((panel) => {
    if (!panel) return;

    panel.classList.remove("active", "visible");

    panel.querySelectorAll(".scroll-reveal").forEach((el) => {
      el.classList.remove("visible");
    });

    panel.querySelectorAll(".courseCard").forEach((el) => {
      el.classList.remove("visible");
    });
  });

  // ==========================================================
  // SHOW TARGET PANEL
  // ==========================================================
  targetPanel.classList.add("active");

  // ==========================================================
  // HERO STATE
  // ==========================================================
  if (heroSection) {
    heroSection.classList.remove("panel-workspace", "panel-other");
    heroSection.classList.add(
      panelId === "workspace" ? "panel-workspace" : "panel-other"
    );
  }

  // ==========================================================
  // BOOKING FORM
  // ==========================================================
  if (bookingForm && panelId !== "workspace") {
    bookingForm.classList.remove("active");
  }

  // ==========================================================
  // START PANEL ANIMATIONS
  // ==========================================================
  setTimeout(() => {
    revealPanelContents(panelId, targetPanel);
  }, 100);
}


// ============================================================
// WORKSPACE OBSERVERS
// ============================================================
function initWorkspaceObservers() {

  const workspacePanel =
    panels.workspace;


  if (!workspacePanel) return;


  // ==========================================================
  // PLAN CARD ANIMATIONS
  // ==========================================================
  const planCards =
    workspacePanel.querySelectorAll(
      ".planCard.scroll-reveal"
    );


  planCards.forEach((card, index) => {

    card.classList.remove("visible");


    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              const delay =
                index * 150;


              setTimeout(() => {

                entry.target.classList.add("visible");

              }, delay);


              observer.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -30px 0px"
        }
      );


    observer.observe(card);

  });


  // ==========================================================
  // WORKSPACE TITLE
  // ==========================================================
  const title =
    workspacePanel.querySelector(
      ".options2-title"
    );


  if (title) {

    title.classList.remove("visible");


    const titleObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add("visible");

              titleObserver.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.1
        }
      );


    titleObserver.observe(title);

  }


  // ==========================================================
  // WORKSPACE DESCRIPTION
  // ==========================================================
  const desc =
    workspacePanel.querySelector(
      ".options2-desc"
    );


  if (desc) {

    desc.classList.remove("visible");


    const descObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add("visible");

              descObserver.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.1
        }
      );


    descObserver.observe(desc);

  }

}


// ============================================================
// PANEL CLICK HANDLER
// ============================================================
optionBtns.forEach((btn) => {

  btn.addEventListener("click", function () {

    const panelId =
      this.dataset.panel;


    if (!panels[panelId]) return;


    switchToPanel(panelId);


    history.pushState(
      null,
      "",
      `#${panelId}`
    );

  });

});


// ============================================================
// INITIAL PANEL ON LOAD
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const hashTarget = window.location.hash.replace("#", "");
  let storedTarget = "workspace"; // Safe default fallback

  // Safely check localStorage (prevents silent crashes in Incognito/Private mode)
  try {
    const saved = localStorage.getItem("targetPanel");
    if (saved && panels[saved]) {
      storedTarget = saved;
    }
  } catch (e) {
    console.warn("localStorage is blocked or unavailable. Defaulting to workspace.");
  }

  let initialPanel = "workspace";

  // Priority 1: URL Hash (e.g., if they clicked a link like offer.html#courses)
  if (hashTarget && panels[hashTarget]) {
    initialPanel = hashTarget;
    try { localStorage.setItem("targetPanel", initialPanel); } catch (e) {}
  } 
  // Priority 2: LocalStorage (the last tab they were on before refreshing)
  else {
    initialPanel = storedTarget;
  }

  // Switch to the correct panel WITHOUT forcing a scroll
  switchToPanel(initialPanel);
});


// ============================================================
// BROWSER BACK / FORWARD
// ============================================================
window.addEventListener(
  "hashchange",
  function () {

    const hash =
      window.location.hash.replace(
        "#",
        ""
      );


    if (
      hash &&
      panels[hash]
    ) {

      switchToPanel(hash);

    }

  }
);


// ============================================================
// COUNTER ANIMATION
// ============================================================
const counterElements =
  document.querySelectorAll(
    ".counter-number"
  );


if (counterElements.length > 0) {

  const counterObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;


          const counter =
            entry.target;


          const target =
            +counter.getAttribute(
              "data-target"
            );


          const duration =
            1500;


          const totalFrames =
            Math.round(
              duration / (1000 / 60)
            );


          const increment =
            target / totalFrames;


          let current = 0;


          const animateCounter =
            () => {

              current += increment;


              if (current < target) {

                counter.innerText =
                  Math.ceil(
                    current
                  ).toLocaleString();


                requestAnimationFrame(
                  animateCounter
                );

              } else {

                counter.innerText =
                  target.toLocaleString();

              }

            };


          animateCounter();


          counterObserver.unobserve(
            counter
          );

        });

      },
      {
        threshold: 0.5
      }
    );


  counterElements.forEach((el) => {

    counterObserver.observe(el);

  });

}


// ============================================================
// PLAN CARD SELECTION — WORKSPACE ONLY
// ============================================================
//
// This system ONLY applies to Workspace plan cards.
//
// Weekly is selected by default.
//
// Clicking another plan changes the selected plan.
//
// This has NOTHING to do with the service filter buttons.
//
// ============================================================
document.addEventListener(
  "DOMContentLoaded",
  function () {

    // FIX 1: ONLY target plan cards and select buttons inside the Workspace panel
    const planCards =
      document.querySelectorAll(
        '.offer-panel[data-panel="workspace"] .planCard'
      );


    const selectBtns =
      document.querySelectorAll(
        '.offer-panel[data-panel="workspace"] .selectBtn'
      );


    const planInput =
      document.getElementById(
        "planInput"
      );


    const changePlanLink =
      document.getElementById(
        "changePlan"
      );


    let selectedPlan = null;


    // ========================================================
    // ACTIVE PLAN CARD CSS
    // ========================================================
    if (
      !document.getElementById(
        "active-plan-card-style"
      )
    ) {

      const style =
        document.createElement(
          "style"
        );


      style.id =
        "active-plan-card-style";


      style.textContent = `

        /* ==================================================
           ACTIVE WORKSPACE PLAN CARD
           ================================================== */

        .planCard.active {
          background-color: var(--bg-black) !important;
          border-color: var(--bg-black) !important;
        }


        .planCard.active:hover {
          border-color: var(--primary-color) !important;
        }


        /* ==================================================
           TITLE
           ================================================== */

        .planCard.active .planName {
          color: var(--natural-color) !important;
        }


        /* ==================================================
           DESCRIPTION
           ================================================== */

        .planCard.active .planDesc {
          color: rgba(255, 255, 255, 0.65) !important;
        }


        /* ==================================================
           PRICE
           ================================================== */

        .planCard.active .planPrice p:first-child,
        .planCard.active .planPrice .currency-symbol,
        .planCard.active .planPrice .counter-number {
          color: var(--natural-color) !important;
        }


        .planCard.active .planPrice p:last-child {
          color: rgba(255, 255, 255, 0.55) !important;
        }


        /* ==================================================
           SELECT BUTTON
           ================================================== */

        .planCard.active .selectBtn {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          color: var(--natural-color) !important;
        }


        /* ==================================================
           FEATURES BOX
           ================================================== */

        .planCard.active .planFeatures {
          background-color: var(--natural-color) !important;
        }


        /* ==================================================
           FEATURE TEXT
           ================================================== */

        .planCard.active .planFeatures span,
        .planCard.active .planFeatures p,
        .planCard.active .planFeatures li {
          color: #444 !important;
        }


        /* ==================================================
           CHECK ICON
           ================================================== */

        .planCard.active .check-icon,
        .planCard.active .checkIcon {
          background-color: var(--primary-color) !important;
          color: var(--natural-color) !important;
        }

      `;


      document.head.appendChild(
        style
      );

    }


    // ========================================================
    // SET ACTIVE PLAN
    // ========================================================
    function setActivePlan(card) {
      if (!card) return;

      // FIX 2: SAFETY CHECK - Only allow workspace plan cards to receive the active class
      if (!card.closest('.offer-panel[data-panel="workspace"]')) {
        return; 
      }

      planCards.forEach((planCard) => {
        planCard.classList.remove("active");
        planCard.classList.remove("popular");
      });

      card.classList.add("active");
    }


    // ========================================================
    // FIND WEEKLY PLAN
    // ========================================================
    let weeklyCard = null;


    planCards.forEach((card) => {

      const plan =
        (
          card.dataset.plan ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        plan === "weekly"
      ) {

        weeklyCard =
          card;

      }

    });


    // ========================================================
    // WEEKLY ACTIVE BY DEFAULT
    // ========================================================
    if (weeklyCard) {

      setActivePlan(
        weeklyCard
      );


      selectedPlan =
        weeklyCard.dataset.plan;

    }

    else if (
      planCards.length > 0
    ) {

      setActivePlan(
        planCards[0]
      );


      selectedPlan =
        planCards[0].dataset.plan;

    }


    // ========================================================
    // SELECT PLAN BUTTON
    // ========================================================
    selectBtns.forEach((btn) => {

      btn.addEventListener(
        "click",
        function (e) {

          e.preventDefault();

          e.stopPropagation();


          const planCard =
            this.closest(
              ".planCard"
            );


          if (!planCard) return;


          setActivePlan(
            planCard
          );


          selectedPlan =
            planCard.dataset.plan;


          // ==================================================
          // BOOKING FORM
          // ==================================================
          if (bookingForm) {

            bookingForm.classList.add(
              "active"
            );


            if (planInput) {

              planInput.value =
                selectedPlan || "";

            }

          }

        }
      );

    });


    // ========================================================
    // CLICK ANYWHERE ON PLAN CARD
    // ========================================================
    planCards.forEach((card) => {

      card.addEventListener(
        "click",
        function (e) {

          // Don't duplicate Select Plan click
          if (
            e.target.closest(
              ".selectBtn"
            )
          ) {

            return;

          }


          setActivePlan(
            card
          );


          selectedPlan =
            card.dataset.plan;


          if (planInput) {

            planInput.value =
              selectedPlan || "";

          }

        }
      );

    });


    // ========================================================
    // CHANGE PLAN
    // ========================================================
    if (changePlanLink) {
      changePlanLink.addEventListener("click", function (e) {
        e.preventDefault();

        if (bookingForm) {
          bookingForm.classList.remove("active");
        }

        selectedPlan = null;

        if (planInput) {
          planInput.value = "";
        }

        // FIX 3: Clear active state from workspace plan cards when changing plan
        planCards.forEach((planCard) => {
          planCard.classList.remove("active");
        });
      });
    }

  }
);


// ============================================================
// BOOKING FORM SUBMISSION
// ============================================================
if (bookingForm) {

  bookingForm.addEventListener(
    "submit",
    function (e) {

      e.preventDefault();


      const firstName =
        document
          .getElementById(
            "firstName"
          )
          ?.value.trim();


      const lastName =
        document
          .getElementById(
            "lastName"
          )
          ?.value.trim();


      const email =
        document
          .getElementById(
            "email"
          )
          ?.value.trim();


      const phone =
        document
          .getElementById(
            "phone"
          )
          ?.value.trim();


      const startDate =
        document
          .getElementById(
            "startDate"
          )
          ?.value;


      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !startDate
      ) {

        alert(
          "Please fill in all required fields."
        );

        return;

      }


      alert(
        `Thank you for booking the ${selectedPlan} plan! We will contact you shortly.`
      );


      this.reset();


      this.classList.remove(
        "active"
      );


      selectedPlan = null;


      if (planInput) {

        planInput.value = "";

      }

    }
  );

}


// ============================================================
// WHATSAPP — PRIVATE ENQUIRY
// ============================================================
document
  .querySelectorAll(
    ".privateEnquiry-btn"
  )
  .forEach((btn) => {

    btn.addEventListener(
      "click",
      function () {

        const message =
          encodeURIComponent(
            "Hello, I'm interested in booking a space at PIHUB. Can you provide more information?"
          );


        window.open(
          `https://wa.me/2348088349833?text=${message}`,
          "_blank"
        );

      }
    );

  });


// ============================================================
// WHATSAPP — COURSE ENQUIRY
// ============================================================
document
  .querySelectorAll(
    ".courseCard:not(.unavailable) .course-enquiry-btn"
  )
  .forEach((btn) => {

    btn.addEventListener(
      "click",
      function (e) {

        e.stopPropagation();


        const courseCard =
          this.closest(
            ".courseCard"
          );


        const courseName =
          courseCard
            ?.querySelector(
              "div:nth-child(2)"
            )
            ?.textContent.trim()
            ||
          "a course";


        const message =
          encodeURIComponent(
            `Hello, I'm interested in the ${courseName} course at PIHUB. Can you provide more information?`
          );


        window.open(
          `https://wa.me/2348088349833?text=${message}`,
          "_blank"
        );

      }
    );

  });


// ============================================================
// FOOTER — SERVICE HASH LINKS
// ============================================================
document
  .querySelectorAll(
    '.footer a[href^="#"]'
  )
  .forEach((link) => {

    link.addEventListener(
      "click",
      function (e) {

        e.preventDefault();


        const panelId =
          this.getAttribute(
            "href"
          ).replace(
            "#",
            ""
          );


        if (!panels[panelId]) {
          return;
        }


        switchToPanel(
          panelId
        );


        history.pushState(
          null,
          "",
          `#${panelId}`
        );


        const offerSection =
          document.querySelector(
            ".offer"
          );


        if (offerSection) {

          const top =
            offerSection
              .getBoundingClientRect()
              .top

            +

            window.pageYOffset

            -

            100;


          window.scrollTo({

            top: top,

            behavior: "smooth"

          });

        }

      }
    );

  });


// ============================================================
// SERVICE FILTER HOVER BEHAVIOR
// ============================================================
//
// DO NOT add/remove active here.
//
// CSS handles hover.
//
// Workspace is the ONLY button that JavaScript can mark
// as active.
//
// Other buttons simply hover black and return to normal.
//
// ============================================================

optionBtns.forEach((btn) => {

  // Make absolutely sure non-workspace buttons
  // never start with an active class.
  if (
    btn.dataset.panel !== "workspace"
  ) {

    btn.classList.remove(
      "active"
    );

  }

});