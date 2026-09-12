// ============================================================
// MOBILE MENU
// ============================================================

const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

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
// SCROLL REVEAL
// ============================================================

const scrollRevealElements = document.querySelectorAll(".scroll-reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

scrollRevealElements.forEach((el) => revealObserver.observe(el));

// ============================================================
// OUR ARTICLES - Separate observer for heading
// ============================================================

const ourArticles = document.querySelector(".ourArticles");
if (ourArticles) {
  const headingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          headingObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  headingObserver.observe(ourArticles);
}

// ============================================================
// SUBSCRIBE SECTION ANIMATION & IMPROVED API INTEGRATION
// ============================================================

const subscribeElement = document.querySelector('.subscribe > div') || document.querySelector('.subscribeBox');

if (subscribeElement) {
  const subscribeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        subscribeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -30px 0px'
  });
  subscribeObserver.observe(subscribeElement);
}

// --- IMPROVED NEWSLETTER SUBSCRIPTION HANDLER (No alerts, no container expansion) ---

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
  const box = document.querySelector('.subscribeBox') || document.querySelector('.subscribe > div');
  if (!box) return;

  // Ensure the container is relatively positioned so the message anchors to it
  box.style.position = 'relative';

  const existingMsg = document.querySelector('.subscribe-message');
  if (existingMsg) existingMsg.remove();

  const msgDiv = document.createElement('div');
  msgDiv.className = `subscribe-message ${type}`;
  msgDiv.textContent = message;
  
  // Absolute positioning prevents the container from expanding or shifting layout
  msgDiv.style.position = 'absolute';
  msgDiv.style.bottom = '-30px'; // Floats just below the box
  msgDiv.style.left = '50%';
  msgDiv.style.transform = 'translateX(-50%)';
  msgDiv.style.width = '100%';
  msgDiv.style.fontSize = '13px';
  msgDiv.style.fontWeight = '500';
  msgDiv.style.color = type === 'success' ? '#22c55e' : '#ef4444'; 
  msgDiv.style.textAlign = 'center';
  msgDiv.style.whiteSpace = 'nowrap'; // Prevents text wrapping from affecting layout
  msgDiv.style.zIndex = '10';
  msgDiv.style.pointerEvents = 'none'; // Allows clicking through the message if it overlaps anything

  box.appendChild(msgDiv);

  // Auto-remove with a smooth fade-out
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
  // Try to find the form by class first, then fallback to specific IDs if they exist
  const form = document.querySelector('.subscribeForm') || 
               (document.getElementById('newsletter-email') ? document.getElementById('newsletter-email').closest('form') : null);
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = form.querySelector('input[type="email"]') || form.querySelector('input') || document.getElementById('newsletter-email');
    const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('button') || document.getElementById('newsletter-btn');
    const email = emailInput ? emailInput.value.trim() : '';
    
    if (!email || !email.includes('@')) {
      showSubscribeMessage('Please enter a valid email address.', 'error');
      return;
    }

    const originalText = submitButton ? submitButton.textContent : 'Submit';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Subscribing...';
    }

    try {
      const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
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
        if (emailInput) emailInput.value = ''; // Clear input on success
      } else {
        const errorMsg = data.email ? data.email[0] : (data.detail || data.error || data.message || 'Failed to subscribe. Please try again.');
        showSubscribeMessage(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showSubscribeMessage('A network error occurred. Please try again later.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

// Initialize subscription form handler
initSubscribeForm();


// ============================================================
// FOOTER ANIMATIONS
// ============================================================

const footerObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('show');
      }, index * 100);
      footerObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.footer > div').forEach((el) => {
  footerObserver.observe(el);
});

// ============================================================
// COPYRIGHT ANIMATION
// ============================================================

const copyrightElement = document.querySelector('.copyright');

if (copyrightElement) {
  const copyrightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        copyrightObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px 0px 0px'
  });

  copyrightObserver.observe(copyrightElement);

  const forceCheck = () => {
    const rect = copyrightElement.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      copyrightElement.classList.add('show');
      copyrightObserver.unobserve(copyrightElement);
    }
  };
  
  forceCheck();
  window.addEventListener('scroll', forceCheck, { passive: true });
}

// ============================================================
// BLOG API INTEGRATION
// ============================================================

let allBlogPosts = [];
const blogContainer = document.getElementById('blog-articles-container') || document.querySelector('.blogArticles');
const categoriesContainer = document.getElementById('blog-categories') || document.querySelector('.blogCategories');
const FILTER_TRANSITION_MS = 300;

console.log('🔍 Blog Container found:', !!blogContainer);
console.log('🔍 Categories Container found:', !!categoriesContainer);

// Fetch Blog Posts from API
async function fetchBlogPosts() {
  try {
    console.log('🔄 Fetching from:', `${API_BASE_URL}/api/blog/posts/`);
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    allBlogPosts = data.results || data;
    
    console.log('✅ Fetched', allBlogPosts.length, 'blog posts');
    
    const categories = [...new Set(allBlogPosts.map(post => {
      const catName = (post.category && post.category.name) ? post.category.name : 'Uncategorized';
      return String(catName).toLowerCase();
    }))];
    
    console.log('🏷️ Found categories:', categories);
    
    renderCategories(categories);
    renderBlogPosts(allBlogPosts);
    
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
  }
}

