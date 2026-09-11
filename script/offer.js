// ============================================================
// 🔧 API CONFIGURATION
// ============================================================
const BASE_API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "http://127.0.0.1:8000"; 

// ============================================================
// INJECT DYNAMIC STYLES (Modals & Courses)
// ============================================================
if (!document.getElementById("dynamic-styles")) {
  const style = document.createElement("style");
  style.id = "dynamic-styles";
  style.textContent = `
    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; padding: 20px; }
    .modal-overlay.active { opacity: 1; pointer-events: auto; }
    .modal-content { background: var(--natural-color, #ffffff); padding: 30px; border-radius: var(--radius-lg, 20px); width: 100%; max-width: 520px; position: relative; box-shadow: 0 15px 40px rgba(0,0,0,0.2); transform: translateY(30px) scale(0.95); transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); max-height: 90vh; overflow-y: auto; }
    .modal-overlay.active .modal-content { transform: translateY(0) scale(1); }
    .modal-close-btn { position: absolute; top: 15px; right: 15px; background: #f5f5f5; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; line-height: 1; cursor: pointer; color: var(--text-muted, #777); display: grid; place-items: center; transition: all 0.2s ease; z-index: 10; }
    .modal-close-btn:hover { background: var(--primary-color, #fa7001); color: #fff; }
    .form-input, .form-select, .form-textarea { width: 100%; height: 45px; padding: 0 14px; border: 1px solid #dddddd; border-radius: 10px; font-family: inherit; color: var(--text-dark, #1a1a1a); background-color: var(--natural-color, #ffffff); transition: border-color 0.25s ease, box-shadow 0.25s ease; margin-bottom: 15px; box-sizing: border-box; }
    .form-textarea { height: 100px; padding: 12px 14px; resize: vertical; }
    .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--primary-color, #fa7001); box-shadow: 0 0 0 3px rgba(250, 112, 1, 0.12); }
    .form-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; }
    .modal-content form { display: flex !important; flex-direction: column; opacity: 1 !important; visibility: visible !important; }
    .modal-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 5px; color: var(--text-dark, #1a1a1a); }
    .modal-subtitle { font-size: 0.9rem; color: #777; margin-bottom: 20px; display: block; }
    .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-container { text-align: center; padding: 40px 20px; animation: fadeIn 0.5s ease; }
    .success-icon { width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; animation: scaleIn 0.5s ease; }
    .success-icon svg { width: 40px; height: 40px; color: white; stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 0.6s ease forwards 0.3s; }
    @keyframes scaleIn { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
    @keyframes drawCheck { to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .success-title { font-size: 1.5rem; font-weight: 600; color: var(--text-dark, #1a1a1a); margin-bottom: 10px; }
    .success-message { color: #777; font-size: 0.95rem; line-height: 1.6; }

    /* Dynamic Course Card Styles */
    .courseCard .cardPic { width: 100%; height: 200px; background-repeat: no-repeat; background-position: center; background-size: cover; transition: background-image 0.3s ease; }
    .course-title { margin: 20px 18px 0; font-size: 1rem; font-weight: 600; color: var(--text-dark, #1a1a1a); }
    .course-desc { margin: 14px 18px 0; font-size: 0.8rem; line-height: 1.6; color: var(--text-light, #555); }
    .course-duration { width: fit-content; margin: 14px 18px 0; padding: 6px 12px; border: 1px solid #e5e5e5; border-radius: 30px; color: var(--text-muted, #777); font-size: 0.7rem; display: flex; align-items: center; gap: 6px; }
    .course-actions { margin: auto 18px 20px; padding: 20px 0; width: calc(100% - 36px); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .course-enquiry-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; background-color: #2e8b57; color: #fff; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background-color 0.25s ease, transform 0.25s ease; }
    .course-enquiry-btn:hover { background-color: #256e46; transform: translateY(-2px); }
    
    /* NEW: Prevent hover effects on disabled/coming soon buttons */
    .courseCard.disabled-course .course-enquiry-btn:hover { 
      transform: none !important; 
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// GLOBAL STATE FOR WORKSPACE PLANS
// ============================================================
let workspacePlansMap = {}; 
let plansLoaded = false;

async function loadWorkspacePlans() {
  try {
    const response = await fetch(`${BASE_API_URL}/api/workspaces/plans/`); 
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const plans = await response.json();
    plans.forEach(plan => {
      workspacePlansMap[plan.name.toUpperCase()] = plan.id;
      workspacePlansMap[plan.name] = plan.id;
    });
    plansLoaded = true;
  } catch (error) {
    console.error("Error loading workspace plans:", error);
    workspacePlansMap = { 'DAILY': 1, 'Daily': 1, 'WEEKLY': 2, 'Weekly': 2, 'MONTHLY': 3, 'Monthly': 3 };
    plansLoaded = true;
  }
}

// ============================================================
// COURSES API INTEGRATION
// ============================================================
async function loadCourses() {
  const coursesContainer = document.getElementById("courses-container");
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: #777;">Loading courses...</div>';

  try {
    const response = await fetch(`${BASE_API_URL}/api/courses/`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    
    const courses = await response.json();
    coursesContainer.innerHTML = ""; 

    if (courses.length === 0) {
      coursesContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: #777;">No courses available at the moment.</p>';
      return;
    }

    courses.forEach((course, index) => {
      const isUnavailable = course.status === 'UNAVAILABLE';
      const isComingSoon = course.status === 'COMING_SOON';
      const isDisabled = isUnavailable || isComingSoon; 
      
      let imageHtml = '';
      if (course.image) {
        imageHtml = `<div class="cardPic" style="background-image: url('${course.image}'); background-color: #f0f0f0;" 
          onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.innerHTML='<span style=\'color:white; font-size:3rem;\'>📚</span>'">
        </div>`;
      } else {
        imageHtml = `<div class="cardPic" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 3rem;">📚</span>
        </div>`;
      }
      
      let actionButton;
      if (isUnavailable) {
        actionButton = `<span class="course-enquiry-btn" style="background-color: #ccc; cursor: not-allowed; opacity: 0.6;" title="Currently unavailable">
          <i class="fas fa-ban"></i> Unavailable
        </span>`;
      } else if (isComingSoon) {
        actionButton = `<span class="course-enquiry-btn" style="background-color: #fa7001; cursor: default;" title="Coming soon">
          <i class="fas fa-clock"></i> Coming Soon
        </span>`;
      } else {
        actionButton = `<span class="course-enquiry-btn" data-course="${course.title}">
          <i class="fab fa-whatsapp"></i> Make Enquiry
        </span>`;
      }
      
      const courseCard = document.createElement("div");
      courseCard.className = `courseCard scroll-reveal ${isDisabled ? 'disabled-course' : ''}`;
      courseCard.style.animationDelay = `${index * 100}ms`;
      
      courseCard.innerHTML = `
        ${imageHtml}
        <div class="course-title">${course.title}</div>
        <div class="course-desc">${course.description || 'No description available'}</div>
        <div class="course-duration"><i class="fas fa-clock"></i> ${course.duration}</div>
        <div class="course-actions">
          ${actionButton}
        </div>
      `;
      
      coursesContainer.appendChild(courseCard);
    });

    attachCourseEnquiryListeners();
    initCourseScrollReveal();

  } catch (error) {
    console.error("Error loading courses:", error);
    coursesContainer.innerHTML = `<div style="text-align:center; padding: 40px;"><p style="color: #d32f2f; margin-bottom: 10px;">Failed to load courses</p><p style="color: #777; font-size: 0.9rem;">${error.message}</p></div>`;
  }
}

function attachCourseEnquiryListeners() {
  document.querySelectorAll(".courseCard:not(.disabled-course) .course-enquiry-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const courseName = this.getAttribute("data-course") || "a course";
      const message = encodeURIComponent(`Hello, I'm interested in the ${courseName} course at PIHUB. Can you provide more information?`);
      window.open(`https://wa.me/2348088349833?text=${message}`, "_blank");
    });
  });
}

