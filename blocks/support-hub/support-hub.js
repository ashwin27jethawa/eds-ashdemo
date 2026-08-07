export default function decorate(block) {
block.dataset.aueType = 'container';
  block.dataset.aueBehavior = 'component'; 
  
  // 2. Tell the Editor exactly WHICH blocks are allowed inside here
  // This matches the "id" of the filter we set in the JSON for the tabs
  block.dataset.aueFilter = 'tab-filter';
  // ---------------------------------------------------------
  const supportData = {};

  // Read all rows from the authored table
  const rows = [...block.children];
  
  rows.forEach((row) => {
    const cells = row.children;
    // Ensure the row has our expected 5 columns
    if (cells.length < 5) return; 

    const tabTitle = cells[0].textContent.trim();
    const categoryTitle = cells[1].textContent.trim();
    const categoryIconHTML = cells[2].innerHTML; // Keep HTML to preserve AEM picture elements
    const questionHTML = cells[3].innerHTML; 
    const answerHTML = cells[4].innerHTML;

    // Skip empty rows
    if (!tabTitle || !categoryTitle) return;

    // Initialize Tab if it doesn't exist
    if (!supportData[tabTitle]) {
      supportData[tabTitle] = {};
    }

    // Initialize Category if it doesn't exist under this Tab
    if (!supportData[tabTitle][categoryTitle]) {
      supportData[tabTitle][categoryTitle] = {
        icon: categoryIconHTML,
        faqs: []
      };
    }

    // Push the FAQ into the specific Category
    supportData[tabTitle][categoryTitle].faqs.push({
      question: questionHTML,
      answer: answerHTML
    });
  });

  // ---------------------------------------------------------
  // 2. DOM GENERATION
  // Clear the original table and build the UI
  // ---------------------------------------------------------
  block.innerHTML = ''; // Clear authored table

  // Create main UI containers
  const tabsNav = document.createElement('div');
  tabsNav.className = 'support-tabs-nav';
  
  const tabsContentArea = document.createElement('div');
  tabsContentArea.className = 'support-tabs-content';

  block.append(tabsNav, tabsContentArea);

  let isFirstTab = true;

  // Iterate through the grouped Tabs
  for (const [tabTitle, categories] of Object.entries(supportData)) {
    
    // --- Build Top Tab Button ---
    const tabBtn = document.createElement('button');
    tabBtn.className = `support-tab-btn ${isFirstTab ? 'active' : ''}`;
    tabBtn.textContent = tabTitle;
    tabsNav.append(tabBtn);

    // --- Build Tab Panel Container ---
    const tabPanel = document.createElement('div');
    tabPanel.className = `support-tab-panel ${isFirstTab ? 'active' : ''}`;
    
    // Split Panel into Sidebar (left) and FAQ Area (right)
    const sidebar = document.createElement('div');
    sidebar.className = 'support-sidebar';
    
    const faqArea = document.createElement('div');
    faqArea.className = 'support-faq-area';

    tabPanel.append(sidebar, faqArea);
    tabsContentArea.append(tabPanel);

    let isFirstCategory = true;

    // Iterate through Categories inside this Tab
    for (const [categoryTitle, categoryData] of Object.entries(categories)) {
      
      // --- Build Sidebar Category Button ---
      const catBtn = document.createElement('button');
      catBtn.className = `support-cat-btn ${isFirstCategory ? 'active' : ''}`;
      
      // Auto-calculate the question count
      const questionCount = categoryData.faqs.length;
      
      catBtn.innerHTML = `
        <div class="cat-icon">${categoryData.icon}</div>
        <div class="cat-info">
            <span class="cat-title">${categoryTitle}</span>
            <span class="cat-count">${questionCount} Questions</span>
        </div>
      `;
      sidebar.append(catBtn);

      // --- Build FAQ List for this Category ---
      const faqList = document.createElement('div');
      faqList.className = `support-faq-list ${isFirstCategory ? 'active' : ''}`;
      
      // Optional: Add category title at the top of the FAQ list
      const listHeader = document.createElement('h2');
      listHeader.className = 'faq-list-header';
      listHeader.textContent = categoryTitle;
      faqList.append(listHeader);

      // Build individual accordions
      categoryData.faqs.forEach((faq) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'support-faq-item';

        const faqQuestion = document.createElement('div');
        faqQuestion.className = 'support-faq-question';
        faqQuestion.innerHTML = `
            <div class="question-text">${faq.question}</div>
            <div class="question-icon">+</div>
        `;

        const faqAnswer = document.createElement('div');
        faqAnswer.className = 'support-faq-answer';
        faqAnswer.innerHTML = faq.answer;

        // Accordion Click Logic
        faqQuestion.addEventListener('click', () => {
          const isExpanded = faqItem.classList.contains('expanded');
          
          // Close others in this list
          faqList.querySelectorAll('.support-faq-item').forEach(item => {
              item.classList.remove('expanded');
              item.querySelector('.question-icon').textContent = '+';
          });

          // Toggle clicked item
          if (!isExpanded) {
            faqItem.classList.add('expanded');
            faqQuestion.querySelector('.question-icon').textContent = '—';
          }
        });

        faqItem.append(faqQuestion, faqAnswer);
        faqList.append(faqItem);
      });

      faqArea.append(faqList);

      // --- Category Switching Logic ---
      catBtn.addEventListener('click', () => {
        // Reset active states in sidebar and faq area
        sidebar.querySelectorAll('.support-cat-btn').forEach(btn => btn.classList.remove('active'));
        faqArea.querySelectorAll('.support-faq-list').forEach(list => list.classList.remove('active'));
        
        // Set new active states
        catBtn.classList.add('active');
        faqList.classList.add('active');
      });

      isFirstCategory = false;
    }

    // --- Tab Switching Logic ---
    tabBtn.addEventListener('click', () => {
      // Reset active states for top tabs
      tabsNav.querySelectorAll('.support-tab-btn').forEach(btn => btn.classList.remove('active'));
      tabsContentArea.querySelectorAll('.support-tab-panel').forEach(panel => panel.classList.remove('active'));

      // Set new active states
      tabBtn.classList.add('active');
      tabPanel.classList.add('active');
    });

    isFirstTab = false;
  }
}


