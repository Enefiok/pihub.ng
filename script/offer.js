// ============================================================
// API CONFIGURATION
// ============================================================
const BASE_API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "http://127.0.0.1:8000"; 

// Course registration endpoints (defined in script/config.js, with a safe fallback)
const REGISTRATION_ENDPOINTS = (typeof API_ENDPOINTS !== 'undefined') ? API_ENDPOINTS : {
  COURSES: `${BASE_API_URL}/api/courses/`,
  COURSE_REGISTER: `${BASE_API_URL}/api/courses/register/`,
  REFERRAL_VALIDATE: `${BASE_API_URL}/api/referrals/validate/`,
  PAYMENT_STATUS: `${BASE_API_URL}/api/courses/payment-status/`
};

// ============================================================
// SMALL HELPERS (escaping and price formatting)
// ============================================================
function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parsePrice(value) {
  const n = parseFloat(value);
  return isFinite(n) ? n : 0;
}

function formatNaira(value) {
  const n = parsePrice(value);
  return "\u20A6" + n.toLocaleString("en-NG", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
}

// ============================================================
// INJECT DYNAMIC STYLES (Modals, Courses & Scroll Animations)
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
    .courseCard.disabled-course .course-enquiry-btn:hover { transform: none !important; }

    /* Course Contact Choice Popup (WhatsApp / Gmail) - course cards only */
    .course-contact-choice-content {
      max-width: 460px;
      padding: 34px;
      text-align: center;
      background: linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%);
      border: 1px solid rgba(250, 112, 1, 0.12);
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.28);
    }
    .course-contact-choice-header { margin-bottom: 26px; }
    .course-contact-choice-icon {
      width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #fa7001, #e26400); color: #fff;
      font-size: 1.45rem; box-shadow: 0 10px 25px rgba(250, 112, 1, 0.25);
    }
    .course-contact-choice-title { margin: 0 0 8px; color: #151515; font-size: 1.45rem; font-weight: 700; }
    .course-contact-choice-subtitle { margin: 0; color: #777; font-size: 0.9rem; line-height: 1.6; }
    .course-contact-choice-options { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .course-contact-choice-btn {
      min-height: 125px; padding: 20px 14px; border: 1px solid #e8e8e8; border-radius: 16px;
      background: #fff; color: #222; text-decoration: none;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      font-family: inherit;
    }
    .course-contact-choice-btn:hover { transform: translateY(-5px); box-shadow: 0 14px 30px rgba(0, 0, 0, 0.10); }
    .course-contact-choice-btn i { font-size: 1.75rem; }
    .course-contact-choice-btn strong { font-size: 0.95rem; font-weight: 700; }
    .course-contact-choice-btn span { font-size: 0.72rem; color: #888; line-height: 1.4; word-break: break-word; }
    .course-contact-whatsapp { border-color: rgba(46, 139, 87, 0.18); }
    .course-contact-whatsapp i { color: #2e8b57; }
    .course-contact-whatsapp:hover { border-color: #2e8b57; box-shadow: 0 14px 30px rgba(46, 139, 87, 0.15); }
    .course-contact-gmail { border-color: rgba(234, 67, 53, 0.16); }
    .course-contact-gmail i { color: #ea4335; }
    .course-contact-gmail:hover { border-color: #ea4335; box-shadow: 0 14px 30px rgba(234, 67, 53, 0.14); }
    .course-contact-choice-note { margin: 20px 0 0; color: #999; font-size: 0.72rem; }
    @media (max-width: 520px) {
      .course-contact-choice-content { padding: 30px 20px; max-width: 390px; }
      .course-contact-choice-options { grid-template-columns: 1fr; }
      .course-contact-choice-btn { min-height: 100px; flex-direction: row; justify-content: flex-start; text-align: left; padding: 16px; }
      .course-contact-choice-btn i { width: 42px; text-align: center; flex-shrink: 0; }
    }

    /* SCROLL-TRIGGERED SEQUENTIAL ANIMATIONS */
    .anim-fade-up { animation: animFadeUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .anim-fade-left { animation: animFadeLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .anim-fade-right { animation: animFadeRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .anim-scale-pop { animation: animScalePop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .anim-blur-in { animation: animBlurIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

    @keyframes animFadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes animFadeLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes animFadeRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes animScalePop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes animBlurIn { from { opacity: 0; filter: blur(12px); transform: scale(1.05); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
  `;
  document.head.appendChild(style);
}

// ============================================================
// INJECT STYLES: COURSE REGISTER BUTTON + REGISTER MODAL
// ============================================================
if (!document.getElementById("register-modal-styles")) {
  const regStyle = document.createElement("style");
  regStyle.id = "register-modal-styles";
  regStyle.textContent = `
    /* Course card: two buttons side by side */
    .course-actions { flex-wrap: wrap; gap: 10px; }
    .course-register-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; background-color: var(--primary-color, #fa7001); color: #fff; border: none; border-radius: 8px; font-family: inherit; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background-color 0.25s ease, transform 0.25s ease; }
    .course-register-btn:hover { background-color: #e06500; transform: translateY(-2px); }
    .course-register-btn:focus-visible { outline: 2px solid var(--bg-black, #111111); outline-offset: 2px; }

    /* Register modal */
    .register-modal-content { max-width: 560px; }
    .register-modal-content [hidden] { display: none !important; }
    .reg-field { display: flex; flex-direction: column; margin: 0 0 16px; border: 0; padding: 0; min-width: 0; }
    .reg-field label, .reg-field legend { font-size: 0.82rem; font-weight: 600; color: var(--text-dark, #1a1a1a); margin-bottom: 6px; padding: 0; }
    .reg-optional { font-weight: 400; color: #888; }
    .reg-field .form-input { margin-bottom: 0; }
    .reg-field .form-input[readonly] { background: #f5f5f5; color: #555; cursor: default; }
    .reg-field .form-input.has-error { border-color: #d32f2f; }
    .reg-error { font-size: 0.75rem; color: #d32f2f; margin-top: 5px; line-height: 1.4; }
    .reg-error:empty { display: none; }

    .reg-referral-row { display: flex; gap: 10px; }
    .reg-referral-row .form-input { flex: 1; min-width: 0; text-transform: uppercase; }
    .reg-referral-row .form-input::placeholder { text-transform: none; }
    .reg-apply-btn { flex-shrink: 0; height: 45px; padding: 0 20px; background: var(--bg-black, #111111); color: #fff; border: none; border-radius: 10px; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background-color 0.25s ease; }
    .reg-apply-btn:hover:not(:disabled) { background: var(--primary-color, #fa7001); }
    .reg-apply-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .reg-apply-btn .spinner { width: 14px; height: 14px; border-width: 2px; margin-right: 0; }
    .reg-referral-msg { font-size: 0.78rem; margin-top: 6px; line-height: 1.4; }
    .reg-referral-msg:empty { display: none; }
    .reg-referral-msg.success { color: #1b8a4b; }
    .reg-referral-msg.error { color: #d32f2f; }

    .reg-payment-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .reg-pay-card { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid #dddddd; border-radius: 12px; cursor: pointer; font-weight: 400; margin: 0; transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease; }
    .reg-pay-card input { margin-top: 3px; accent-color: var(--primary-color, #fa7001); flex-shrink: 0; }
    .reg-pay-card.selected { border-color: var(--primary-color, #fa7001); background: rgba(250, 112, 1, 0.06); box-shadow: 0 0 0 3px rgba(250, 112, 1, 0.12); }
    .reg-pay-card.is-disabled { opacity: 0.5; cursor: not-allowed; }
    .reg-pay-body { display: flex; flex-direction: column; gap: 3px; }
    .reg-pay-body strong { font-size: 0.9rem; font-weight: 600; color: var(--text-dark, #1a1a1a); }
    .reg-pay-body small { font-size: 0.72rem; color: #777; line-height: 1.4; }

    .reg-summary { background: var(--bg-black, #111111); color: #fff; border-radius: 12px; padding: 16px 18px; margin: 4px 0 16px; }
    .reg-summary-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.85rem; padding: 4px 0; color: rgba(255, 255, 255, 0.8); }
    .reg-summary-row.discount { color: #7be0a4; }
    .reg-summary-row.total { margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.18); font-size: 1rem; font-weight: 700; color: #fff; }
    .reg-summary-row.total span:last-child { color: var(--primary-color, #fa7001); font-size: 1.15rem; }

    .reg-banner { padding: 12px 14px; margin-bottom: 14px; border-radius: 10px; background: #fdecea; color: #b3261e; border: 1px solid #f5c2be; font-size: 0.85rem; line-height: 1.5; }
    .reg-submit-btn { width: 100%; height: 48px; background: var(--primary-color, #fa7001); color: #fff; border: none; border-radius: 10px; font-family: inherit; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background-color 0.25s ease; }
    .reg-submit-btn:hover:not(:disabled) { background: #e06500; }
    .reg-submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }

    .reg-success-price { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 18px 0; padding: 14px 18px; border-radius: 12px; background: var(--bg-black, #111111); color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; }
    .reg-success-price strong { color: var(--primary-color, #fa7001); font-size: 1.25rem; }
    .reg-done-btn { margin-top: 10px; padding: 12px 34px; background: var(--primary-color, #fa7001); color: #fff; border: none; border-radius: 10px; font-family: inherit; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.25s ease; }
    .reg-done-btn:hover { background: #e06500; }

    @media (max-width: 520px) {
      .register-modal-content { padding: 26px 18px; }
      .reg-payment-options { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(regStyle);
}

// ============================================================
// GLOBAL STATE FOR WORKSPACE PLANS
// ============================================================
let workspacePlansMap = {}; 
let plansLoaded = false;

// Courses loaded from the API, keyed by id (used by the Register modal)
let coursesById = {};

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
// COURSE CONTACT CHOICE POPUP (WhatsApp / Gmail) - course cards only
// ============================================================
(function setupCourseContactChoicePopup() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay course-contact-choice-overlay";
  overlay.innerHTML = `
    <div class="modal-content course-contact-choice-content">
      <button class="modal-close-btn course-contact-choice-close" aria-label="Close contact options">&times;</button>
      <div class="course-contact-choice-header">
        <div class="course-contact-choice-icon"><i class="fas fa-comments"></i></div>
        <h3 class="course-contact-choice-title">How would you like to contact us?</h3>
        <p class="course-contact-choice-subtitle" id="courseContactSubtitle">Choose your preferred way to make an enquiry with PIHUB.</p>
      </div>
      <div class="course-contact-choice-options">
        <button type="button" class="course-contact-choice-btn course-contact-whatsapp" id="courseContactWhatsAppBtn">
          <i class="fab fa-whatsapp"></i>
          <strong>WhatsApp</strong>
          <span>Chat with us directly</span>
        </button>
        <button type="button" class="course-contact-choice-btn course-contact-gmail" id="courseContactGmailBtn">
          <i class="fas fa-envelope"></i>
          <strong>Gmail</strong>
          <span>prestigeinnovationhub@gmail.com</span>
        </button>
      </div>
      <p class="course-contact-choice-note">Select an option above to continue.</p>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(".course-contact-choice-close");
  const whatsAppBtn = overlay.querySelector("#courseContactWhatsAppBtn");
  const gmailBtn = overlay.querySelector("#courseContactGmailBtn");
  const subtitle = overlay.querySelector("#courseContactSubtitle");

  let currentCourseName = "a course";

  window.openCourseContactChoicePopup = (courseName = "a course") => {
    currentCourseName = courseName;
    if (subtitle) subtitle.textContent = `Choose your preferred way to enquire about the ${courseName} course.`;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeCourseContactChoicePopup = () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn.addEventListener("click", window.closeCourseContactChoicePopup);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) window.closeCourseContactChoicePopup(); });

  whatsAppBtn.addEventListener("click", function () {
    const message = encodeURIComponent(`Hello, I'm interested in the ${currentCourseName} course at PIHUB. Can you provide more information?`);
    window.open(`https://wa.me/2348088349833?text=${message}`, "_blank");
    window.closeCourseContactChoicePopup();
  });

  gmailBtn.addEventListener("click", function () {
    const subject = encodeURIComponent(`Enquiry: ${currentCourseName} Course`);
    const body = encodeURIComponent(`Hello, I'm interested in the ${currentCourseName} course at PIHUB. Can you provide more information?`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=prestigeinnovationhub@gmail.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
    window.closeCourseContactChoicePopup();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      window.closeCourseContactChoicePopup();
    }
  });
})();

// ============================================================
// COURSE REGISTER MODAL (registration, referral code, payment option)
// ============================================================
(function setupCourseRegisterModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay register-modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content register-modal-content" role="dialog" aria-modal="true" aria-labelledby="regTitle">
      <button type="button" class="modal-close-btn" id="regClose" aria-label="Close registration form">&times;</button>

      <div id="regFormView">
        <h3 class="modal-title" id="regTitle">Register for a Course</h3>
        <span class="modal-subtitle">Fill in your details to secure your place.</span>

        <form id="registerForm" novalidate>
          <div class="reg-field">
            <label for="regFullName">Full name</label>
            <input type="text" class="form-input" id="regFullName" name="full_name" placeholder="Enter your full name" autocomplete="name" maxlength="150">
            <span class="reg-error" data-error-for="full_name"></span>
          </div>

          <div class="reg-field">
            <label for="regEmail">Email address</label>
            <input type="email" class="form-input" id="regEmail" name="email" placeholder="Enter your email address" autocomplete="email" maxlength="254">
            <span class="reg-error" data-error-for="email"></span>
          </div>

          <div class="reg-field">
            <label for="regPhone">Phone number <span class="reg-optional">(optional)</span></label>
            <input type="tel" class="form-input" id="regPhone" name="phone" placeholder="Enter your phone number" autocomplete="tel" maxlength="20">
            <span class="reg-error" data-error-for="phone"></span>
          </div>

          <div class="reg-field">
            <label for="regCourse">Selected course</label>
            <input type="text" class="form-input" id="regCourse" name="course" readonly tabindex="-1">
            <span class="reg-error" data-error-for="course_id"></span>
          </div>

          <div class="reg-field">
            <label for="regReferral">Referral code <span class="reg-optional">(optional)</span></label>
            <div class="reg-referral-row">
              <input type="text" class="form-input" id="regReferral" name="referral_code" placeholder="Enter referral code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="50">
              <button type="button" class="reg-apply-btn" id="regApplyBtn">Apply</button>
            </div>
            <span class="reg-referral-msg" id="regReferralMsg" role="status" aria-live="polite"></span>
            <span class="reg-error" data-error-for="referral_code"></span>
          </div>

          <fieldset class="reg-field">
            <legend>Payment option</legend>
            <div class="reg-payment-options">
              <label class="reg-pay-card selected" id="regPayNowCard">
                <input type="radio" name="payment_option" value="pay_now" checked>
                <span class="reg-pay-body">
                  <strong>Pay now</strong>
                  <small id="regPayNowHint">Pay securely online right after you submit.</small>
                </span>
              </label>
              <label class="reg-pay-card" id="regPayLaterCard">
                <input type="radio" name="payment_option" value="pay_later">
                <span class="reg-pay-body">
                  <strong>Fill now, pay later</strong>
                  <small>Submit your details now and our team will contact you to arrange payment.</small>
                </span>
              </label>
            </div>
            <span class="reg-error" data-error-for="payment_option"></span>
          </fieldset>

          <div class="reg-summary" id="regSummary" aria-live="polite"></div>

          <div class="reg-banner" id="regBanner" role="alert" hidden></div>

          <button type="submit" class="reg-submit-btn" id="regSubmit"><span id="regSubmitLabel">Continue to payment</span></button>
        </form>
      </div>

      <div id="regSuccessView" hidden></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const els = {
    closeBtn: overlay.querySelector("#regClose"),
    formView: overlay.querySelector("#regFormView"),
    successView: overlay.querySelector("#regSuccessView"),
    form: overlay.querySelector("#registerForm"),
    fullName: overlay.querySelector("#regFullName"),
    email: overlay.querySelector("#regEmail"),
    phone: overlay.querySelector("#regPhone"),
    course: overlay.querySelector("#regCourse"),
    referral: overlay.querySelector("#regReferral"),
    applyBtn: overlay.querySelector("#regApplyBtn"),
    referralMsg: overlay.querySelector("#regReferralMsg"),
    payNowCard: overlay.querySelector("#regPayNowCard"),
    payLaterCard: overlay.querySelector("#regPayLaterCard"),
    payNowHint: overlay.querySelector("#regPayNowHint"),
    summary: overlay.querySelector("#regSummary"),
    banner: overlay.querySelector("#regBanner"),
    submit: overlay.querySelector("#regSubmit"),
    submitLabel: overlay.querySelector("#regSubmitLabel")
  };

  const payNowInput = els.payNowCard.querySelector("input");
  const payLaterInput = els.payLaterCard.querySelector("input");
  const PAY_NOW_HINT = els.payNowHint.textContent;

  const state = {
    course: null,
    validation: null,      // last successful referral validation response
    appliedCode: "",       // code the validation belongs to
    lastCheckedCode: "",   // last code sent to the server (avoids repeat checks on blur)
    validating: null,      // promise of an in-flight validation
    submitting: false,
    redirecting: false
  };

  // ---------- helpers ----------
  function toText(value) {
    if (Array.isArray(value)) return value.map(toText).join(" ");
    if (value && typeof value === "object") return Object.values(value).map(toText).join(" ");
    return String(value === undefined || value === null ? "" : value);
  }

  function extractMessage(data, fallback) {
    if (!data || typeof data !== "object") return fallback;
    const candidates = [data.code, data.error, data.detail, data.message, data.non_field_errors];
    for (const item of candidates) {
      const text = toText(item).trim();
      if (text) return text;
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const text = toText(data[firstKey]).trim();
      if (text) return text;
    }
    return fallback;
  }

  function getCoursePrice() {
    return state.course ? parsePrice(state.course.price) : 0;
  }

  function getSelectedPayment() {
    const checked = els.form.querySelector('input[name="payment_option"]:checked');
    return checked ? checked.value : "";
  }

  // ---------- errors ----------
  function clearErrors() {
    els.form.querySelectorAll(".reg-error").forEach((el) => { el.textContent = ""; });
    els.form.querySelectorAll(".form-input.has-error").forEach((el) => el.classList.remove("has-error"));
    els.banner.hidden = true;
    els.banner.textContent = "";
  }

  function showFieldError(name, message) {
    const target = els.form.querySelector(`.reg-error[data-error-for="${name}"]`);
    if (!target) return false;
    target.textContent = message;
    const input = target.parentElement.querySelector(".form-input");
    if (input) input.classList.add("has-error");
    return true;
  }

  function showBanner(message) {
    els.banner.textContent = message;
    els.banner.hidden = false;
  }

  // ---------- price summary ----------
  function summaryRow(label, value, extraClass) {
    return `<div class="reg-summary-row${extraClass ? " " + extraClass : ""}"><span>${label}</span><span>${value}</span></div>`;
  }

  function renderSummary() {
    const base = getCoursePrice();
    const v = state.validation;

    if (!state.course) {
      els.summary.innerHTML = "";
      return;
    }

    if (!base) {
      els.summary.innerHTML = summaryRow("Course fee", "Contact for pricing", "total");
      return;
    }

    if (v) {
      const percent = Number(v.discount_percent);
      els.summary.innerHTML =
        summaryRow("Original price", formatNaira(v.original_price !== undefined ? v.original_price : base)) +
        summaryRow("Discount", isFinite(percent) ? escapeHtml(percent) + "%" : "-", "discount") +
        summaryRow("Discount amount", "-" + formatNaira(v.discount_amount), "discount") +
        summaryRow("Final price", formatNaira(v.final_price), "total");
      return;
    }

    els.summary.innerHTML = summaryRow("Course fee", formatNaira(base), "total");
  }

  // ---------- payment option UI ----------
  function syncPaymentUI() {
    const value = getSelectedPayment();
    els.payNowCard.classList.toggle("selected", value === "pay_now");
    els.payLaterCard.classList.toggle("selected", value === "pay_later");
    els.submitLabel.textContent = value === "pay_later" ? "Submit registration" : "Continue to payment";
  }

  // ---------- referral code ----------
  function setReferralMessage(text, type) {
    els.referralMsg.textContent = text || "";
    els.referralMsg.className = "reg-referral-msg" + (type ? " " + type : "");
  }

  function clearReferralResult() {
    state.validation = null;
    state.appliedCode = "";
    state.lastCheckedCode = "";
    setReferralMessage("", "");
    renderSummary();
  }

  function setApplyLoading(isLoading) {
    els.applyBtn.disabled = isLoading;
    els.applyBtn.innerHTML = isLoading ? '<span class="spinner"></span><span>Checking</span>' : "Apply";
  }

  async function runReferralValidation(code) {
    setApplyLoading(true);
    setReferralMessage("", "");
    const referralErr = els.form.querySelector('.reg-error[data-error-for="referral_code"]');
    if (referralErr) referralErr.textContent = "";
    els.referral.classList.remove("has-error");

    try {
      const response = await fetch(REGISTRATION_ENDPOINTS.REFERRAL_VALIDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, course_id: state.course.id })
      });

      let data = {};
      try { data = await response.json(); } catch (parseError) { data = {}; }

      state.lastCheckedCode = code;

      if (response.status === 429) {
        state.validation = null;
        state.appliedCode = "";
        renderSummary();
        setReferralMessage("Too many attempts. Please try again later.", "error");
        return false;
      }

      if (!response.ok || data.valid === false) {
        state.validation = null;
        state.appliedCode = "";
        renderSummary();
        setReferralMessage(extractMessage(data, "This referral code is not valid."), "error");
        return false;
      }

      state.validation = data;
      state.appliedCode = code;
      renderSummary();
      setReferralMessage("Referral code applied. You save " + formatNaira(data.discount_amount) + ".", "success");
      return true;
    } catch (error) {
      console.error("Referral validation failed:", error);
      state.lastCheckedCode = code;
      state.validation = null;
      state.appliedCode = "";
      renderSummary();
      setReferralMessage("We could not check the code. Please check your connection and try again.", "error");
      return false;
    } finally {
      setApplyLoading(false);
    }
  }

  // Returns a promise resolving to true when the code is valid (or empty), false otherwise.
  // force = true re-checks the same code (used by the Apply button and on submit).
  function applyReferral(force) {
    const code = els.referral.value.trim().toUpperCase();

    if (!code) {
      clearReferralResult();
      return Promise.resolve(true);
    }
    if (!state.course) return Promise.resolve(false);

    if (state.validating) return state.validating;

    if (!force && code === state.lastCheckedCode) {
      return Promise.resolve(!!state.validation && state.appliedCode === code);
    }

    state.validating = runReferralValidation(code).then((result) => {
      state.validating = null;
      return result;
    });
    return state.validating;
  }

  // ---------- open / close ----------
  function resetModal() {
    els.form.reset();
    clearErrors();
    state.validation = null;
    state.appliedCode = "";
    state.lastCheckedCode = "";
    state.validating = null;
    state.submitting = false;
    state.redirecting = false;
    setReferralMessage("", "");
    setApplyLoading(false);
    els.submit.disabled = false;
    els.successView.hidden = true;
    els.successView.innerHTML = "";
    els.formView.hidden = false;
  }

  window.openRegisterModal = (course) => {
    if (!course) return;
    resetModal();
    state.course = course;
    els.course.value = course.title || "";

    const priced = parsePrice(course.price) > 0;
    payNowInput.disabled = !priced;
    els.payNowCard.classList.toggle("is-disabled", !priced);
    els.payNowHint.textContent = priced ? PAY_NOW_HINT : "Online payment is not available for this course yet.";
    if (!priced) payLaterInput.checked = true;

    syncPaymentUI();
    renderSummary();

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeRegisterModal = () => {
    if (!overlay.classList.contains("active")) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  els.closeBtn.addEventListener("click", window.closeRegisterModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) window.closeRegisterModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) window.closeRegisterModal();
  });

  // ---------- events: payment option ----------
  els.form.querySelectorAll('input[name="payment_option"]').forEach((input) => {
    input.addEventListener("change", () => {
      syncPaymentUI();
      const err = els.form.querySelector('.reg-error[data-error-for="payment_option"]');
      if (err) err.textContent = "";
    });
  });

  // ---------- events: clear field errors while typing ----------
  [els.fullName, els.email, els.phone].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("has-error");
      const err = input.parentElement.querySelector(".reg-error");
      if (err) err.textContent = "";
    });
  });

  // ---------- events: referral code (no validation on every keystroke) ----------
  els.referral.addEventListener("input", () => {
    const current = els.referral.value.trim().toUpperCase();
    els.referral.classList.remove("has-error");
    const err = els.form.querySelector('.reg-error[data-error-for="referral_code"]');
    if (err) err.textContent = "";

    if (state.validation && current !== state.appliedCode) {
      clearReferralResult();
    } else if (!state.validation) {
      state.lastCheckedCode = current === state.lastCheckedCode ? state.lastCheckedCode : "";
      setReferralMessage("", "");
    }
  });

  els.referral.addEventListener("blur", (e) => {
    if (e.relatedTarget && e.relatedTarget.id === "regClose") return;
    if (!els.referral.value.trim()) return;
    applyReferral(false);
  });

  els.referral.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyReferral(true);
    }
  });

  els.applyBtn.addEventListener("click", () => {
    if (!els.referral.value.trim()) {
      setReferralMessage("Enter a referral code first.", "error");
      els.referral.focus();
      return;
    }
    applyReferral(true);
  });

  // ---------- validation ----------
  function validateForm() {
    clearErrors();
    const errors = {};

    const fullName = els.fullName.value.trim();
    const email = els.email.value.trim();
    const phone = els.phone.value.trim();
    const paymentOption = getSelectedPayment();
    const referralCode = els.referral.value.trim().toUpperCase();

    if (!fullName) errors.full_name = "Please enter your full name.";
    else if (fullName.length < 2) errors.full_name = "Your name looks too short.";

    if (!email) errors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";

    if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) errors.phone = "Please enter a valid phone number.";

    if (!state.course || !state.course.id) errors.course_id = "No course selected. Please close this form and try again.";

    if (paymentOption !== "pay_now" && paymentOption !== "pay_later") errors.payment_option = "Please choose a payment option.";

    const keys = Object.keys(errors);
    if (keys.length) {
      keys.forEach((key) => showFieldError(key, errors[key]));
      const firstKey = keys[0];
      const firstInput = { full_name: els.fullName, email: els.email, phone: els.phone }[firstKey];
      if (firstInput) firstInput.focus();
      return null;
    }

    return {
      course_id: state.course.id,
      full_name: fullName,
      email: email,
      phone: phone,
      payment_option: paymentOption,
      referral_code: referralCode
    };
  }

  // ---------- submit ----------
  function setSubmitting(isSubmitting, label) {
    state.submitting = isSubmitting;
    els.submit.disabled = isSubmitting;
    if (isSubmitting) {
      els.submit.innerHTML = '<span class="spinner"></span><span>' + escapeHtml(label || "Processing...") + "</span>";
    } else {
      els.submit.innerHTML = '<span id="regSubmitLabel"></span>';
      els.submitLabel = els.submit.querySelector("#regSubmitLabel");
      syncPaymentUI();
    }
  }

  function handleRegisterErrors(data) {
    const fieldMap = {
      full_name: "full_name",
      email: "email",
      phone: "phone",
      course_id: "course_id",
      payment_option: "payment_option",
      referral_code: "referral_code",
      code: "referral_code"
    };
    const bannerMessages = [];
    let fieldErrorShown = false;

    if (data && typeof data === "object") {
      Object.keys(data).forEach((key) => {
        const text = toText(data[key]).trim();
        if (!text) return;
        if (fieldMap[key]) {
          if (showFieldError(fieldMap[key], text)) fieldErrorShown = true;
        } else if (key === "error" || key === "detail" || key === "message" || key === "non_field_errors") {
          bannerMessages.push(text);
        } else {
          bannerMessages.push(text);
        }
      });
    }

    if (bannerMessages.length) {
      showBanner(bannerMessages.join(" "));
    } else if (!fieldErrorShown) {
      showBanner("Something went wrong while submitting your registration. Please try again or contact us directly.");
    }
  }

  function showPayLaterSuccess(data, values) {
    let finalPrice = data && data.final_price !== undefined && data.final_price !== null ? data.final_price : null;
    if (finalPrice === null && state.validation) finalPrice = state.validation.final_price;
    if (finalPrice === null) finalPrice = state.course ? state.course.price : 0;

    const priceHtml = parsePrice(finalPrice) > 0
      ? `<div class="reg-success-price"><span>Amount to pay</span><strong>${formatNaira(finalPrice)}</strong></div>`
      : "";

    els.successView.innerHTML = `
      <div class="success-container">
        <div class="success-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
        <h3 class="success-title">Registration Received</h3>
        <p class="success-message">Thank you, ${escapeHtml(values.full_name)}. Your registration for ${escapeHtml(state.course.title)} has been received.</p>
        ${priceHtml}
        <p class="success-message">Our team will contact you shortly to arrange payment and confirm your place.</p>
        <button type="button" class="reg-done-btn" id="regDoneBtn">Done</button>
      </div>
    `;
    els.formView.hidden = true;
    els.successView.hidden = false;
    const doneBtn = els.successView.querySelector("#regDoneBtn");
    if (doneBtn) doneBtn.addEventListener("click", window.closeRegisterModal);
  }

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.submitting) return;

    const values = validateForm();
    if (!values) return;

    setSubmitting(true, "Processing...");

    try {
      // Make sure any entered referral code has been checked before submitting
      if (values.referral_code) {
        const codeOk = (state.validation && state.appliedCode === values.referral_code)
          ? true
          : await applyReferral(true);
        if (!codeOk) {
          els.referral.focus();
          return;
        }
      }

      // The price is never sent. The backend calculates it from the course and code.
      const payload = {
        course_id: values.course_id,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        payment_option: values.payment_option,
        referral_code: values.referral_code
      };

      const response = await fetch(REGISTRATION_ENDPOINTS.COURSE_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data = {};
      try { data = await response.json(); } catch (parseError) { data = {}; }

      if (response.status === 429) {
        showBanner("Too many requests. Please wait a while and try again later.");
        return;
      }

      if (!response.ok) {
        handleRegisterErrors(data);
        return;
      }

      if (values.payment_option === "pay_now") {
        if (data.authorization_url) {
          state.redirecting = true;
          setSubmitting(true, "Redirecting to payment...");
          window.location.href = data.authorization_url;
          return;
        }
        showBanner("We could not start the payment. Please try again or contact us directly.");
        return;
      }

      showPayLaterSuccess(data, values);
    } catch (error) {
      console.error("Course registration failed:", error);
      showBanner("We could not reach the server. Please check your connection and try again.");
    } finally {
      if (!state.redirecting) setSubmitting(false);
    }
  });

  // ---------- Register button on course cards (event delegation) ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".course-register-btn");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-course-id");
    const course = coursesById[id] || { id: id, title: btn.getAttribute("data-course") || "Course", price: "0.00" };
    window.openRegisterModal(course);
  });
})();

// ============================================================
// COURSES API INTEGRATION
// ============================================================
async function loadCourses() {
  const coursesContainer = document.getElementById("courses-container");
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: #777;">Loading courses...</div>';

  try {
    const response = await fetch(REGISTRATION_ENDPOINTS.COURSES);
    if (!response.ok) throw new Error("Failed to fetch courses");
    
    const courses = await response.json();
    coursesContainer.innerHTML = ""; 

    if (courses.length === 0) {
      coursesContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: #777;">No courses available at the moment.</p>';
      return;
    }

    coursesById = {};
    courses.forEach((course) => { coursesById[String(course.id)] = course; });

    courses.forEach((course, index) => {
      const isUnavailable = course.status === 'UNAVAILABLE';
      const isComingSoon = course.status === 'COMING_SOON';
      const isDisabled = isUnavailable || isComingSoon; 
      const safeTitle = escapeHtml(course.title);
      
      let imageHtml = '';
      if (course.image) {
        imageHtml = `<div class="cardPic" style="background-image: url('${course.image}'); background-color: #f0f0f0;"></div>`;
      } else {
        imageHtml = `<div class="cardPic" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-book" style="color: white; font-size: 3rem;"></i>
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
        actionButton = `<span class="course-enquiry-btn" data-course="${safeTitle}">
          <i class="fab fa-whatsapp"></i> Make Enquiry
        </span>
        <button type="button" class="course-register-btn" data-course-id="${escapeHtml(course.id)}" data-course="${safeTitle}">
          <i class="fas fa-user-plus"></i> Register
        </button>`;
      }
      
      const courseCard = document.createElement("div");
      courseCard.className = `courseCard scroll-reveal ${isDisabled ? 'disabled-course' : ''}`;
      courseCard.style.animationDelay = `${index * 100}ms`;
      
      courseCard.innerHTML = `
        ${imageHtml}
        <div class="course-title">${safeTitle}</div>
        <div class="course-desc">${escapeHtml(course.description || 'No description available')}</div>
        <div class="course-duration"><i class="fas fa-clock"></i> ${escapeHtml(course.duration)}</div>
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
    coursesContainer.innerHTML = `<div style="text-align:center; padding: 40px;"><p style="color: #d32f2f; margin-bottom: 10px;">Failed to load courses</p><p style="color: #777; font-size: 0.9rem;">${escapeHtml(error.message)}</p></div>`;
  }
}

function attachCourseEnquiryListeners() {
  document.querySelectorAll(".courseCard:not(.disabled-course) .course-enquiry-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const courseName = this.getAttribute("data-course") || "a course";
      if (window.openCourseContactChoicePopup) {
        window.openCourseContactChoicePopup(courseName);
      }
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
// SCROLL-TRIGGERED SEQUENTIAL ANIMATIONS (NO NAVBAR)
// ============================================================
function setupScrollReveal() {
  const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
  const animations = ['anim-fade-up', 'anim-scale-pop', 'anim-fade-left', 'anim-fade-right'];
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Prevent re-animating if already triggered
        if (el.classList.contains('anim-triggered')) return;
        el.classList.add('anim-triggered');

        let animClass = 'anim-fade-up';
        let delay = 0;

        // 1. Hero Section (Blur in)
        if (el.classList.contains('hero')) {
          animClass = 'anim-blur-in';
          delay = 200;
        } 
        // 2. Tab Options Container
        else if (el.classList.contains('options')) {
          animClass = 'anim-fade-up';
          delay = 300;
        } 
        // 3. Footer Columns (Sequential Stagger)
        else if (el.parentElement && el.parentElement.classList.contains('footerTop')) {
          const siblings = Array.from(el.parentElement.children);
          const index = siblings.indexOf(el);
          delay = index * 150; // 150ms stagger per column
        } 
        // 4. Copyright
        else if (el.classList.contains('copyright')) {
          delay = 600;
        } 
        // 5. Subscribe Box
        else if (el.classList.contains('subscribeBox')) {
          animClass = 'anim-scale-pop';
          delay = 100;
        }

        // Apply animation
        el.style.opacity = '0'; // Ensure it starts hidden to prevent FOUC
        el.classList.add(animClass);
        el.style.animationDelay = `${delay}ms`;
        
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  // Targets for scroll animation (EXPLICITLY EXCLUDING NAVBAR)
  const targets = document.querySelectorAll(`
    .hero, 
    .options, 
    .subscribeBox, 
    .footerTop > div, 
    .copyright
  `);
  
  targets.forEach(el => observer.observe(el));
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
    if (btn.dataset.panel === panelId) btn.classList.add("active");
  });
}

// Sequential animations when switching tabs
function revealPanelContents(panelId, panel) {
  if (!panel) return;
  
  // Reset animations for the new panel to allow re-triggering
  const animatedElements = panel.querySelectorAll('.planCard, .courseCard, .options2-title, .options2-desc, .options2 > span');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.classList.remove('anim-fade-up', 'anim-scale-pop', 'anim-fade-left', 'anim-fade-right', 'anim-blur-in', 'anim-triggered');
  });

  panel.classList.remove("visible");
  
  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        panel.classList.add("visible");
        panelObserver.unobserve(entry.target);

        const title = panel.querySelector('.options2-title, .options2 > span:nth-child(1)');
        const desc = panel.querySelector('.options2-desc, .options2 > span:nth-child(2)');
        
        if (title) { title.style.opacity = '0'; title.classList.add('anim-fade-up'); title.style.animationDelay = '0ms'; }
        if (desc) { desc.style.opacity = '0'; desc.classList.add('anim-fade-up'); desc.style.animationDelay = '100ms'; }

        // Sequential mixed animations for cards
        const cards = panel.querySelectorAll(".planCard, .courseCard");
        const cardAnimations = ['anim-fade-up', 'anim-scale-pop', 'anim-fade-right', 'anim-fade-left'];
        cards.forEach((card, index) => {
          card.style.opacity = '0';
          // Deterministic "random" mix so it looks organic but not chaotic
          const randomAnim = cardAnimations[(index * 7 + 3) % cardAnimations.length]; 
          card.classList.add(randomAnim);
          card.style.animationDelay = `${200 + (index * 120)}ms`; // 120ms stagger
        });
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
  if (window.closeRegisterModal) window.closeRegisterModal();
  setTimeout(() => revealPanelContents(panelId, targetPanel), 100);
}

// Sequential animations for the default loaded Workspace panel
function initWorkspaceAnimations() {
  const workspacePanel = panels.workspace;
  if (!workspacePanel) return;
  
  // Reset
  workspacePanel.querySelectorAll('.planCard, .options2-title, .options2-desc').forEach(el => {
    el.style.opacity = '0';
    el.classList.remove('anim-fade-up', 'anim-scale-pop', 'anim-fade-left', 'anim-fade-right', 'anim-triggered');
  });

  const title = workspacePanel.querySelector(".options2-title");
  const desc = workspacePanel.querySelector(".options2-desc");
  const planCards = workspacePanel.querySelectorAll(".planCard");
  const cardAnimations = ['anim-fade-up', 'anim-scale-pop', 'anim-fade-right', 'anim-fade-left'];

  if (title) { title.style.opacity = '0'; title.classList.add('anim-fade-up'); title.style.animationDelay = '0ms'; }
  if (desc) { desc.style.opacity = '0'; desc.classList.add('anim-fade-up'); desc.style.animationDelay = '100ms'; }

  planCards.forEach((card, index) => {
    card.style.opacity = '0';
    const randomAnim = cardAnimations[(index * 7 + 3) % cardAnimations.length];
    card.classList.add(randomAnim);
    card.style.animationDelay = `${200 + (index * 120)}ms`;
  });
}

optionBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    const panelId = this.dataset.panel;
    if (!panels[panelId]) return;
    switchToPanel(panelId);
    history.pushState(null, "", `#${panelId}`);
  });
});

// Always defaults to "workspace" unless a hash is in the URL
document.addEventListener("DOMContentLoaded", function () {
  loadWorkspacePlans();
  loadCourses(); 
  
  const hashTarget = window.location.hash.replace("#", "");
  let initialPanel = "workspace"; 
  
  if (hashTarget && panels[hashTarget]) { 
    initialPanel = hashTarget; 
  }
  
  switchToPanel(initialPanel);
  
  // Trigger scroll-based animations (NO NAVBAR)
  setupScrollReveal();
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
// BOOKING FORM SUBMISSION & PAYSTACK INTEGRATION
// ============================================================
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Book Now';

  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!plansLoaded) { 
      alert("Plans are still loading. Please wait a moment and try again."); 
      return; 
    }

    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const startDate = document.getElementById("startDate")?.value;
    const planName = document.getElementById("planSelect")?.value;

    if (!firstName || !lastName || !email || !phone || !planName || !startDate) {
      alert("Please fill in all required fields and select a plan."); 
      return;
    }

    const planId = workspacePlansMap[planName.toUpperCase()] || workspacePlansMap[planName];
    if (!planId) { 
      alert(`Plan "${planName}" not found. Please refresh the page.`); 
      return; 
    }

    if (submitBtn) { 
      submitBtn.disabled = true; 
      submitBtn.innerHTML = '<span class="spinner"></span> Processing...'; 
    }

    try {
      // STEP 1: Create the booking in the database
      const bookingData = {
        workspace_plan: planId,
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
        start_date: `${startDate}T10:00:00` 
      };

      const bookingResponse = await fetch(`${BASE_API_URL}/api/workspaces/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Failed to create booking");
      }

      const createdBooking = await bookingResponse.json();
      const bookingReference = createdBooking.reference; // Auto-generated by backend

      if (!bookingReference) {
        throw new Error("Booking created, but no reference was returned by the server.");
      }

      // STEP 2: Initialize Paystack Payment
      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Redirecting to Payment...';
      }
      
      const paymentResponse = await fetch(`${BASE_API_URL}/api/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: bookingReference,
          email: email
          // SECURITY: We intentionally DO NOT send 'amount' here. 
          // The backend securely fetches the real price from the database.
        })
      });

      if (!paymentResponse.ok) {
        const payError = await paymentResponse.json().catch(() => ({}));
        throw new Error(payError.error || "Failed to initialize payment");
      }

      const paymentData = await paymentResponse.json();

      // STEP 3: Redirect to Paystack Checkout
      if (paymentData.status === "success" && paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Invalid payment response from server");
      }

    } catch (error) {
      console.error("Booking/Payment failed:", error);
      alert(`Error: ${error.message}. Please try again or contact us directly.`);
      if (submitBtn) { 
        submitBtn.disabled = false; 
        submitBtn.textContent = originalBtnText; 
      }
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


// ============================================================
// COURSE "MAKE ENQUIRY" BUTTON -> always open the contact choice popup
// (event delegation, so it works even if cards are re-rendered)
// ============================================================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".courseCard:not(.disabled-course) .course-enquiry-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (window.openCourseContactChoicePopup) {
    window.openCourseContactChoicePopup(btn.dataset.course || "a course");
  }
}, true);


// ===== OPEN PANEL FROM URL (?panel=courses etc.) =====
(function openPanelFromURL() {
  const panelName = new URLSearchParams(window.location.search).get("panel");
  if (!panelName) return;

  function activate() {
    const btn = document.querySelector(`.option-btn[data-panel="${panelName}"]`);
    const panel = document.querySelector(`.offer-panel[data-panel="${panelName}"]`);
    if (!btn || !panel) return;

    document.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".offer-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    panel.classList.add("active");
  }

  function run() {
    activate();
    // Re-apply once more in case other code resets the tab right after load
    setTimeout(activate, 300);

    const section = document.querySelector(".offer");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (document.readyState === "complete") {
    setTimeout(run, 0);
  } else {
    window.addEventListener("load", () => setTimeout(run, 0));
  }
})();