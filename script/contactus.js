// Wait for the entire HTML document to be fully loaded before running any JS
document.addEventListener('DOMContentLoaded', () => {

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
        if (!link.getAttribute("href")) {
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

  document.querySelectorAll('.contact1, .contact2').forEach(el => {
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
  const contactFormInputs = document.querySelectorAll('.contact2 input, .contact2 textarea, .contact2 select');
  contactFormInputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });

  // ============================================================
  // CONTACT FORM - Submit Handler (API INTEGRATION)
  // ============================================================
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Gather data using IDs
      const firstName = document.getElementById('fname')?.value.trim() || '';
      const lastName = document.getElementById('lname')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const phone = document.getElementById('phone')?.value.trim() || '';
      
      // ✅ FIX: Explicitly grab the select value
      const serviceTypeSelect = document.getElementById('service_type');
      const serviceType = serviceTypeSelect ? serviceTypeSelect.value : 'General Enquiry';
      
      const subject = document.getElementById('subject')?.value.trim() || '';
      const message = document.getElementById('message')?.value.trim() || '';

      // Basic validation
      if (!firstName || !lastName || !email || !subject || !message) {
        alert('️ Please fill in all required fields.');
        return;
      }

      if (!email.includes('@')) {
        alert('⚠️ Please enter a valid email address.');
        return;
      }

      // Combine first and last name to match the backend serializer's 'name' field
      const fullName = `${firstName} ${lastName}`.trim();

      // DEBUG: Log what we're sending
      console.log(' Sending enquiry:', {
        name: fullName,
        email: email,
        phone: phone,
        service_type: serviceType,
        subject: subject,
        message: message
      });

      // Show loading state
      const originalText = sendMessageBtn.textContent || sendMessageBtn.innerText;
      sendMessageBtn.textContent = 'Sending...';
      sendMessageBtn.disabled = true;

      try {
        // ✅ FIX: Send ALL required fields including phone and service_type
        const response = await fetch(`${API_BASE_URL}/api/core/enquiries/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
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
        console.log('📥 Backend response:', response.status, result);

        if (response.ok) {
          alert(`✅ Thanks ${firstName}! Your message has been received. We'll get back to you shortly.`);
          
          // Clear inputs manually
          if (document.getElementById('fname')) document.getElementById('fname').value = '';
          if (document.getElementById('lname')) document.getElementById('lname').value = '';
          if (document.getElementById('email')) document.getElementById('email').value = '';
          if (document.getElementById('phone')) document.getElementById('phone').value = '';
          if (document.getElementById('service_type')) document.getElementById('service_type').value = 'General Enquiry';
          if (document.getElementById('subject')) document.getElementById('subject').value = '';
          if (document.getElementById('message')) document.getElementById('message').value = '';
        } else {
          // Handle backend validation errors
          let errorMsg = 'Failed to send message. Please try again.';
          if (result.name) errorMsg = result.name[0];
          else if (result.email) errorMsg = result.email[0];
          else if (result.phone) errorMsg = result.phone[0];
          else if (result.service_type) errorMsg = result.service_type[0];
          else if (result.subject) errorMsg = result.subject[0];
          else if (result.message) errorMsg = result.message[0];
          else if (result.detail) errorMsg = result.detail;
          else if (result.non_field_errors) errorMsg = result.non_field_errors[0];
          
          alert(`❌ Error: ${errorMsg}`);
        }
      } catch (error) {
        console.error('❌ Contact form submission error:', error);
        alert('❌ An error occurred. Please check your internet connection and try again.');
      } finally {
        // Reset button state
        sendMessageBtn.textContent = originalText;
        sendMessageBtn.disabled = false;
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

  console.log('🚀 Contact page animations fully initialized!');
});