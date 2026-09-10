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
// READ ARTICLE API INTEGRATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const readDate = document.getElementById('readDate');
  const readTopic = document.getElementById('readTopic');
  const readImage = document.getElementById('readImage');
  const readArticleContent = document.getElementById('readArticleContent');
  const readAuthor = document.getElementById('readAuthor');

  console.log('🔍 Slug from URL:', slug);

  if (slug) {
    fetchPostBySlug(slug);
  } else {
    const storedArticle = localStorage.getItem("currentArticle");
    if (storedArticle) {
      const articleData = JSON.parse(storedArticle);
      if (readDate) readDate.textContent = articleData.date;
      if (readTopic) readTopic.textContent = articleData.title;
      if (readImage) readImage.src = articleData.imgSrc;
      if (readAuthor) readAuthor.textContent = `By ${articleData.author}`;
      if (readArticleContent) {
        readArticleContent.innerHTML = `
          <div class="scroll-reveal" style="line-height: 1.8; font-size: 1.1rem;">
            ${articleData.fullContent || articleData.description}
          </div>
        `;
      }
    } else {
      if (readArticleContent) {
        readArticleContent.innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">Article not found. No slug in URL and no article in localStorage.</p>';
      }
    }
  }

  async function fetchPostBySlug(slug) {
    const apiUrl = `${API_BASE_URL}/api/blog/posts/${slug}/`;
    console.log('🔄 Fetching from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const post = await response.json();
      console.log('✅ Received post:', post);
      
      const date = new Date(post.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const authorName = post.author ? 
        (post.author.username || post.author.first_name || 'PIHUB Author') 
        : 'PIHUB';
      
      let imageUrl = 'src/image/heroImage.jpg';
      if (post.featured_image) {
        if (post.featured_image.startsWith('http')) {
          imageUrl = post.featured_image;
        } else {
          imageUrl = `${API_BASE_URL}${post.featured_image}`;
        }
      }

      if (readDate) readDate.textContent = date;
      if (readTopic) readTopic.textContent = post.title;
      if (readImage) readImage.src = imageUrl;
      if (readAuthor) readAuthor.textContent = `By ${authorName}`;
      
      if (readArticleContent) {
        readArticleContent.innerHTML = `
          <div class="author-info scroll-reveal" style="font-weight: bold; margin-bottom: 15px; color: #fa7001">
            By ${authorName}
          </div>
          <div class="scroll-reveal" style="line-height: 1.8; font-size: 1.1rem;">
            ${post.content}
          </div>
        `;
        
        setTimeout(() => {
          const newRevealElements = readArticleContent.querySelectorAll('.scroll-reveal');
          newRevealElements.forEach((el) => {
            el.classList.add('show');
          });
        }, 50);
      }

    } catch (error) {
      console.error('❌ Error fetching blog post:', error);
      console.error(' This could mean:');
      console.error('   1. Django server is not running');
      console.error('   2. The slug "' + slug + '" does not exist in database');
      console.error('   3. CORS is blocking the request');
      console.error('   4. API endpoint is wrong');
      
      if (readArticleContent) {
        readArticleContent.innerHTML = `
          <div style="text-align:center; padding: 40px; color: #666;">
            <p style="color: red; font-weight: bold;">Failed to load article</p>
            <p>Error: ${error.message}</p>
            <p>Slug: ${slug}</p>
            <p>API URL: ${apiUrl}</p>
            <p style="margin-top: 20px;">Check the console for more details.</p>
          </div>
        `;
      }
    }
  }
});

console.log('Read page animations and API integration fully initialized!');