// Render Category Buttons
function renderCategories(categories) {
  if (!categoriesContainer) {
    console.warn('⚠️ Categories container not found, skipping category render.');
    return;
  }

  const allButton = categoriesContainer.querySelector('[data-category="all"]');
  categoriesContainer.innerHTML = '';
  if (allButton) {
    categoriesContainer.appendChild(allButton);
  }
  
  categories.forEach(category => {
    const btn = document.createElement('div');
    btn.className = 'category-btn';
    btn.dataset.category = category;
    btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoriesContainer.appendChild(btn);
  });
  
  attachCategoryListeners();
}

// Render Blog Posts
function renderBlogPosts(posts) {
  if (!blogContainer) {
    console.error(' Blog container not found! Cannot render posts.');
    return;
  }

  if (!posts || posts.length === 0) {
    blogContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">No blog posts available yet.</p>';
    return;
  }
  
  console.log('🎨 Rendering', posts.length, 'posts to DOM...');
  
  const htmlContent = posts.map(post => {
    const date = new Date(post.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const authorName = post.author ? 
      (post.author.username || post.author.first_name || 'PIHUB Author') 
      : 'PIHUB';
    
    const categoryName = (post.category && post.category.name) ? 
      String(post.category.name).toLowerCase() 
      : 'uncategorized';
    
    let imageUrl = 'src/image/heroImage.jpg';
    if (post.featured_image) {
      if (post.featured_image.startsWith('http')) {
        imageUrl = post.featured_image;
      } else {
        imageUrl = `${API_BASE_URL}${post.featured_image}`;
      }
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const excerpt = tempDiv.textContent.substring(0, 120) + '...';
    
    return `
      <div class="scroll-reveal article-card" data-category="${categoryName}" data-title="${post.title.toLowerCase()}" data-author="${authorName.toLowerCase()}" data-content="${post.content.toLowerCase()}">
        <span><img src="${imageUrl}" alt="${post.title}" onerror="this.src='src/image/heroImage.jpg'" /></span>
        <span class="card-title">${post.title}</span>
        <span class="card-desc">${excerpt}</span>
        <span class="card-meta">
          <p class="author">${authorName}</p>
          <p>-</p>
          <p class="date">${date}</p>
        </span>
      </div>
    `;
  }).join('');
  
  console.log('✅ Injecting HTML into container...');
  blogContainer.innerHTML = htmlContent;
  
  setTimeout(() => {
    const newRevealElements = blogContainer.querySelectorAll('.scroll-reveal');
    newRevealElements.forEach((el) => {
      el.classList.add('show');
      revealObserver.observe(el);
    });
    console.log('✅ Re-observed', newRevealElements.length, 'new scroll-reveal elements');
  }, 50);
  
  console.log('✅ Render complete!');
}

// Attach Category Filter Listeners
function attachCategoryListeners() {
  const categoryBtns = document.querySelectorAll(".category-btn");
  
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.category;

      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      filterBlogPosts(selected);
    });
  });
}

// Filter Blog Posts
function filterBlogPosts(category) {
  const articleCards = document.querySelectorAll(".article-card");
  const toHide = [];
  const toShow = [];

  articleCards.forEach((card) => {
    const matches = category === "all" || card.dataset.category === category;
    const isCurrentlyVisible = !card.classList.contains("hidden");

    if (matches && !isCurrentlyVisible) {
      toShow.push(card);
    } else if (!matches && isCurrentlyVisible) {
      toHide.push(card);
    }
  });

  toHide.forEach((card) => card.classList.add("hiding"));

  setTimeout(() => {
    toHide.forEach((card) => {
      card.classList.add("hidden");
      card.classList.remove("hiding");
    });

    toShow.forEach((card) => {
      card.classList.remove("hidden");
      card.classList.add("entering");
    });

    void document.body.offsetHeight;

    toShow.forEach((card) => card.classList.add("show-in"));

    setTimeout(() => {
      toShow.forEach((card) => {
        card.classList.remove("entering", "show-in");
      });
    }, FILTER_TRANSITION_MS);
  }, FILTER_TRANSITION_MS);
  
  applySeeMoreLimit();
}

// ============================================================
// SEARCH FUNCTIONALITY - NEW!
// ============================================================

const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') || 
                    document.querySelector('input[placeholder*="search" i]') ||
                    document.getElementById('searchInput');

