// ============================================================
// SHARED NAVIGATION LOGIC FOR ALL PAGES
// ============================================================

// True on offer.html and also on hosts that serve it without the extension (/offer)
const IS_OFFER_PAGE = /(^|\/)offer(\.html)?\/?$/i.test(window.location.pathname);

// ============================================================
// MOBILE MENU (shared across all pages)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  function openMenu() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }
});

// ============================================================
// HANDLE SERVICE LINKS FROM FOOTER (Works on all pages)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // Get all service links in the footer
  const serviceLinks = document.querySelectorAll('.footer a[href*="offer.html#"], .footer a[href^="#"]');
  
  serviceLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Get the target panel from href
      const href = this.getAttribute('href');
      let panelId = null;
      
      // Check if it's a hash link on the same page
      if (href.startsWith('#')) {
        panelId = href.replace('#', '');
        e.preventDefault(); // Prevent default hash navigation
      } 
      // Check if it's a link to offer.html with a hash
      else if (href.includes('offer.html#')) {
        panelId = href.split('#')[1];
        // Let the link navigate normally to offer.html
        // The offer page will handle the hash
        return;
      }
      
      // If we're on the offer page and it's a hash link
      if (panelId && IS_OFFER_PAGE) {
        e.preventDefault();
        
        // Switch to the panel
        if (typeof switchToPanel === 'function') {
          switchToPanel(panelId);
          
          // Update URL
          history.pushState(null, '', `#${panelId}`);
          
          // Scroll to offer section
          const offerSection = document.querySelector('.offer');
          if (offerSection) {
            const top = offerSection.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top, behavior: 'smooth' });
          }
          
          // Re-initialize observers
          setTimeout(() => {
            if (panelId === 'workspace' && typeof initWorkspaceObservers === 'function') {
              initWorkspaceObservers();
            } else if (typeof initPanelObservers === 'function') {
              // Re-observe the panel
              const panel = document.querySelector(`.offer-panel[data-panel="${panelId}"]`);
              if (panel) {
                panel.classList.remove('visible');
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      panel.classList.add('visible');
                      observer.unobserve(entry.target);
                    }
                  });
                }, { threshold: 0.1 });
                observer.observe(panel);
              }
            }
          }, 100);
        }
      }
    });
  });
});

// ============================================================
// HANDLE HASH ON PAGE LOAD (For offer.html)
// Used by the "Register Now" button on the home page (offer.html#courses).
// The browser cannot scroll to #courses by itself (the panels use data-panel,
// not ids), so this scrolls to the offer section below the fixed header.
// ============================================================
if (IS_OFFER_PAGE) {
  // Wait for DOM and panels to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check for hash in URL
    const hash = window.location.hash.replace('#', '');
    
    // Valid panel IDs
    const validPanels = ['workspace', 'privateRoom', 'conferenceRoom', 'podcast', 'courses'];
    
    if (hash && validPanels.includes(hash)) {
      // Small delay to ensure panels are initialized
      setTimeout(() => {
        if (typeof switchToPanel === 'function') {
          // offer.js already switches to the hash panel on load; only switch
          // here if that did not happen, so animations are not reset twice
          const targetPanel = document.querySelector(`.offer-panel[data-panel="${hash}"]`);
          if (!targetPanel || !targetPanel.classList.contains('active')) {
            switchToPanel(hash);
          }
          
          // Scroll to offer section
          const offerSection = document.querySelector('.offer');
          if (offerSection) {
            const top = offerSection.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      }, 500);
    }
  });
}

// ============================================================
// HANDLE HASH CHANGE (For offer.html)
// ============================================================
if (IS_OFFER_PAGE) {
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.replace('#', '');
    const validPanels = ['workspace', 'privateRoom', 'conferenceRoom', 'podcast', 'courses'];
    
    if (hash && validPanels.includes(hash) && typeof switchToPanel === 'function') {
      switchToPanel(hash);
      
      // Re-initialize observers
      setTimeout(() => {
        if (hash === 'workspace' && typeof initWorkspaceObservers === 'function') {
          initWorkspaceObservers();
        }
      }, 100);
    }
  });
}

// ============================================================
// HANDLE CROSS-PAGE NAVIGATION WITH TARGET PANEL
// ============================================================
// Store target panel in localStorage when clicking from other pages
document.addEventListener('DOMContentLoaded', function() {
  // If we're not on offer page, handle service link clicks
  if (!IS_OFFER_PAGE) {
    const serviceLinks = document.querySelectorAll('.footer a[href*="offer.html#"]');
    
    serviceLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const panelId = href.split('#')[1];
        
        if (panelId) {
          // Store the target panel in localStorage
          localStorage.setItem('targetPanel', panelId);
          // The link will navigate normally to offer.html
        }
      });
    });
  }
});

console.log('Navigation logic initialized!');