function initCourseScrollReveal() {
  const courseCards = document.querySelectorAll(".courseCard.scroll-reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  
  courseCards.forEach((card) => revealObserver.observe(card));
}

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
if (menuToggle) menuToggle.addEventListener("click", openMenu);
if (menuClose) menuClose.addEventListener("click", closeMenu);
if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);
if (mobileMenu) {
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

// ============================================================
// SCROLL REVEAL & ANIMATIONS
// ============================================================
const scrollRevealElements = document.querySelectorAll(".scroll-reveal");
if (scrollRevealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  scrollRevealElements.forEach((element) => revealObserver.observe(element));
}

const subscribeElement = document.querySelector(".subscribe > div");
if (subscribeElement) {
  const subscribeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); subscribeObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.3, rootMargin: "0px 0px -30px 0px" });
  subscribeObserver.observe(subscribeElement);
}

document.querySelectorAll(".footer > div").forEach((el, index) => {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add("visible"), index * 100); footerObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  footerObserver.observe(el);
});

const copyrightElement = document.querySelector(".copyright");
if (copyrightElement) {
  const copyrightObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); copyrightObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  copyrightObserver.observe(copyrightElement);
}

// ============================================================
// PANEL SWITCHING LOGIC
// ============================================================
const optionBtns = document.querySelectorAll(".option-btn");
const panels = {
  workspace: document.querySelector('.offer-panel[data-panel="workspace"]'),
  privateRoom: document.querySelector('.offer-panel[data-panel="privateRoom"]'),
  conferenceRoom: document.querySelector('.offer-panel[data-panel="conferenceRoom"]'),
  podcast: document.querySelector('.offer-panel[data-panel="podcast"]'),
  courses: document.querySelector('.offer-panel[data-panel="courses"]')
};
const heroSection = document.querySelector(".heronav");

