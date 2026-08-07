export default function decorate(block) {
  // 1. Setup the main Support Hub Container
  block.dataset.aueType = 'container';
  block.dataset.aueFilter = 'tab-filter';
  block.dataset.aueLabel = 'Support Hub';
  block.classList.add('support-hub-layout');

  // 2. Centralized function to decorate all nested children dynamically
  const decorateNestedBlocks = () => {
    
    // Format Tabs
    block.querySelectorAll('.support-hub-tab').forEach((tab) => {
      if (!tab.dataset.aueType) {
        tab.dataset.aueType = 'container';
        tab.dataset.aueFilter = 'category-filter';
        tab.dataset.aueLabel = 'Support Tab';
      }
    });

    // Format Categories
    block.querySelectorAll('.support-hub-category').forEach((category) => {
      if (!category.dataset.aueType) {
        category.dataset.aueType = 'container';
        category.dataset.aueFilter = 'faq-filter';
        category.dataset.aueLabel = 'Support Category';
      }
    });

    // Format FAQs (Rows to Question/Answer)
    block.querySelectorAll('.support-hub-faq').forEach((faq) => {
      if (!faq.dataset.aueType) {
        faq.dataset.aueType = 'component';
        faq.dataset.aueLabel = 'Support FAQ';

        // EDS passes properties as child divs (rows)
        const rows = [...faq.children];
        if (rows.length >= 2) {
          const [questionRow, answerRow] = rows;

          // Setup Question inline editing
          questionRow.classList.add('faq-question');
          questionRow.dataset.aueProp = 'question';
          questionRow.dataset.aueType = 'text';
          
          // Setup Answer inline editing
          answerRow.classList.add('faq-answer');
          answerRow.dataset.aueProp = 'answer';
          answerRow.dataset.aueType = 'richtext';
        }
      }
    });
  };

  // Run once on initial page load to format existing content
  decorateNestedBlocks();

  // 3. Watch for Universal Editor Live Injections
  // This is the magic that allows a single file to handle nested blocks
  const observer = new MutationObserver((mutations) => {
    let shouldRedecorate = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        shouldRedecorate = true;
      }
    });
    if (shouldRedecorate) {
      decorateNestedBlocks();
    }
  });

  // Start observing the block for nested items being dragged and dropped
  observer.observe(block, { childList: true, subtree: true });

  // 4. Interactivity (Event Delegation)
  // Handles clicks for the accordions and tabs without needing separate files
  block.addEventListener('click', (e) => {
    // Handle FAQ Accordion Toggle
    const questionEl = e.target.closest('.faq-question');
    if (questionEl) {
      const faqItem = questionEl.closest('.support-hub-faq');
      const isExpanded = faqItem.classList.contains('expanded');
      
      // Close other FAQs in the same category
      const category = faqItem.closest('.support-hub-category');
      if (category) {
        category.querySelectorAll('.support-hub-faq.expanded').forEach(item => {
          if (item !== faqItem) item.classList.remove('expanded');
        });
      }
      
      // Toggle clicked FAQ
      faqItem.classList.toggle('expanded', !isExpanded);
      return;
    }

    // Handle Sidebar Category Switching
    const categoryBtn = e.target.closest('.category-title-btn'); // Add this class via CSS/JS later if you create physical buttons
    if (categoryBtn) {
      const category = categoryBtn.closest('.support-hub-category');
      const currentTab = category.closest('.support-hub-tab');
      
      if (currentTab && category) {
        currentTab.querySelectorAll('.support-hub-category').forEach(cat => cat.classList.remove('active'));
        category.classList.add('active');
      }
      return;
    }

    // Handle Top Tab Switching
    const tabBtn = e.target.closest('.tab-title-btn'); // Add this class via CSS/JS later if you create physical buttons
    if (tabBtn) {
      const tab = tabBtn.closest('.support-hub-tab');
      if (tab) {
        block.querySelectorAll('.support-hub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    }
  });
}