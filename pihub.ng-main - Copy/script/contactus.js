// Wait for the entire HTML document to be fully loaded before running any JS
document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // HELPER: Get CSRF Token for Django
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

  // ============================================================
  // HELPER: Clean Floating Messages (Matching index.js style)
  // ============================================================
  function showContactMessage(message, type) {
    const formContainer = document.querySelector('.contact-form-card');
    if (!formContainer) return;

    formContainer.style.position = 'relative';

    const existingMsg = formContainer.querySelector('.contact-message');
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `contact-message ${type}`;
    msgDiv.textContent = message;
    
    msgDiv.style.position = 'absolute';
    msgDiv.style.top = '-50px'; 
    msgDiv.style.left = '50%';
    msgDiv.style.transform = 'translateX(-50%)';
    msgDiv.style.width = '100%';
    msgDiv.style.fontSize = '14px';
    msgDiv.style.fontWeight = '500';
    msgDiv.style.color = type === 'success' ? '#22c55e' : '#ef4444'; 
    msgDiv.style.textAlign = 'center';
    msgDiv.style.whiteSpace = 'nowrap';
    msgDiv.style.zIndex = '10';
    msgDiv.style.pointerEvents = 'none';
    msgDiv.style.opacity = '1';
    msgDiv.style.transition = 'opacity 0.4s ease';

    formContainer.appendChild(msgDiv);

    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.style.opacity = '0';
        setTimeout(() => {
          if (msgDiv.parentNode) msgDiv.remove();
        }, 400);
      }
    }, 4000);
  }

  function showSubscribeMessage(message, type) {
    const subscribeBox = document.querySelector('.subscribeBox');
    if (!subscribeBox) return;

    subscribeBox.style.position = 'relative';

    const existingMsg = subscribeBox.querySelector('.subscribe-message');
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `subscribe-message ${type}`;
    msgDiv.textContent = message;
    
    msgDiv.style.position = 'absolute';
    msgDiv.style.bottom = '-40px'; 
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
    msgDiv.style.opacity = '1';
    msgDiv.style.transition = 'opacity 0.4s ease';

    subscribeBox.appendChild(msgDiv);

    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.style.opacity = '0';
        setTimeout(() => {
          if (msgDiv.parentNode) msgDiv.remove();
        }, 400);
      }
    }, 4000);
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
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!link.getAttribute("href") || link.getAttribute("href") === "#") {
          event.preventDefault();
        }
        closeMenu();
      });
    });
  }

  // ============================================================
  // CONTACT CARDS - Scroll Reveal Observer
  // ============================================================
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        contactObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.contact-info-col, .contact-form-card').forEach(el => {
    el.classList.add('scroll-reveal');
    contactObserver.observe(el);
  });

  // ============================================================
  // FOOTER COLUMNS - Scroll Observer with Stagger
  // ============================================================
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        footerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.footer > div').forEach(el => {
    footerObserver.observe(el);
  });

  // ============================================================
  // COPYRIGHT - BULLETPROOF Scroll Observer
  // ============================================================
  const copyrightElement = document.querySelector('.copyright');

  if (copyrightElement) {
    const copyrightObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'show'); 
          copyrightObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px 50px 0px'
    });

    copyrightObserver.observe(copyrightElement);

    const forceCheck = () => {
      const rect = copyrightElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        copyrightElement.classList.add('visible', 'show');
        copyrightObserver.unobserve(copyrightElement);
      }
    };
    
    forceCheck();
    window.addEventListener('scroll', forceCheck, { passive: true });
    window.addEventListener('resize', forceCheck, { passive: true });
  }

  // ============================================================
  // CONTACT FORM - Input Focus Animation Enhancement
  // ============================================================
  const contactFormInputs = document.querySelectorAll('.contact-form-card input, .contact-form-card textarea, .contact-form-card select');
  contactFormInputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });

  // ============================================================
  // CONTACT FORM - BULLETPROOF SUBMIT HANDLER (API INTEGRATION)
  // ============================================================
  const contactForm = document.getElementById('contactFormTemplate');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  
  if (contactForm) {
    contactForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  async function handleFormSubmission(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const firstName = document.getElementById('fname')?.value.trim() || '';
    const lastName = document.getElementById('lname')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    
    const serviceTypeSelect = document.getElementById('service_type');
    const serviceType = serviceTypeSelect ? serviceTypeSelect.value : 'GENERAL'; 
    
    const subject = document.getElementById('subject')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!firstName || !lastName || !email || !subject || !message) {
      showContactMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!email.includes('@')) {
      showContactMessage('Please enter a valid email address.', 'error');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const originalText = sendMessageBtn ? (sendMessageBtn.textContent || sendMessageBtn.innerText) : 'Sending...';
    if (sendMessageBtn) {
      sendMessageBtn.textContent = 'Sending...';
      sendMessageBtn.disabled = true;
      sendMessageBtn.style.opacity = '0.7';
      sendMessageBtn.style.cursor = 'not-allowed';
    }

    try {
      const baseUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : '';
      
      const response = await fetch(`${baseUrl}/api/core/enquiries/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phone: phone,
          service_type: serviceType,
          subject: subject,
          message: message
        })
      });

      const result = await response.json();

      if (response.ok) {
        showContactMessage(`Thanks ${firstName}! We will get back to you shortly.`, 'success');
        if (contactForm) contactForm.reset();
        contactFormInputs.forEach(input => input.parentElement.classList.remove('focused'));
      } else {
        let errorMsg = 'Failed to send message. Please try again.';
        if (result.name) errorMsg = result.name[0];
        else if (result.email) errorMsg = result.email[0];
        else if (result.phone) errorMsg = result.phone[0];
        else if (result.service_type) errorMsg = result.service_type[0];
        else if (result.subject) errorMsg = result.subject[0];
        else if (result.message) errorMsg = result.message[0];
        else if (result.detail) errorMsg = result.detail;
        else if (result.non_field_errors) errorMsg = result.non_field_errors[0];
        
        showContactMessage(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      showContactMessage('A network error occurred. Please check your connection and try again.', 'error');
    } finally {
      if (sendMessageBtn) {
        sendMessageBtn.textContent = originalText;
        sendMessageBtn.disabled = false;
        sendMessageBtn.style.opacity = '1';
        sendMessageBtn.style.cursor = 'pointer';
      }
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmission, true);
  }
  
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', handleFormSubmission, true);
  }

  // ============================================================
  // SUBSCRIBE FORM HANDLER (PREVENTS PAGE RELOAD)
  // ============================================================
  const subscribeForm = document.querySelector('.subscribeForm');
  
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const emailInput = subscribeForm.querySelector('input[type="email"]');
      const email = emailInput?.value.trim() || '';
      const submitBtn = subscribeForm.querySelector('button[type="submit"]');
      
      if (!email || !email.includes('@')) {
        showSubscribeMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Subscribing...';
      if (submitBtn) {
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;
      }
      
      try {
        const baseUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : '';
        
        const response = await fetch(`${baseUrl}/api/core/subscribe/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') || ''
          },
          body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showSubscribeMessage('Successfully subscribed to our newsletter!', 'success');
          if (emailInput) emailInput.value = '';
        } else {
          let errorMsg = 'Failed to subscribe. Please try again.';
          if (result.email) errorMsg = result.email[0];
          else if (result.detail) errorMsg = result.detail;
          showSubscribeMessage(errorMsg, 'error');
        }
      } catch (error) {
        console.error('Subscribe error:', error);
        showSubscribeMessage('A network error occurred. Please try again later.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }

  // ============================================================
  // SMOOTH SCROLL BEHAVIOR - Enhanced
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbar = document.querySelector('nav');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // ACTIVE NAV LINK - Scroll Spy
  // ============================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav .links a, .mobileMenu a');

  window.addEventListener('scroll', () => {
    let current = '';
    const navbarHeight = document.querySelector('nav')?.offsetHeight || 80;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - navbarHeight - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ============================================================
  // NAVBAR SCROLL EFFECT - Add shadow on scroll
  // ============================================================
  const navbar = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (navbar) {
      if (currentScroll > 50) {
        navbar.style.boxShadow = '0px 4px 8px rgba(8, 8, 8, 0.9)';
      } else {
        navbar.style.boxShadow = '0px 2px 4px rgba(8, 8, 8, 0.8)';
      }
    }
    lastScroll = currentScroll;
  });

  console.log(' Contact page animations and API integration fully initialized!');
});