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
// SCROLL REVEAL
// ============================================================
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

document.querySelectorAll(".scroll-reveal").forEach((el) => revealObserver.observe(el));

// ============================================================
// FOOTER & COPYRIGHT ANIMATIONS
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
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.footer > div').forEach((el) => {
  footerObserver.observe(el);
});

const copyrightElement = document.querySelector('.copyright');
if (copyrightElement) {
  const copyrightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        copyrightObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  copyrightObserver.observe(copyrightElement);
}

// ============================================================
// NEWSLETTER SUBSCRIPTION API INTEGRATION
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

function initSubscribeForm() {
  const subscribeForm = document.querySelector('.subscribeForm');
  if (!subscribeForm) return;
  
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = subscribeForm.querySelector('input[name="email"]') || subscribeForm.querySelector('input[type="email"]');
    const submitButton = subscribeForm.querySelector('button[type="submit"]');
    const email = emailInput ? emailInput.value.trim() : '';
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showSubscribeMessage('Please enter a valid email address.', 'error');
      return;
    }

    const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
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
        subscribeForm.reset();
      } else {
        const errorMsg = data.email ? data.email[0] : (data.detail || 'Failed to subscribe. Please try again.');
        showSubscribeMessage(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showSubscribeMessage('A network error occurred. Please try again later.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

// ============================================================
// READ ARTICLE API INTEGRATION
// ============================================================
function decodeAndRenderHTML(htmlString) {
  const txt = document.createElement("textarea");
  txt.innerHTML = htmlString;
  return txt.value;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize subscribe form handler
  initSubscribeForm();

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const readDate = document.getElementById('readDate');
  const readTopic = document.getElementById('readTopic');
  const readImage = document.getElementById('readImage');
  const readAuthor = document.getElementById('readAuthor');
  const articleBody = document.querySelector('.article-body');
  const categoryElement = document.querySelector('.category');
  const alsoReadLink = document.querySelector('.alsoRead a');

  // 🎯 AUTO-ACTIVATE BLOG NAV LINK ON READ PAGE
  const blogLinks = document.querySelectorAll('nav .links a[href="blog.html"], .mobileMenu a[href="blog.html"]');
  blogLinks.forEach(link => {
    link.classList.add('active');
  });

  if (slug) {
    fetchPostBySlug(slug);
  } else {
    const storedArticle = localStorage.getItem("currentArticle");
    if (storedArticle) {
      loadArticleData(JSON.parse(storedArticle));
    } else {
      if (articleBody) {
        articleBody.innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">Article not found.</p>';
      }
    }
  }

  async function fetchPostBySlug(slug) {
    const apiUrl = `${API_BASE_URL}/api/blog/posts/${slug}/`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const post = await response.json();
      
      const articleData = {
        date: new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        title: post.title,
        author: post.author ? (post.author.username || post.author.first_name || 'PIHUB Author') : 'PIHUB',
        content: post.content,
        category: post.category ? post.category.name : 'Uncategorized',
        categoryId: post.category ? post.category.id : null,
        imgSrc: post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : `${API_BASE_URL}${post.featured_image}`) : 'src/image/heroImage.jpg'
      };
      
      loadArticleData(articleData);
      loadRelatedPost(articleData.categoryId, slug);

    } catch (error) {
      console.error('❌ Error fetching blog post:', error);
      if (articleBody) {
        articleBody.innerHTML = `
          <div style="text-align:center; padding: 40px; color: #666;">
            <p style="color: red; font-weight: bold; margin-bottom: 10px;">Failed to load article</p>
            <p>Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  async function loadRelatedPost(categoryId, currentSlug) {
    if (!alsoReadLink) return;
    
    try {
      const allPostsUrl = `${API_BASE_URL}/api/blog/posts/`;
      const response = await fetch(allPostsUrl);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      const allPosts = data.results || data || [];
      
      let relatedPosts = allPosts.filter(post => post.slug !== currentSlug);
      
      if (categoryId) {
        const sameCategoryPosts = relatedPosts.filter(post => 
          post.category && post.category.id === categoryId
        );
        if (sameCategoryPosts.length > 0) {
          relatedPosts = sameCategoryPosts;
        }
      }
      
      if (relatedPosts.length > 0) {
        const randomPost = relatedPosts[Math.floor(Math.random() * relatedPosts.length)];
        alsoReadLink.textContent = randomPost.title;
        alsoReadLink.href = `read.html?slug=${randomPost.slug}`;
        alsoReadLink.style.display = 'block';
      } else {
        const alsoReadSection = document.querySelector('.alsoRead');
        if (alsoReadSection) {
          alsoReadSection.style.display = 'none';
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading related post:', error);
      const alsoReadSection = document.querySelector('.alsoRead');
      if (alsoReadSection) {
        alsoReadSection.style.display = 'none';
      }
    }
  }

  function loadArticleData(articleData) {
    if (readDate) readDate.textContent = articleData.date;
    if (readTopic) readTopic.textContent = articleData.title;
    if (readImage) readImage.src = articleData.imgSrc;
    if (readAuthor) readAuthor.textContent = `By ${articleData.author}`;
    if (categoryElement) categoryElement.textContent = articleData.category;
    
    if (articleBody && articleData.content) {
      const hardcodedParagraphs = articleBody.querySelectorAll('p.scroll-reveal');
      hardcodedParagraphs.forEach(p => p.remove());
      
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'article-content';
      
      const safeHTML = decodeAndRenderHTML(articleData.content);
      contentWrapper.innerHTML = safeHTML;
      
      const brTags = contentWrapper.querySelectorAll('br');
      brTags.forEach(br => {
        if (br.nextSibling && br.nextSibling.nodeName === 'BR') {
          br.remove();
        }
      });
      
      const allElements = contentWrapper.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.nodeName === 'P' && el.innerHTML.trim() === '') {
          el.remove();
        }
      });

      Array.from(contentWrapper.children).forEach((child, index) => {
        child.classList.add('scroll-reveal');
        child.style.animationDelay = `${index * 0.05}s`;
        revealObserver.observe(child);
      });
      
      const authorInfo = articleBody.querySelector('.author-info');
      if (authorInfo) {
        authorInfo.insertAdjacentElement('afterend', contentWrapper);
      } else {
        articleBody.prepend(contentWrapper);
      }
    }
    
    document.title = `${articleData.title} - PIHUB`;
  }
});

console.log('Read page animations and API integration fully initialized!');