// export default async function decorate(block) {
//   const data = JSON.parse(block.textContent);

//   block.textContent = '';

//   const tabs = document.createElement('div');
//   tabs.className = 'support-tabs';

//   const body = document.createElement('div');
//   body.className = 'support-body';

//   const sidebar = document.createElement('div');
//   sidebar.className = 'support-sidebar';

//   const content = document.createElement('div');
//   content.className = 'support-content';

//   body.append(sidebar, content);
//   block.append(tabs, body);

//   function renderCategory(category) {
//     content.innerHTML = '';

//     category.faqs.forEach((faq) => {
//       const item = document.createElement('div');
//       item.className = 'faq-item';

//       item.innerHTML = `
//         <button class="faq-question">
//           <span>${faq.question}</span>
//           <span>+</span>
//         </button>

//         <div class="faq-answer">
//           ${faq.answer}
//         </div>
//       `;

//       const button = item.querySelector('.faq-question');
//       const answer = item.querySelector('.faq-answer');

//       button.addEventListener('click', () => {
//         answer.classList.toggle('open');
//         button.classList.toggle('open');
//       });

//       content.append(item);
//     });
//   }

//   function renderSidebar(tab) {
//     sidebar.innerHTML = '';

//     tab.categories.forEach((category, index) => {
//       const card = document.createElement('div');
//       card.className = 'category-card';

//       card.innerHTML = `
//         <div>
//           <h4>${category.title}</h4>
//           <small>${category.questionCount || ''}</small>
//         </div>
//         <span>›</span>
//       `;

//       if (index === 0) {
//         card.classList.add('active');
//         renderCategory(category);
//       }

//       card.addEventListener('click', () => {
//         sidebar.querySelectorAll('.category-card').forEach((c) =>
//           c.classList.remove('active')
//         );

//         card.classList.add('active');
//         renderCategory(category);
//       });

//       sidebar.append(card);
//     });
//   }

//   data.tabs.forEach((tab, index) => {
//     const btn = document.createElement('button');
//     btn.textContent = tab.title;

//     if (index === 0) {
//       btn.classList.add('active');
//       renderSidebar(tab);
//     }

//     btn.addEventListener('click', () => {
//       tabs.querySelectorAll('button').forEach((b) =>
//         b.classList.remove('active')
//       );

//       btn.classList.add('active');
//       renderSidebar(tab);
//     });

//     tabs.append(btn);
//   });
// }