/**
 * Kaizen-OS MkDocs Enhancements
 * Adds interactive features and Kaizen-specific behaviors
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Add Kaizen motto to footer
    addKaizenMotto();
    
    // Enhance code blocks with Kaizen styling
    enhanceCodeBlocks();
    
    // Add smooth scroll behavior
    addSmoothScroll();
    
    // Enhance tables with Kaizen styling
    enhanceTables();
    
    // Add cycle badge if present
    addCycleBadge();
  }

  function addKaizenMotto() {
    const footer = document.querySelector('.md-footer__inner');
    if (footer) {
      const motto = document.createElement('div');
      motto.className = 'kaizen-motto';
      motto.style.cssText = 'text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 215, 0, 0.2); color: #F5E6D3; font-style: italic;';
      motto.textContent = '"We heal as we walk." — Kaizen Cycle';
      footer.appendChild(motto);
    }
  }

  function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      // Add Kaizen-themed copy button enhancement
      const parent = block.parentElement;
      if (parent && !parent.querySelector('.kaizen-copy-hint')) {
        const hint = document.createElement('div');
        hint.className = 'kaizen-copy-hint';
        hint.style.cssText = 'position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.75rem; color: #FFD700; opacity: 0.7;';
        hint.textContent = 'Kaizen Code';
        parent.style.position = 'relative';
        parent.appendChild(hint);
      }
    });
  }

  function addSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            // Update URL without jumping
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  function enhanceTables() {
    const tables = document.querySelectorAll('.md-typeset table');
    tables.forEach(table => {
      // Add Kaizen styling class
      table.classList.add('kaizen-table');
      
      // Make tables responsive
      const wrapper = document.createElement('div');
      wrapper.className = 'kaizen-table-wrapper';
      wrapper.style.cssText = 'overflow-x: auto; margin: 1rem 0;';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function addCycleBadge() {
    // Check if cycle information is available in page metadata
    const cycleMeta = document.querySelector('meta[name="kaizen-cycle"]');
    if (cycleMeta) {
      const cycle = cycleMeta.getAttribute('content');
      const header = document.querySelector('.md-header__title');
      if (header) {
        const badge = document.createElement('span');
        badge.className = 'kaizen-cycle-badge';
        badge.style.cssText = 'display: inline-block; margin-left: 0.5rem; padding: 0.2rem 0.5rem; background: #FFD700; color: #1A2F3A; border-radius: 0.2rem; font-size: 0.75rem; font-weight: 600;';
        badge.textContent = `Cycle ${cycle}`;
        header.appendChild(badge);
      }
    }
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      const searchInput = document.querySelector('.md-search__input');
      if (searchInput && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
    
    // '?' to show keyboard shortcuts (if implemented)
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      // Could show a modal with keyboard shortcuts
      console.log('Kaizen-OS Keyboard Shortcuts:\n/ - Focus search\nEsc - Close modals');
    }
  });

  // Add Kaizen integrity badge if GI score is available
  function addIntegrityBadge() {
    // This could fetch from an API endpoint if available
    const giMeta = document.querySelector('meta[name="kaizen-gi"]');
    if (giMeta) {
      const gi = parseFloat(giMeta.getAttribute('content'));
      if (gi >= 0.95) {
        const badge = document.createElement('div');
        badge.className = 'kaizen-gi-badge';
        badge.style.cssText = 'position: fixed; bottom: 1rem; right: 1rem; padding: 0.5rem 1rem; background: #2C4F5E; color: #FFD700; border: 2px solid #FFD700; border-radius: 0.5rem; font-weight: 600; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.3);';
        badge.innerHTML = `GI: ${gi.toFixed(3)} ✓`;
        document.body.appendChild(badge);
      }
    }
  }

  // Run integrity badge check
  addIntegrityBadge();

  // Console message for developers
  console.log('%cKaizen-OS Handbook', 'color: #FFD700; font-size: 20px; font-weight: bold;');
  console.log('%c"We heal as we walk."', 'color: #F5E6D3; font-size: 14px; font-style: italic;');
  console.log('%cContinuous Integrity Architecture', 'color: #2C4F5E; font-size: 12px;');
})();