function updateOptionButtonState(panelId) {
  optionBtns.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.panel === "workspace" && panelId === "workspace") btn.classList.add("active");
  });
}

function revealPanelContents(panelId, panel) {
  if (!panel) return;
  if (panelId === "workspace") { initWorkspaceObservers(); return; }
  panel.classList.remove("visible");
  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        panel.classList.add("visible"); panelObserver.unobserve(entry.target);
        if (panelId === "courses") {
          const cards = panel.querySelectorAll(".courseCard");
          cards.forEach((card, index) => { card.classList.remove("visible"); setTimeout(() => card.classList.add("visible"), index * 150 + 200); });
        }
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  panelObserver.observe(panel);
}

function switchToPanel(panelId) {
  const targetPanel = panels[panelId];
  if (!targetPanel) return;
  localStorage.setItem("targetPanel", panelId);
  updateOptionButtonState(panelId);
  Object.values(panels).forEach((panel) => {
    if (!panel) return;
    panel.classList.remove("active", "visible");
    panel.querySelectorAll(".scroll-reveal, .courseCard").forEach((el) => el.classList.remove("visible"));
  });
  targetPanel.classList.add("active");
  if (heroSection) {
    heroSection.classList.remove("panel-workspace", "panel-other");
    heroSection.classList.add(panelId === "workspace" ? "panel-workspace" : "panel-other");
  }
  if (window.closeBookingModal && panelId !== "workspace") window.closeBookingModal();
  if (window.closeEnquiryModal) window.closeEnquiryModal();
  setTimeout(() => revealPanelContents(panelId, targetPanel), 100);
}

function initWorkspaceObservers() {
  const workspacePanel = panels.workspace;
  if (!workspacePanel) return;
  const planCards = workspacePanel.querySelectorAll(".planCard.scroll-reveal");
  planCards.forEach((card, index) => {
    card.classList.remove("visible");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add("visible"), index * 150); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });
    observer.observe(card);
  });
  const title = workspacePanel.querySelector(".options2-title");
  if (title) {
    title.classList.remove("visible");
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); titleObserver.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    titleObserver.observe(title);
  }
  const desc = workspacePanel.querySelector(".options2-desc");
  if (desc) {
    desc.classList.remove("visible");
    const descObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); descObserver.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    descObserver.observe(desc);
  }
}

optionBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    const panelId = this.dataset.panel;
    if (!panels[panelId]) return;
    switchToPanel(panelId);
    history.pushState(null, "", `#${panelId}`);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  loadWorkspacePlans();
  loadCourses(); 
  
  const hashTarget = window.location.hash.replace("#", "");
  let storedTarget = "workspace";
  try { const saved = localStorage.getItem("targetPanel"); if (saved && panels[saved]) storedTarget = saved; } catch (e) {}
  let initialPanel = "workspace";
  if (hashTarget && panels[hashTarget]) { initialPanel = hashTarget; try { localStorage.setItem("targetPanel", initialPanel); } catch (e) {} } 
  else { initialPanel = storedTarget; }
  switchToPanel(initialPanel);
});

window.addEventListener("hashchange", function () {
  const hash = window.location.hash.replace("#", "");
  if (hash && panels[hash]) switchToPanel(hash);
});

