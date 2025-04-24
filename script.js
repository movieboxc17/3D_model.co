// Show/hide loader
document.addEventListener('DOMContentLoaded', function() {
    // Hide loader after page loads
    setTimeout(function() {
      document.getElementById('loader').style.display = 'none';
    }, 1500);
    
    // Elements
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const sortButtons = document.querySelectorAll('.filter-btn[data-sort]');
    const modelCards = document.querySelectorAll('.model-card');
    const searchInput = document.getElementById('search-input');
    const header = document.querySelector('header');
    const revealElements = document.querySelectorAll('.reveal');
    
    // Filter by category
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        modelCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    
    // Sort functionality
    sortButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active button
        sortButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const sortValue = this.getAttribute('data-sort');
        const grids = document.querySelectorAll('.model-grid');
        
        grids.forEach(grid => {
          const items = Array.from(grid.children);
          
          if (sortValue === 'name') {
            items.sort((a, b) => {
              const titleA = a.querySelector('.model-title').textContent.trim().toLowerCase();
              const titleB = b.querySelector('.model-title').textContent.trim().toLowerCase();
              return titleA.localeCompare(titleB);
            });
          } else {
            // Default order (original DOM order)
            items.sort((a, b) => {
              return Array.from(grid.children).indexOf(a) - Array.from(grid.children).indexOf(b);
            });
          }
          
          // Remove all items
          while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
          }
          
          // Add sorted items
          items.forEach(item => grid.appendChild(item));
        });
      });
    });
    
    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        const searchTerm = this.value.toLowerCase().trim();
        let matchCount = 0;
        
        modelCards.forEach(card => {
          const title = card.querySelector('.model-title').textContent.toLowerCase();
          const description = card.querySelector('.model-description')?.textContent.toLowerCase() || '';
          const attribution = card.querySelector('.attribution').textContent.toLowerCase();
          const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
          
          if (title.includes(searchTerm) || 
              description.includes(searchTerm) || 
              attribution.includes(searchTerm) ||
              tags.includes(searchTerm)) {
            card.style.display = '';
            matchCount++;
            
            // Highlight the search term
            highlightText(card, searchTerm);
          } else {
            card.style.display = 'none';
          }
        });
        
        // Show/hide "no results" message
        const noResultsMsg = document.getElementById('no-results-message');
        if (noResultsMsg) {
          if (matchCount === 0 && searchTerm !== '') {
            noResultsMsg.style.display = 'block';
          } else {
            noResultsMsg.style.display = 'none';
          }
        }
      }, 300);
    });
    
    // Highlight search terms
    function highlightText(card, term) {
      if (term === '') return;
      
      // Revert previous highlights
      card.querySelectorAll('.highlight').forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      });
      
      // Skip if empty search term
      if (!term.trim()) return;
      
      // Get text nodes in the card
      const titleElement = card.querySelector('.model-title');
      const descElement = card.querySelector('.model-description');
      
      // Highlight function
      const highlightInElement = (element) => {
        if (!element) return;
        
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const nodesToHighlight = [];
        let textNode;
        
        while ((textNode = walker.nextNode())) {
          if (textNode.textContent.toLowerCase().includes(term.toLowerCase())) {
            nodesToHighlight.push(textNode);
          }
        }
        
        nodesToHighlight.forEach(node => {
          const content = node.textContent;
          const parent = node.parentNode;
          const parts = content.split(new RegExp(`(${term})`, 'gi'));
          
          const fragment = document.createDocumentFragment();
          parts.forEach(part => {
            if (part.toLowerCase() === term.toLowerCase()) {
              const span = document.createElement('span');
              span.className = 'highlight';
              span.textContent = part;
              span.style.backgroundColor = 'rgba(28, 170, 217, 0.2)';
              span.style.borderRadius = '2px';
              span.style.padding = '0 2px';
              fragment.appendChild(span);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          });
          
          parent.replaceChild(fragment, node);
        });
      };
      
      highlightInElement(titleElement);
      highlightInElement(descElement);
    }
    
    // Lazy loading for iframes
    function lazyLoadIframes() {
      const iframes = document.querySelectorAll('iframe');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load the iframe only when it's in viewport
            const iframe = entry.target;
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
              
              // Add loading animation
              const parent = iframe.parentElement;
              parent.classList.add('loading');
              
              // Remove loading animation when frame is loaded
              iframe.addEventListener('load', () => {
                parent.classList.remove('loading');
              });
            }
            // Stop observing once loaded
            observer.unobserve(iframe);
          }
        });
      }, { threshold: 0.1, rootMargin: '100px' });
      
      iframes.forEach(iframe => {
        // Skip Polycam iframes that should load immediately
        if (iframe.src.includes('poly.cam')) {
          return;
        }
        
        // Replace actual src with data-src
        if (!iframe.dataset.src) {
          iframe.dataset.src = iframe.src;
          iframe.src = 'about:blank';
        }
        observer.observe(iframe);
      });
    }
    
    // Initialize lazy loading
    lazyLoadIframes();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without refreshing the page
          history.pushState(null, null, targetId);
        }
      });
    });
    
    // Scroll reveal animation
    function checkRevealElements() {
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
          element.classList.add('visible');
        }
      });
    }
    
    // Header shrink on scroll
    function handleScroll() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Check elements to reveal while scrolling
      checkRevealElements();
    }
    
    // Initial check for elements in view
    checkRevealElements();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Load more functionality - if needed in the future
    function createLoadMoreButton(category) {
      const section = document.getElementById(category);
      if (!section) return;
      
      const grid = section.querySelector('.model-grid');
      const cards = grid.querySelectorAll('.model-card');
      
      // Only create button if there are more than 6 cards
      if (cards.length <= 6) return;
      
      // Hide cards beyond the 6th one
      cards.forEach((card, index) => {
        if (index >= 6) {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
      
      // Create button
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'btn primary-btn load-more-btn';
      loadMoreBtn.textContent = 'Load More';
      loadMoreBtn.addEventListener('click', function() {
        const hiddenCards = grid.querySelectorAll('.model-card.hidden');
        
        // Show the next batch of cards (max 6 at a time)
        let count = 0;
        hiddenCards.forEach(card => {
          if (count < 6) {
            card.classList.remove('hidden');
            card.style.display = '';
            card.classList.add('revealing');
            setTimeout(() => {
              card.classList.remove('revealing');
            }, 500);
            count++;
          }
        });
        
        // Remove button if no more hidden cards
        if (grid.querySelectorAll('.model-card.hidden').length === 0) {
          this.remove();
        }
      });
      
      // Add button after the grid
      grid.parentNode.insertBefore(loadMoreBtn, grid.nextSibling);
    }
    
    // Enable this if you want to implement load more functionality for specific categories
    // createLoadMoreButton('raspberry-pi');
    // createLoadMoreButton('vehicles');
    // createLoadMoreButton('misc');
    
    // Apply animations to featured elements
    document.querySelectorAll('.featured-model').forEach(element => {
      element.style.position = 'relative';
      element.style.overflow = 'visible';
      
      const overlay = document.createElement('div');
      overlay.className = 'featured-overlay';
      overlay.innerHTML = '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>';
      element.appendChild(overlay);
    });
  });
  
