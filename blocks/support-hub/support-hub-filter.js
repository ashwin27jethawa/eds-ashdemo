export default function decorate(block) {
  // 1. Universal Editor Container Setup
  // Tell UE this is a container and it only accepts Tabs
  block.dataset.aueType = 'container';
  block.dataset.aueFilter = 'tab-filter';
  block.dataset.aueLabel = 'Support Hub';

  // Add a specific class so we can target the layout with CSS
  block.classList.add('support-hub-layout');

  // CRITICAL: We do NOT use block.innerHTML = '' here anymore.
  // We must preserve the children that the Universal Editor injects.

  // 2. Interactivity via Event Delegation
  // We listen for clicks on the entire block and figure out what was clicked.
  block.addEventListener('click', (e) => {
    
    // --- A. Handle FAQ Accordion Toggles ---
    // Looks for a click on the question element inside an FAQ block
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
      
      // Toggle the clicked FAQ
      faqItem.classList.toggle('expanded', !isExpanded);
      return; // Stop processing the click
    }

    // --- B. Handle Sidebar Category Switching ---
    // Looks for a click on a category title button
    const categoryBtn = e.target.closest('.category-title-btn'); 
    if (categoryBtn) {
      const category = categoryBtn.closest('.support-hub-category');
      const currentTab = category.closest('.support-hub-tab');
      
      if (currentTab && category) {
        // Deactivate all categories in this specific tab
        currentTab.querySelectorAll('.support-hub-category').forEach(cat => {
            cat.classList.remove('active');
        });
        
        // Activate the clicked category
        category.classList.add('active');
      }
      return;
    }

    // --- C. Handle Top Tab Switching ---
    // Looks for a click on a main tab title button
    const tabBtn = e.target.closest('.tab-title-btn');
    if (tabBtn) {
      const tab = tabBtn.closest('.support-hub-tab');
      
      if (tab) {
        // Deactivate all tabs in the hub
        block.querySelectorAll('.support-hub-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // Activate the clicked tab
        tab.classList.add('active');
      }
    }
  });
}