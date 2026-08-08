// function addStyles() {
//   if (document.querySelector('#faq-tabs-styles')) return;

//   const style = document.createElement('style');

//   style.id = 'faq-tabs-styles';

//   style.textContent = `
//     .faq-tabs {
//       width: 100%;
//     }

//     /* =========================
//        TOP LEVEL TABS
//     ========================== */

//     .faq-tabs__top-tabs {
//       display: flex;
//       align-items: center;
//       gap: 32px;
//       border-bottom: 1px solid #e5e5e5;
//       overflow-x: auto;
//       scrollbar-width: none;
//     }

//     .faq-tabs__top-tabs::-webkit-scrollbar {
//       display: none;
//     }

//     .faq-tabs__top-tab {
//       position: relative;
//       flex-shrink: 0;
//       padding: 16px 0;
//       border: 0;
//       background: none;
//       color: #555;
//       font-size: 13px;
//       cursor: pointer;
//       white-space: nowrap;
//     }

//     .faq-tabs__top-tab.is-active {
//       color: #111;
//       font-weight: 600;
//     }

//     .faq-tabs__top-tab.is-active::after {
//       content: '';
//       position: absolute;
//       left: 0;
//       right: 0;
//       bottom: -1px;
//       height: 2px;
//       background: #e40046;
//     }

//     /* =========================
//        MAIN CONTENT
//     ========================== */

//     .faq-tabs__content {
//       display: grid;
//       grid-template-columns: 220px minmax(0, 1fr);
//       gap: 50px;
//       padding-top: 35px;
//     }

//     /* =========================
//        LEFT SIDEBAR
//     ========================== */

//     .faq-tabs__sidebar {
//       width: 100%;
//     }

//     .faq-tabs__sub-tabs {
//       display: flex;
//       flex-direction: column;
//     }

//     .faq-tabs__sub-tab {
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       width: 100%;
//       padding: 14px 0;
//       border: 0;
//       border-bottom: 1px solid #e5e5e5;
//       background: none;
//       text-align: left;
//       cursor: pointer;
//     }

//     .faq-tabs__sub-tab-content {
//       flex: 1;
//     }

//     .faq-tabs__sub-tab-title {
//       display: block;
//       color: #222;
//       font-size: 13px;
//       line-height: 1.4;
//     }

//     .faq-tabs__sub-tab-count {
//       display: block;
//       margin-top: 3px;
//       color: #888;
//       font-size: 11px;
//     }

//     .faq-tabs__sub-tab-arrow {
//       color: #777;
//       font-size: 18px;
//     }

//     .faq-tabs__sub-tab.is-active
//       .faq-tabs__sub-tab-title {
//       font-weight: 600;
//     }

//     /* =========================
//        FAQ AREA
//     ========================== */

//     .faq-tabs__faqs {
//       min-width: 0;
//     }

//     .faq-tabs__faq {
//       border-bottom: 1px solid #e5e5e5;
//     }

//     .faq-tabs__question {
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       gap: 20px;
//       width: 100%;
//       padding: 20px 0;
//       border: 0;
//       background: none;
//       color: #222;
//       font-family: inherit;
//       font-size: 15px;
//       text-align: left;
//       cursor: pointer;
//     }

//     .faq-tabs__question-text {
//       flex: 1;
//     }

//     .faq-tabs__icon {
//       position: relative;
//       flex-shrink: 0;
//       width: 18px;
//       height: 18px;
//     }

//     .faq-tabs__icon::before,
//     .faq-tabs__icon::after {
//       content: '';
//       position: absolute;
//       top: 50%;
//       left: 50%;
//       width: 12px;
//       height: 1px;
//       background: currentColor;
//       transform: translate(-50%, -50%);
//     }

//     .faq-tabs__icon::after {
//       transform: translate(-50%, -50%) rotate(90deg);
//       transition: transform 0.2s ease;
//     }

//     .faq-tabs__faq.is-open
//       .faq-tabs__icon::after {
//       transform: translate(-50%, -50%) rotate(0);
//     }

//     .faq-tabs__answer {
//       padding: 0 35px 20px 0;
//       color: #666;
//       font-size: 13px;
//       line-height: 1.7;
//     }

//     .faq-tabs__answer p:first-child {
//       margin-top: 0;
//     }