if (searchInput) {
  console.log('🔍 Search input found, initializing search functionality...');
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Debounce search - wait 300ms after user stops typing
    searchTimeout = setTimeout(() => {
      console.log('🔍 Searching for:', searchTerm);
      
      if (!searchTerm) {
        // If search is empty, show all posts
        const articleCards = document.querySelectorAll(".article-card");
        articleCards.forEach(card => {
          card.classList.remove("hidden");
          card.style.display = "";
        });
        applySeeMoreLimit();
        return;
      }
      
      const articleCards = document.querySelectorAll(".article-card");
      let visibleCount = 0;
      
      articleCards.forEach((card) => {
        const title = card.dataset.title || '';
        const author = card.dataset.author || '';
        const content = card.dataset.content || '';
        const cardDesc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
        
        // Search in title, author, content, and description
        const matchesSearch = title.includes(searchTerm) || 
                             author.includes(searchTerm) || 
                             content.includes(searchTerm) ||
                             cardDesc.includes(searchTerm);
        
        if (matchesSearch) {
          card.classList.remove("hidden");
          card.style.display = "";
          visibleCount++;
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      });
      
      console.log(`📊 Search results: ${visibleCount} articles found`);
      
      // Show message if no results
      if (visibleCount === 0) {
        const existingNoResults = blogContainer.querySelector('.no-results-message');
        if (!existingNoResults) {
          const noResultsMsg = document.createElement('p');
          noResultsMsg.className = 'no-results-message';
          noResultsMsg.style.cssText = 'text-align:center; padding: 40px; color: #666; grid-column: 1/-1;';
          noResultsMsg.textContent = `No articles found matching "${e.target.value}"`;
          blogContainer.appendChild(noResultsMsg);
        }
      } else {
        const existingNoResults = blogContainer.querySelector('.no-results-message');
        if (existingNoResults) {
          existingNoResults.remove();
        }
      }
      
      applySeeMoreLimit();
    }, 300);
  });
} else {
  console.warn('⚠️ Search input not found. Make sure your search input has placeholder="Search articles..."');
}

// ============================================================
// SEE MORE / SEE LESS — blog articles
// ============================================================

const seeMoreBtn = document.getElementById("blogSeeMoreBtn");
const SMALL_SCREEN_LIMIT = 3;
const LARGE_SCREEN_LIMIT = 20;
const SMALL_SCREEN_BREAKPOINT = 767;

let seeMoreExpanded = false;

function getCurrentLimit() {
  return window.innerWidth <= SMALL_SCREEN_BREAKPOINT
    ? SMALL_SCREEN_LIMIT
    : LARGE_SCREEN_LIMIT;
}

function applySeeMoreLimit() {
  const articleCards = document.querySelectorAll(".article-card");
  const visibleCards = Array.from(articleCards).filter(
    (card) => !card.classList.contains("hidden") && card.style.display !== "none"
  );

  const limit = getCurrentLimit();
  const needsButton = visibleCards.length > limit;

  visibleCards.forEach((card, index) => {
    const overLimit = !seeMoreExpanded && index >= limit;
    card.classList.toggle("overLimit", overLimit);
  });

  if (seeMoreBtn) {
    seeMoreBtn.classList.toggle("visible", needsButton);
    seeMoreBtn.textContent = seeMoreExpanded ? "See Less" : "See More";
    seeMoreBtn.setAttribute("aria-expanded", seeMoreExpanded);
  }

  if (!needsButton) {
    seeMoreExpanded = false;
  }
}

if (seeMoreBtn) {
  seeMoreBtn.addEventListener("click", () => {
    seeMoreExpanded = !seeMoreExpanded;
    applySeeMoreLimit();

    if (!seeMoreExpanded) {
      const blogArticles = document.querySelector(".blogArticles");
      if (blogArticles) {
        blogArticles.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
}

window.addEventListener("resize", () => {
  applySeeMoreLimit();
});

// ============================================================
// BLOG ARTICLE CLICK & REDIRECT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  fetchBlogPosts();
  
  setTimeout(() => {
    applySeeMoreLimit();
  }, 500);
  
  const handleArticleClick = (e) => {
    const card = e.target.closest('.article-card');
    if (!card) return;
    
    const title = card.querySelector(".card-title");
    if (!title) return;

    const postTitle = title.textContent;
    // Find the full post data to get the slug and full content
    const fullPost = allBlogPosts.find(post => post.title === postTitle);
    
    if (fullPost && fullPost.slug) {
      // ✅ Cleanest method: Redirect with slug in URL
      window.location.href = `read.html?slug=${fullPost.slug}`;
    } else {
      // Fallback to localStorage if slug is missing
      const img = card.querySelector("img");
      const desc = card.querySelector(".card-desc");
      const author = card.querySelector(".author");
      const date = card.querySelector(".date");
      
      const articleData = {
        imgSrc: img ? img.src : 'src/image/heroImage.jpg',
        title: postTitle,
        description: desc ? desc.textContent : '',
        fullContent: fullPost ? fullPost.content : (desc ? desc.textContent : ''),
        author: author ? author.textContent : 'PIHUB',
        date: date ? date.textContent : ''
      };

      localStorage.setItem("currentArticle", JSON.stringify(articleData));
      window.location.href = "read.html";
    }
  };
  
  if (blogContainer) {
    blogContainer.addEventListener('click', handleArticleClick);
  }
});

console.log('Blog page animations and API integration fully initialized!');