// script/config.js
// API Configuration
//       const API_BASE_URL = 'http://127.0.0.1:8000';

// When you deploy to production, change to:
const API_BASE_URL = 'https://pihub-backend.onrender.com';

// ============================================================
// API ENDPOINTS (course registration, referral codes, payment status)
// ============================================================
const API_ENDPOINTS = {
  // GET - list of courses (id, title, slug, price, status, ...)
  COURSES: `${API_BASE_URL}/api/courses/`,

  // POST - { course_id, full_name, email, phone, payment_option, referral_code }
  COURSE_REGISTER: `${API_BASE_URL}/api/courses/register/`,

  // POST - { code, course_id }
  REFERRAL_VALIDATE: `${API_BASE_URL}/api/referrals/validate/`,

  // GET - ?reference=<paystack reference>
  //   -> { status: "paid" | "pending" | "cancelled", course_title, final_price }
  //
  // IMPORTANT: THIS URL IS NOT CONFIRMED YET. The backend team is still adding
  // this public endpoint. Confirm the exact path with the backend before going
  // live, then update it here. It is the only place the URL is defined.
  // Call it as: PAYMENT_STATUS + '?reference=' + encodeURIComponent(reference)
  PAYMENT_STATUS: `${API_BASE_URL}/api/referrals/payment-status/`
};