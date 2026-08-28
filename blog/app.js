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
    this.allBlogs = [];
    this.visibleCount = 0;
    this.pageSize = 30;
    this.searchTerm = '';
    this.searchApplied = false;
    this.loadMoreContainer = null;
    this.loadMoreBtn = null;
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
   * Render blog posts to the DOM (first page only — Load More paginates)
   */
  renderBlogs(blogData) {
    if (!this.blogContainer) return;

    this.allBlogs = blogData;
    this.searchTerm = '';
    this.searchApplied = false;
    this.visibleCount = 0;

    this.blogContainer.innerHTML = '';
    this.appendCards(blogData.slice(0, this.pageSize));
    this.visibleCount = Math.min(this.pageSize, blogData.length);

    this.setupLoadMore();
    this.animateNewCards();
  }

  /**
   * Append a batch of cards to the grid
   */
  appendCards(blogs) {
    const fragment = document.createDocumentFragment();
    blogs.forEach((blog, index) => {
      fragment.appendChild(this.createBlogCard(blog, index));
    });
    this.blogContainer.appendChild(fragment);
  }

  /**
   * Staggered fade-in for newly rendered cards only
   */
  animateNewCards() {
    setTimeout(() => {
      const cards = this.blogContainer.querySelectorAll('.blog-card:not(.visible)');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, Math.min(index * 50, 1000));
      });
    }, 100);
  }

  /**
   * Create (once) and maintain the "Load more articles" button
   */
  setupLoadMore() {
    if (!this.loadMoreContainer) {
      this.loadMoreContainer = document.createElement('div');
      this.loadMoreContainer.className = 'load-more-container';
      this.loadMoreBtn = document.createElement('button');
      this.loadMoreBtn.type = 'button';
      this.loadMoreBtn.className = 'load-more-btn';
      this.loadMoreBtn.textContent = 'Load more articles';
      this.loadMoreBtn.addEventListener('click', () => this.loadMore());
      this.loadMoreContainer.appendChild(this.loadMoreBtn);
      this.blogContainer.insertAdjacentElement('afterend', this.loadMoreContainer);
    }
    this.updateLoadMoreVisibility();
  }

  /**
   * Append the next page of articles
   */
  loadMore() {
    const next = this.allBlogs.slice(this.visibleCount, this.visibleCount + this.pageSize);
    this.appendCards(next);
    this.visibleCount += next.length;
    this.updateLoadMoreVisibility();
    this.animateNewCards();
  }

  /**
   * Show the button only when browsing (not searching) with more to load
   */
  updateLoadMoreVisibility() {
    if (!this.loadMoreContainer) return;
    const show = this.searchTerm === '' && this.visibleCount < this.allBlogs.length;
    this.loadMoreContainer.classList.toggle('hidden', !show);
  }

  /**
   * Filter the FULL dataset by search term. An empty term restores the
   * paginated view; a non-empty term shows all matches (no cap).
   */
  applySearch(rawTerm) {
    const term = (rawTerm || '').toLowerCase().trim();
    // Guard against re-entrant calls (the page's MutationObserver re-fires
    // the search handler whenever this method re-renders the grid)
    if (term === this.searchTerm && this.searchApplied) return;
    this.searchTerm = term;
    this.searchApplied = true;

    this.blogContainer.innerHTML = '';

    if (term === '') {
      this.appendCards(this.allBlogs.slice(0, this.pageSize));
      this.visibleCount = Math.min(this.pageSize, this.allBlogs.length);
    } else {
      const matches = this.allBlogs.filter(blog => this.matchesSearch(blog, term));
      this.visibleCount = matches.length;
      if (matches.length > 0) {
        this.appendCards(matches);
      } else {
        this.showNoResults(term);
      }
    }

    this.updateLoadMoreVisibility();
    this.animateNewCards();
  }

  /**
   * Check a post against the search term
   */
  matchesSearch(blog, term) {
    const haystack = [
      blog.title,
      blog.summary,
      blog.category,
      Array.isArray(blog.tags) ? blog.tags.join(' ') : ''
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  }

  /**
   * Show the "no results" message inside the grid
   */
  showNoResults(term) {
    const msg = document.createElement('div');
    msg.id = 'no-results-message';
    msg.style.cssText = 'text-align: center; padding: 3rem; color: #6b7280; font-size: 1.125rem;';
    msg.innerHTML = `
      <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem; display: block;"></i>
      <p style="font-weight: 600; margin-bottom: 0.5rem;">No articles found for "${this.escapeHTML(term)}"</p>
      <p style="font-size: 1rem;">Try searching for different keywords or browse all articles below</p>
    `;
    this.blogContainer.appendChild(msg);
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

    // Build image HTML with graceful fallback. Card container is fixed 16:9,
    // so 640x360 reserves the right layout box before the image loads.
    const imageHTML = blog.imageUrl
      ? `<img src="${blog.imageUrl}" alt="${this.escapeHTML(blog.title)}" loading="lazy" width="640" height="360" onerror="this.parentElement.innerHTML='<span>Bill Layne Insurance</span>'">`
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
            ${this.createTagsHTML(blog.category, blog.tags || [])}
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
   * Create tags HTML — capped at the category plus at most 2 tags
   */
  createTagsHTML(category, tags) {
    const pills = [];
    if (category) pills.push(category);
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (pills.length >= 3) break;
        if (!pills.some(p => String(p).toLowerCase() === String(tag).toLowerCase())) {
          pills.push(tag);
        }
      }
    }
    return pills.map(tag =>
      `<span class="blog-tag" role="listitem">${this.escapeHTML(tag)}</span>`
    ).join('');
  }

  /**
   * Format date for display (human-readable)
   */
  formatDisplayDate(dateString) {
    try {
      // Date-only strings parse as UTC midnight, which renders as the PREVIOUS
      // day in US timezones. Anchor to local noon so the displayed date matches
      // the publish date (same fix the homepage blog module uses).
      const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString + 'T12:00:00' : dateString);
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
  window.__blogApp = new EtherealBlog();
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