//     .faq-tabs__answer p:last-child {
//       margin-bottom: 0;
//     }

//     /* =========================
//        ACTIONS
//     ========================== */

//     .faq-tabs__actions {
//       display: flex;
//       gap: 8px;
//       margin-top: 10px;
//     }

//     .faq-tabs__action {
//       min-height: 32px;
//       padding: 0 12px;
//       border: 1px solid #ddd;
//       border-radius: 4px;
//       background: #fff;
//       font-size: 12px;
//       cursor: pointer;
//     }

//     /* =========================
//        VIEW ALL
//     ========================== */

//     .faq-tabs__view-all {
//       display: inline-flex;
//       align-items: center;
//       gap: 5px;
//       margin-top: 18px;
//       padding: 0;
//       border: 0;
//       background: none;
//       color: #e40046;
//       font-size: 12px;
//       font-weight: 600;
//       cursor: pointer;
//     }

//     /* =========================
//        MOBILE
//     ========================== */

//     @media (max-width: 768px) {
//       .faq-tabs__content {
//         grid-template-columns: 1fr;
//         gap: 25px;
//       }

//       .faq-tabs__sub-tabs {
//         flex-direction: row;
//         gap: 10px;
//         overflow-x: auto;
//       }

//       .faq-tabs__sub-tab {
//         min-width: 150px;
//         padding: 12px;
//         border: 1px solid #e5e5e5;
//       }

//       .faq-tabs__sub-tab-arrow {
//         display: none;
//       }
//     }
//   `;

//   document.head.appendChild(style);
// }


// /* ==========================================
//    READ MULTIFIELD DATA
// ========================================== */

// function getFaqItems(block) {
//   const items = [];

//   /*
//    * XWalk multifield data can be represented
//    * in the block DOM as repeated rows.
//    */

//   [...block.children].forEach((row) => {
//     const cells = [...row.children];

//     if (cells.length < 4) return;

//     const topTab = cells[0]?.textContent.trim();
//     const subTab = cells[1]?.textContent.trim();
//     const question = cells[2]?.textContent.trim();
//     const answer = cells[3]?.innerHTML.trim();

//     if (!topTab || !subTab || !question) return;

//     items.push({
//       topTab,
//       subTab,
//       question,
//       answer,
//     });
//   });

//   return items;
// }


// /* ==========================================
//    GROUP DATA
// ========================================== */

// function groupFaqs(items) {
//   const categories = [];

//   items.forEach((item) => {
//     let category = categories.find(
//       (entry) => entry.title === item.topTab,
//     );

//     if (!category) {
//       category = {
//         title: item.topTab,
//         subTabs: [],
//       };

//       categories.push(category);
//     }

//     let subTab = category.subTabs.find(
//       (entry) => entry.title === item.subTab,
//     );

//     if (!subTab) {
//       subTab = {
//         title: item.subTab,
//         faqs: [],
//       };

//       category.subTabs.push(subTab);
//     }

//     subTab.faqs.push({
//       question: item.question,
//       answer: item.answer,
//     });
//   });

//   return categories;
// }


// /* ==========================================
//    CREATE FAQ
// ========================================== */

// function createFaq(faq) {
//   const wrapper = document.createElement('div');

//   wrapper.className = 'faq-tabs__faq';

//   const button = document.createElement('button');

//   button.type = 'button';
//   button.className = 'faq-tabs__question';
//   button.setAttribute('aria-expanded', 'false');

//   const text = document.createElement('span');

//   text.className = 'faq-tabs__question-text';
//   text.textContent = faq.question;

//   const icon = document.createElement('span');

//   icon.className = 'faq-tabs__icon';
//   icon.setAttribute('aria-hidden', 'true');

//   button.append(text, icon);

//   const answer = document.createElement('div');

//   answer.className = 'faq-tabs__answer';
//   answer.hidden = true;
//   answer.innerHTML = faq.answer || '';

//   button.addEventListener('click', () => {
//     const open = wrapper.classList.contains('is-open');

//     wrapper.classList.toggle('is-open', !open);

//     answer.hidden = open;

//     button.setAttribute(
//       'aria-expanded',
//       String(!open),
//     );
//   });

//   wrapper.append(button, answer);

//   return wrapper;
// }


// /* ==========================================
//    RENDER FAQS
// ========================================== */

