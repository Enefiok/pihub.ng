// ============================================================
// MOBILE MENU
// ============================================================

const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
  mobileMenu.classList.add("open");
  menuOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileMenu.classList.remove("open");
  menuOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!link.getAttribute("href")) {
      event.preventDefault();
    }
    closeMenu();
  });
});

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
  { threshold: 0.15 },
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
// SUBSCRIBE SECTION ANIMATION & API Integration
// ============================================================

const subscribeElement = document.querySelector('.subscribe > div');
const newsletterEmail = document.getElementById('newsletter-email');
const newsletterBtn = document.getElementById('newsletter-btn');

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

// Newsletter Subscription Handler
if (newsletterBtn && newsletterEmail) {
  newsletterBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    const originalText = newsletterBtn.textContent;
    newsletterBtn.textContent = 'Subscribing...';
    newsletterBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/core/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const result = await response.json();
      if (response.ok) {
        alert('Successfully subscribed to our newsletter!');
        newsletterEmail.value = '';
      } else {
        alert(result.error || result.message || 'Failed to subscribe. This email might already be subscribed.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      newsletterBtn.textContent = originalText;
      newsletterBtn.disabled = false;
    }
  });
}

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
    console.error('❌ Blog container not found! Cannot render posts.');
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
      <div class="scroll-reveal article-card" data-category="${categoryName}">
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
    (card) => !card.classList.contains("hidden")
  );

  const limit = getCurrentLimit();
  const needsButton = visibleCards.length > limit;

  visibleCards.forEach((card, index) => {
    const overLimit = !seeMoreExpanded && index >= limit;
    card.classList.toggle("overLimit", overLimit);
  });

  seeMoreBtn.classList.toggle("visible", needsButton);
  seeMoreBtn.textContent = seeMoreExpanded ? "See Less" : "See More";
  seeMoreBtn.setAttribute("aria-expanded", seeMoreExpanded);

  if (!needsButton) {
    seeMoreExpanded = false;
  }
}

seeMoreBtn.addEventListener("click", () => {
  seeMoreExpanded = !seeMoreExpanded;
  applySeeMoreLimit();

  if (!seeMoreExpanded) {
    document.querySelector(".blogArticles").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});

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