// ============================================================
// COUNTER ANIMATION
// ============================================================
const counterElements = document.querySelectorAll(".counter-number");
if (counterElements.length > 0) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = +counter.getAttribute("data-target");
      const duration = 1500;
      const totalFrames = Math.round(duration / (1000 / 60));
      const increment = target / totalFrames;
      let current = 0;
      const animateCounter = () => {
        current += increment;
        if (current < target) { counter.innerText = Math.ceil(current).toLocaleString(); requestAnimationFrame(animateCounter); } 
        else { counter.innerText = target.toLocaleString(); }
      };
      animateCounter();
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.5 });
  counterElements.forEach((el) => counterObserver.observe(el));
}

// ============================================================
// 1. BOOKING MODAL SETUP (Workspace Plans)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const planCards = document.querySelectorAll('.offer-panel[data-panel="workspace"] .planCard');
  const selectBtns = document.querySelectorAll('.offer-panel[data-panel="workspace"] .selectBtn');
  const bookingForm = document.getElementById("bookingForm");
  
  if (bookingForm) {
    const changePlanLink = document.getElementById("changePlan");
    if (changePlanLink) changePlanLink.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay booking-modal-overlay";
    overlay.innerHTML = `<div class="modal-content booking-modal-content"></div>`;
    document.body.appendChild(overlay);
    
    const modalContent = overlay.querySelector(".modal-content");
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close booking form");
    modalContent.appendChild(closeBtn);
    
    bookingForm.style.display = "none"; 
    modalContent.appendChild(bookingForm);
    
    const oldPlanInput = document.getElementById("planInput");
    let planSelect = null;
    if (oldPlanInput) {
      planSelect = document.createElement("select");
      planSelect.id = "planSelect";
      planSelect.name = "plan";
      planSelect.className = "form-select";
      planSelect.required = true;
      planSelect.innerHTML = `<option value="" disabled selected>Select a plan</option><option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>`;
      oldPlanInput.parentNode.replaceChild(planSelect, oldPlanInput);
    }

    window.openBookingModal = (planName) => {
      if (planSelect) planSelect.value = planName || "";
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    window.closeBookingModal = () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      planCards.forEach(card => card.classList.remove("active", "popular"));
      if (planSelect) planSelect.value = "";
    };

    closeBtn.addEventListener("click", window.closeBookingModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) window.closeBookingModal(); });
  }

  if (!document.getElementById("active-plan-card-style")) {
    const style = document.createElement("style");
    style.id = "active-plan-card-style";
    style.textContent = `
      .planCard.active { background-color: var(--bg-black) !important; border-color: var(--bg-black) !important; }
      .planCard.active:hover { border-color: var(--primary-color) !important; }
      .planCard.active .planName { color: var(--natural-color) !important; }
      .planCard.active .planDesc { color: rgba(255, 255, 255, 0.65) !important; }
      .planCard.active .planPrice p:first-child, .planCard.active .planPrice .currency-symbol, .planCard.active .planPrice .counter-number { color: var(--natural-color) !important; }
      .planCard.active .planPrice p:last-child { color: rgba(255, 255, 255, 0.55) !important; }
      .planCard.active .selectBtn { background-color: var(--primary-color) !important; border-color: var(--primary-color) !important; color: var(--natural-color) !important; }
      .planCard.active .planFeatures { background-color: var(--natural-color) !important; }
      .planCard.active .planFeatures span, .planCard.active .planFeatures p, .planCard.active .planFeatures li { color: #444 !important; }
    `;
    document.head.appendChild(style);
  }

  function setActivePlan(card) {
    if (!card || !card.closest('.offer-panel[data-panel="workspace"]')) return;
    planCards.forEach((planCard) => planCard.classList.remove("active", "popular"));
    card.classList.add("active");
  }

  selectBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      const planCard = this.closest(".planCard");
      if (!planCard) return;
      setActivePlan(planCard);
      if (window.openBookingModal) window.openBookingModal(planCard.dataset.plan);
    });
  });

  planCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".selectBtn")) return;
      setActivePlan(card);
      if (window.openBookingModal) window.openBookingModal(card.dataset.plan);
    });
  });
});