// function renderFaqs(container, faqs) {
//   container.replaceChildren();

//   const list = document.createElement('div');

//   list.className = 'faq-tabs__faq-list';

//   faqs.forEach((faq) => {
//     list.append(createFaq(faq));
//   });

//   container.append(list);
// }


// /* ==========================================
//    RENDER SUB TABS
// ========================================== */

// function renderSubTabs(category, subTabs, faqContainer) {
//   const sidebar = category;

//   sidebar.replaceChildren();

//   subTabs.forEach((subTab, index) => {
//     const button = document.createElement('button');

//     button.type = 'button';
//     button.className = 'faq-tabs__sub-tab';

//     if (index === 0) {
//       button.classList.add('is-active');
//     }

//     const content = document.createElement('span');

//     content.className =
//       'faq-tabs__sub-tab-content';

//     const title = document.createElement('span');

//     title.className =
//       'faq-tabs__sub-tab-title';

//     title.textContent = subTab.title;

//     const count = document.createElement('span');

//     count.className =
//       'faq-tabs__sub-tab-count';

//     count.textContent =
//       `${subTab.faqs.length} ${
//         subTab.faqs.length === 1
//           ? 'Question'
//           : 'Questions'
//       }`;

//     const arrow = document.createElement('span');

//     arrow.className =
//       'faq-tabs__sub-tab-arrow';

//     arrow.textContent = '›';

//     content.append(title, count);

//     button.append(content, arrow);

//     button.addEventListener('click', () => {
//       [...sidebar.children].forEach(
//         (item) => {
//           item.classList.remove('is-active');
//         },
//       );

//       button.classList.add('is-active');

//       renderFaqs(
//         faqContainer,
//         subTab.faqs,
//       );
//     });

//     sidebar.append(button);
//   });

//   if (subTabs[0]) {
//     renderFaqs(
//       faqContainer,
//       subTabs[0].faqs,
//     );
//   }
// }


// /* ==========================================
//    MAIN
// ========================================== */

// export default function decorate(block) {
//   addStyles();

//   const items = getFaqItems(block);

//   if (!items.length) {
//     block.textContent =
//       'No FAQ items available.';

//     return;
//   }

//   const categories = groupFaqs(items);

//   /*
//    * TOP LEVEL TABS
//    */

//   const topTabs =
//     document.createElement('div');

//   topTabs.className =
//     'faq-tabs__top-tabs';

//   /*
//    * MAIN CONTENT
//    */

//   const content =
//     document.createElement('div');

//   content.className =
//     'faq-tabs__content';

//   /*
//    * SIDEBAR
//    */

//   const sidebar =
//     document.createElement('aside');

//   sidebar.className =
//     'faq-tabs__sidebar';

//   const subTabs =
//     document.createElement('div');

//   subTabs.className =
//     'faq-tabs__sub-tabs';

//   sidebar.append(subTabs);

//   /*
//    * FAQ AREA
//    */

//   const faqContainer =
//     document.createElement('main');

//   faqContainer.className =
//     'faq-tabs__faqs';

//   content.append(
//     sidebar,
//     faqContainer,
//   );

//   /*
//    * CREATE TOP TABS
//    */

//   categories.forEach(
//     (category, index) => {
//       const button =
//         document.createElement('button');

//       button.type = 'button';

//       button.className =
//         'faq-tabs__top-tab';

//       button.textContent =
//         category.title;

//       if (index === 0) {
//         button.classList.add(
//           'is-active',
//         );
//       }

//       button.addEventListener(
//         'click',
//         () => {
//           [
//             ...topTabs.children,
//           ].forEach((item) => {
//             item.classList.remove(
//               'is-active',
//             );
//           });

//           button.classList.add(
//             'is-active',
//           );

//           renderSubTabs(
//             subTabs,
//             category.subTabs,
//             faqContainer,
//           );
//         },
//       );

//       topTabs.append(button);
//     },
//   );

//   /*
//    * INITIAL TAB
//    */

//   renderSubTabs(
//     subTabs,
//     categories[0].subTabs,
//     faqContainer,
//   );

//   /*
//    * REPLACE AUTHORING CONTENT
//    */

//   block.replaceChildren(
//     topTabs,
//     content,
//   );
// }
export default function decorate(block) {
}