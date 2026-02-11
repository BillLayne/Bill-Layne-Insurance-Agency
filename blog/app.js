'use strict';

/**
 * Ethereal Blog - Dynamic Content Loader
 * Bill Layne Insurance Agency
 *
 * This script handles:
 * - Loading blog post data from local JSON
 * - Creating dynamic blog cards with smooth animations
 * - Multi-path fetch with retry & fallback
 * - Error handling and loading states
 * - Scroll-based animations
 * - Accessibility enhancements
 */

/**
 * Application State Management
 */
class EtherealBlog {
  constructor() {
    this.blogContainer = null;
    this.loadingState = null;
    this.errorState = null;
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup DOM references and start loading
   */
  setup() {
    this.blogContainer = document.getElementById('blog-grid');
    this.loadingState = document.getElementById('loading-state');
    this.errorState = document.getElementById('error-state');

    if (!this.blogContainer) {
      console.error('Blog container not found');
      return;
    }

    this.loadBlogs();
  }

  /**
   * Load blog data from JSON file with multiple path fallbacks
   */
  async loadBlogs() {
    try {
      this.showLoadingState();

      // Check if blog data was embedded in the page (bulletproof fallback)
      if (window.__BLOG_DATA__ && Array.isArray(window.__BLOG_DATA__) && window.__BLOG_DATA__.length > 0) {
        console.log('Loading blog data from embedded source');
        this.hideLoadingState();
        this.renderBlogs(window.__BLOG_DATA__);
        return;
      }

      // Try multiple fetch paths for maximum compatibility
      const fetchPaths = [
        './data/blogs.json',
        'data/blogs.json',
        '/blog/data/blogs.json',
        '../blog/data/blogs.json'
      ];

      let blogData = null;
      let lastError = null;

      for (const path of fetchPaths) {
        try {
          const cacheBust = `v=${Date.now()}`;
          const url = path + (path.includes('?') ? '&' : '?') + cacheBust;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${path}`);
          }

          const responseText = await response.text();
          const parsed = JSON.parse(responseText);

          if (Array.isArray(parsed) && parsed.length > 0) {
            blogData = parsed;
            console.log(`Blog data loaded from: ${path} (${parsed.length} posts)`);
            break;
          }
        } catch (fetchErr) {
          lastError = fetchErr;
          console.warn(`Fetch attempt failed for ${path}:`, fetchErr.message);
        }
      }

      if (!blogData) {
        throw lastError || new Error('All fetch paths failed');
      }

      this.hideLoadingState();
      this.renderBlogs(blogData);

    } catch (error) {
      console.error('Failed to load blogs:', error);
      this.showErrorState();
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    if (this.loadingState) {
      this.loadingState.classList.remove('hidden');
    }
    if (this.errorState) {
      this.errorState.classList.add('hidden');
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    if (this.loadingState) {
      this.loadingState.classList.add('hidden');
    }
  }

  /**
   * Show error state
   */
  showErrorState() {
    this.hideLoadingState();
    if (this.errorState) {
      this.errorState.classList.remove('hidden');
    }
  }

  /**
   * Render blog posts to the DOM
   */
  renderBlogs(blogData) {
    if (!this.blogContainer) return;

    this.blogContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    blogData.forEach((blog, index) => {
      const blogCard = this.createBlogCard(blog, index);
      fragment.appendChild(blogCard);
    });

    this.blogContainer.appendChild(fragment);

    // Staggered fade-in (cap at 50ms per card for large sets)
    const delay = blogData.length > 20 ? 50 : 150;
    setTimeout(() => {
      const cards = this.blogContainer.querySelectorAll('.blog-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, index * delay);
      });
    }, 100);
  }

  /**
   * Create individual blog card element
   */
  createBlogCard(blog, index) {
    const card = document.createElement('a');
    card.className = 'blog-card';
    card.href = blog.linkUrl || blog.url || blog.readMoreUrl || '#';
    // Internal links — no target="_blank" needed in unified site
    card.setAttribute('aria-label', `Read blog post: ${blog.title}`);

    // Build image HTML with graceful fallback
    const imageHTML = blog.imageUrl
      ? `<img src="${blog.imageUrl}" alt="${this.escapeHTML(blog.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<span>Bill Layne Insurance</span>'">`
      : '<span>Bill Layne Insurance</span>';

    // Format date for display
    const displayDate = this.formatDisplayDate(blog.date);

    card.innerHTML = `
      <article class="blog-card-article">
        <div class="blog-card-image" role="img" aria-label="Blog post cover image">
          ${imageHTML}
        </div>
        <div class="blog-card-content">
          <div class="blog-card-tags" role="list" aria-label="Post tags">
            ${this.createTagsHTML(blog.tags || [])}
          </div>
          <h3 class="blog-card-title">${this.escapeHTML(blog.title)}</h3>
          <time class="blog-card-date" datetime="${this.formatDatetime(blog.date)}">${displayDate}</time>
          <p class="blog-card-summary">${this.escapeHTML(blog.summary || '')}</p>
          ${blog.readTime ? `<span class="blog-card-readtime">${this.escapeHTML(blog.readTime)}</span>` : ''}
        </div>
      </article>
    `;

    card.addEventListener('keydown', this.handleCardKeydown.bind(this));
    return card;
  }

  /**
   * Create tags HTML
   */
  createTagsHTML(tags) {
    if (!Array.isArray(tags)) return '';
    return tags.map(tag =>
      `<span class="blog-tag" role="listitem">${this.escapeHTML(tag)}</span>`
    ).join('');
  }

  /**
   * Format date for display (human-readable)
   */
  formatDisplayDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format date for datetime attribute (ISO)
   */
  formatDatetime(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Handle keyboard navigation for cards
   */
  handleCardKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }
}

/**
 * Add smooth scrolling for internal links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Add focus management for better accessibility
 */
function initFocusManagement() {
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
      }
    });
  }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  new EtherealBlog();
  initSmoothScroll();
  initFocusManagement();
  console.log('Bill Layne Insurance Blog initialized successfully');
});

/**
 * Handle uncaught errors — only show blog error if blog specifically failed
 * (Don't let unrelated page errors trigger the blog error state)
 */
window.addEventListener('error', (event) => {
  console.error('Page Error:', event.error);
  // Only show blog error state if the blog grid is still empty
  const blogGrid = document.getElementById('blog-grid');
  const errorContainer = document.getElementById('error-state');
  if (errorContainer && blogGrid && blogGrid.children.length === 0) {
    errorContainer.classList.remove('hidden');
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EtherealBlog };
}