// ============================================================
// 2. ENQUIRY MODAL SETUP (Private Office, Conference, Showroom)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const enquiryOverlay = document.createElement("div");
  enquiryOverlay.className = "modal-overlay enquiry-modal-overlay";
  enquiryOverlay.innerHTML = `
    <div class="modal-content enquiry-modal-content">
      <button class="modal-close-btn" aria-label="Close enquiry form">&times;</button>
      <h3 class="modal-title">Make an Enquiry</h3>
      <span class="modal-subtitle" id="enquiry-context-text">Tell us what you're interested in.</span>
      <form id="enquiryForm">
        <input type="hidden" id="enquiryServiceType" name="service_type">
        <input type="hidden" id="enquirySubject" name="subject">
        <input type="text" class="form-input" id="enquiryName" name="name" placeholder="Your Full Name" required>
        <input type="email" class="form-input" id="enquiryEmail" name="email" placeholder="Your Email Address" required>
        <input type="tel" class="form-input" id="enquiryPhone" name="phone" placeholder="Phone Number (Optional)">
        <textarea class="form-textarea" id="enquiryMessage" name="message" placeholder="How can we help you?" required></textarea>
        <button type="submit" class="btn-primary" style="width:100%; height:45px; background:var(--primary-color, #fa7001); color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.3s ease;"><span>Send Enquiry</span></button>
      </form>
    </div>
  `;
  document.body.appendChild(enquiryOverlay);

  const enquiryContextText = document.getElementById("enquiry-context-text");
  const modalContent = enquiryOverlay.querySelector(".modal-content");

  window.openEnquiryModal = (serviceType, subject, contextName) => {
    document.getElementById("enquiryServiceType").value = serviceType;
    document.getElementById("enquirySubject").value = subject;
    enquiryContextText.textContent = `Regarding: ${contextName}`;
    
    modalContent.innerHTML = `
      <button class="modal-close-btn" aria-label="Close enquiry form">&times;</button>
      <h3 class="modal-title">Make an Enquiry</h3>
      <span class="modal-subtitle" id="enquiry-context-text">Regarding: ${contextName}</span>
      <form id="enquiryForm">
        <input type="hidden" id="enquiryServiceType" name="service_type" value="${serviceType}">
        <input type="hidden" id="enquirySubject" name="subject" value="${subject}">
        <input type="text" class="form-input" id="enquiryName" name="name" placeholder="Your Full Name" required>
        <input type="email" class="form-input" id="enquiryEmail" name="email" placeholder="Your Email Address" required>
        <input type="tel" class="form-input" id="enquiryPhone" name="phone" placeholder="Phone Number (Optional)">
        <textarea class="form-textarea" id="enquiryMessage" name="message" placeholder="How can we help you?" required></textarea>
        <button type="submit" class="btn-primary" style="width:100%; height:45px; background:var(--primary-color, #fa7001); color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.3s ease;"><span>Send Enquiry</span></button>
      </form>
    `;
    
    enquiryOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    
    const newCloseBtn = modalContent.querySelector(".modal-close-btn");
    newCloseBtn.addEventListener("click", window.closeEnquiryModal);
    enquiryOverlay.addEventListener("click", (e) => { if (e.target === enquiryOverlay) window.closeEnquiryModal(); });
    const newForm = modalContent.querySelector("#enquiryForm");
    newForm.addEventListener("submit", handleEnquirySubmit);
  };

  window.closeEnquiryModal = () => {
    enquiryOverlay.classList.remove("active");
    document.body.style.overflow = "";
  };
  
  function handleEnquirySubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span><span>Sending...</span>';
    submitBtn.style.opacity = "0.8";

    const formData = {
      name: document.getElementById("enquiryName").value.trim(),
      email: document.getElementById("enquiryEmail").value.trim(),
      phone: document.getElementById("enquiryPhone").value.trim(),
      service_type: document.getElementById("enquiryServiceType").value,
      subject: document.getElementById("enquirySubject").value,
      message: document.getElementById("enquiryMessage").value.trim()
    };

    fetch(`${BASE_API_URL}/api/core/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to send enquiry");
      return response.json();
    })
    .then(() => {
      modalContent.innerHTML = `
        <div class="success-container">
          <div class="success-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <h3 class="success-title">Enquiry Sent!</h3>
          <p class="success-message">Thank you for your enquiry. We'll get back to you within 24 hours.</p>
        </div>
      `;
      setTimeout(() => { window.closeEnquiryModal(); }, 3000);
    })
    .catch(error => {
      console.error("Enquiry failed:", error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      submitBtn.style.opacity = "1";
      alert("Failed to send enquiry. Please try again or contact us directly.");
    });
  }

  enquiryOverlay.querySelector(".modal-close-btn").addEventListener("click", window.closeEnquiryModal);
  enquiryOverlay.addEventListener("click", (e) => { if (e.target === enquiryOverlay) window.closeEnquiryModal(); });
  document.getElementById("enquiryForm").addEventListener("submit", handleEnquirySubmit);
});

// ============================================================
// 3. ATTACH ENQUIRY BUTTON LISTENERS
// ============================================================
document.querySelectorAll(".privateEnquiry-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const card = this.closest(".planCard");
    const planName = card?.dataset.plan || "Space";
    const serviceTypeMap = { 'PrivateOffice': 'PRIVATE_SPACE', 'ConferenceRoom': 'CONFERENCE_ROOM', 'Showroom': 'PODCAST' };
    const serviceType = serviceTypeMap[planName] || 'GENERAL';
    if (window.openEnquiryModal) window.openEnquiryModal(serviceType, `Enquiry: ${planName}`, planName);
  });
});

// ============================================================
// BOOKING FORM SUBMISSION
// ============================================================
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Book Now';

  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!plansLoaded) { alert("Plans are still loading. Please wait a moment and try again."); return; }

    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const startDate = document.getElementById("startDate")?.value;
    const planName = document.getElementById("planSelect")?.value;

    if (!firstName || !lastName || !email || !phone || !planName || !startDate) {
      alert("Please fill in all required fields and select a plan."); return;
    }

    const planId = workspacePlansMap[planName.toUpperCase()] || workspacePlansMap[planName];
    if (!planId) { alert(`Plan "${planName}" not found. Please refresh the page.`); return; }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Processing..."; }

    const bookingData = {
      workspace_plan: planId,
      customer_name: `${firstName} ${lastName}`,
      customer_email: email,
      customer_phone: phone,
      start_date: `${startDate}T10:00:00`
    };

    try {
      const response = await fetch(`${BASE_API_URL}/api/workspaces/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Failed to create booking");
      }

      await response.json();
      alert(`Thank you! Your ${planName} booking is pending. We will contact you shortly for payment confirmation.`);
      bookingForm.reset();
      if (window.closeBookingModal) window.closeBookingModal();

    } catch (error) {
      console.error("Booking failed:", error);
      alert(`Booking failed: ${error.message}. Please try again or contact us directly.`);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    }
  });
}

