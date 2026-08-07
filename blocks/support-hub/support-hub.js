export default function decorate(block) {
  // 1. Setup Data Structure & Universal Editor Instrumentation
  const supportData = {};
  const originalRows = [...block.children];

  originalRows.forEach((row, index) => {
    // Instrument the entire row as an editable item
    row.dataset.aueType = 'component';
    row.dataset.aueLabel = `FAQ Item ${index + 1}`;

    block.dataset.aueType = 'container';
  block.dataset.aueFilter = 'support-hub'; // This strictly matches the filter ID in your JSON!
  block.dataset.aueBehavior = 'component';

    const cells = row.children;
    // Ensure the row has the 4 expected columns from the JSON model
    if (cells.length < 4) return;

    // Apply Universal Editor properties to make them inline-editable
    cells[0].dataset.aueProp = 'col1_type';      // Tab
    cells[0].dataset.aueType = 'text';
    
    cells[1].dataset.aueProp = 'col1_sub-type';  // Category
    cells[1].dataset.aueType = 'text';
    
    cells[2].dataset.aueProp = 'col1_heading';   // Question
    cells[2].dataset.aueType = 'text';
    
    cells[3].dataset.aueProp = 'col2_body';      // Answer
    cells[3].dataset.aueType = 'richtext';

    // Extract text values for grouping
    const tabTitle = cells[0].textContent.trim();
    const categoryTitle = cells[1].textContent.trim();

    if (!tabTitle || !categoryTitle) return;

    // Group by Tab
    if (!supportData[tabTitle]) {
      supportData[tabTitle] = {};
    }

    // Group by Category under the Tab
    if (!supportData[tabTitle][categoryTitle]) {
      supportData[tabTitle][categoryTitle] = [];
    }

    // Store the actual DOM nodes (cells 2 and 3) to preserve AEM inline editing
    supportData[tabTitle][categoryTitle].push({
      questionCell: cells[2],
      answerCell: cells[3]
    });
  });

  // 2. Clear the original flat table to build the nested UI
  block.innerHTML = '';

  // Create main layout containers
  const tabsNav = document.createElement('div');
  tabsNav.className = 'support-tabs-nav';
  
  const tabsContentArea = document.createElement('div');
  tabsContentArea.className = 'support-tabs-content';

  block.append(tabsNav, tabsContentArea);

  let isFirstTab = true;

  // 3. Build the DOM Hierarchy
  for (const [tabTitle, categories] of Object.entries(supportData)) {
    
    // --- Build Top Navigation Tab ---
    const tabBtn = document.createElement('button');
    tabBtn.className = `support-tab-btn ${isFirstTab ? 'active' : ''}`;
    tabBtn.textContent = tabTitle;
    tabsNav.append(tabBtn);

    // --- Build Tab Content Panel ---
    const tabPanel = document.createElement('div');
    tabPanel.className = `support-tab-panel ${isFirstTab ? 'active' : ''}`;
    
    const sidebar = document.createElement('div');
    sidebar.className = 'support-sidebar';
    
    const faqArea = document.createElement('div');
    faqArea.className = 'support-faq-area';

    tabPanel.append(sidebar, faqArea);
    tabsContentArea.append(tabPanel);

    let isFirstCategory = true;

    for (const [categoryTitle, faqs] of Object.entries(categories)) {
      
      // --- Build Sidebar Category Button ---
      const catBtn = document.createElement('button');
      catBtn.className = `support-cat-btn ${isFirstCategory ? 'active' : ''}`;
      catBtn.innerHTML = `
        <span class="cat-title">${categoryTitle}</span>
        <span class="cat-count">${faqs.length} Questions</span>
      `;
      sidebar.append(catBtn);

      // --- Build FAQ Accordion List ---
      const faqList = document.createElement('div');
      faqList.className = `support-faq-list ${isFirstCategory ? 'active' : ''}`;
      
      const listHeader = document.createElement('h2');
      listHeader.className = 'faq-list-header';
      listHeader.textContent = categoryTitle;
      faqList.append(listHeader);

      faqs.forEach((faq) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'support-faq-item';

        // Setup the clickable question area
        const questionContainer = document.createElement('div');
        questionContainer.className = 'support-faq-question';
        
        const icon = document.createElement('span');
        icon.className = 'question-icon';
        icon.textContent = '+';
        
        faq.questionCell.classList.add('question-text');
        questionContainer.append(faq.questionCell, icon); // Append original authored cell

        // Setup the hidden answer area
        faq.answerCell.classList.add('support-faq-answer'); // Append original authored cell

        // Accordion Interactivity
        questionContainer.addEventListener('click', () => {
          const isExpanded = faqItem.classList.contains('expanded');
          
          // Close other open FAQs
          faqList.querySelectorAll('.support-faq-item').forEach(item => {
              item.classList.remove('expanded');
              item.querySelector('.question-icon').textContent = '+';
          });

          // Toggle current FAQ
          if (!isExpanded) {
            faqItem.classList.add('expanded');
            icon.textContent = '—';
          }
        });

        faqItem.append(questionContainer, faq.answerCell);
        faqList.append(faqItem);
      });

      faqArea.append(faqList);

      // --- Category Switching Interactivity ---
      catBtn.addEventListener('click', () => {
        sidebar.querySelectorAll('.support-cat-btn').forEach(btn => btn.classList.remove('active'));
        faqArea.querySelectorAll('.support-faq-list').forEach(list => list.classList.remove('active'));
        
        catBtn.classList.add('active');
        faqList.classList.add('active');
      });

      isFirstCategory = false;
    }

    // --- Tab Switching Interactivity ---
    tabBtn.addEventListener('click', () => {
      tabsNav.querySelectorAll('.support-tab-btn').forEach(btn => btn.classList.remove('active'));
      tabsContentArea.querySelectorAll('.support-tab-panel').forEach(panel => panel.classList.remove('active'));
      
      tabBtn.classList.add('active');
      tabPanel.classList.add('active');
    });

    isFirstTab = false;
  }
}