// ============================================================
// FOOTER & FILTERS
// ============================================================
document.querySelectorAll('.footer a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const panelId = this.getAttribute("href").replace("#", "");
    if (!panels[panelId]) return;
    switchToPanel(panelId);
    history.pushState(null, "", `#${panelId}`);
    const offerSection = document.querySelector(".offer");
    if (offerSection) {
      const top = offerSection.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  });
});

optionBtns.forEach((btn) => { if (btn.dataset.panel !== "workspace") btn.classList.remove("active"); });

// ============================================================
// NEWSLETTER SUBSCRIPTION (UPDATED: No Alerts, Non-Expanding UI)
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

const subscribeForm = document.querySelector(".subscribeForm");
if (subscribeForm) {
  const subBtn = subscribeForm.querySelector('button[type="submit"]');
  const subOriginalText = subBtn ? subBtn.textContent : "Submit";

  subscribeForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const emailInput = subscribeForm.querySelector('input[type="email"]') || subscribeForm.querySelector('input[name="email"]');
    const email = emailInput?.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
      showSubscribeMessage("Please enter a valid email address.", "error"); 
      return; 
    }
    
    if (subBtn) { 
      subBtn.disabled = true; 
      subBtn.textContent = "Joining..."; 
    }

    try {
      const response = await fetch(`${BASE_API_URL}/api/core/subscribe/`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie('csrftoken')
        }, 
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (response.ok) {
        showSubscribeMessage("Thank you for subscribing to the PIHUB newsletter!", "success");
        subscribeForm.reset();
      } else {
        const errorMsg = data.email ? data.email[0] : (data.detail || data.error || "Failed to subscribe. Please try again.");
        showSubscribeMessage(errorMsg, "error");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      showSubscribeMessage("Something went wrong. Please try again.", "error");
    } finally {
      if (subBtn) { 
        subBtn.disabled = false; 
        subBtn.textContent = subOriginalText; 
      }
    }
  });
}