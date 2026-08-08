// import { decorateIcons } from "../../scripts/aem.js";

// function getCellContent(row, index) {
//   const cell = row.children[index];
//   return cell ? cell.innerHTML.trim() : "";
// }

// function getCellText(row, index) {
//   const cell = row.children[index];
//   return cell ? cell.textContent.trim() : "";
// }

// function getIconNameFromCell(row, index) {
//   const cell = row.children[index];
//   if (!cell) {
//     return "";
//   }

//   const iconSpan = cell.querySelector("span.icon");
//   if (!iconSpan) {
//     return "";
//   }

//   const classWithIcon = [...iconSpan.classList].find((className) =>
//     className.startsWith("icon-"),
//   );
//   return classWithIcon
//     ? normalizeIconName(classWithIcon.replace("icon-", ""))
//     : "";
// }

// function normalizeIconName(rawName) {
//   if (!rawName) {
//     return "";
//   }

//   return rawName
//     .trim()
//     .replace(/^:+|:+$/g, "")
//     .replace(/\.svg$/i, "")
//     .trim();
// }

// function getTextLines(cell) {
//   if (!cell) {
//     return [];
//   }

//   return cell.textContent
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);
// }

// function extractIconAndSubTab(rawSubTab) {
//   const text = (rawSubTab || "").trim();
//   const match = text.match(/^:([a-z0-9-]+):\s*(.*)$/i);

//   if (!match) {
//     return {
//       subTab: text,
//       iconName: "",
//     };
//   }

//   return {
//     subTab: (match[2] || "").trim(),
//     iconName: normalizeIconName(match[1]),
//   };
// }

// function buildData(rows) {
//   const topTabMap = new Map();

//   rows.forEach((row) => {
//     const cells = [...row.children];
//     const isCompactTwoColumnRow = cells.length === 2;

//     let topTab = "";
//     let subTab = "";
//     let question = "";
//     let answer = "";
//     let iconName = "";

//     if (isCompactTwoColumnRow) {
//       const lines = getTextLines(cells[0]);
//       topTab = lines[0] || "";
//       const parsedSubTab = extractIconAndSubTab(lines[1] || "");
//       subTab = parsedSubTab.subTab;
//       question = lines[2] || "";
//       answer = getCellContent(row, 1);
//       iconName = getIconNameFromCell(row, 0) || parsedSubTab.iconName;
//     } else {
//       topTab = getCellText(row, 0);
//       const parsedSubTab = extractIconAndSubTab(getCellText(row, 1));
//       subTab = parsedSubTab.subTab;
//       const hasIconNameColumn = cells.length >= 5;
//       iconName = hasIconNameColumn
//         ? normalizeIconName(getCellText(row, 2))
//         : "";
//       const iconFromSubTabCell = getIconNameFromCell(row, 1);
//       const iconFromIconColumn = hasIconNameColumn
//         ? getIconNameFromCell(row, 2)
//         : "";

//       if (!iconName && iconFromIconColumn) {
//         iconName = iconFromIconColumn;
//       }

//       if (!iconName && iconFromSubTabCell) {
//         iconName = iconFromSubTabCell;
//       }

//       if (!iconName) {
//         iconName = parsedSubTab.iconName;
//       }

//       question = getCellText(row, hasIconNameColumn ? 3 : 2);
//       answer = getCellContent(row, hasIconNameColumn ? 4 : 3);

//       // Fallback for older/mixed row structures where icon column is not emitted.
//       if (hasIconNameColumn && !question && !answer) {
//         question = getCellText(row, 2);
//         answer = getCellContent(row, 3);
//       }
//     }

//     if (!topTab || !subTab || !question) {
//       return;
//     }

//     if (!topTabMap.has(topTab)) {
//       topTabMap.set(topTab, new Map());
//     }

//     const subTabMap = topTabMap.get(topTab);
//     if (!subTabMap.has(subTab)) {
//       subTabMap.set(subTab, {
//         iconName,
//         items: [],
//       });
//     }

//     const subTabData = subTabMap.get(subTab);
//     if (iconName && !subTabData.iconName) {
//       subTabData.iconName = iconName;
//     }

//     subTabData.items.push({
//       question,
//       answer,
//     });
//   });

//   return [...topTabMap.entries()].map(([topTab, subTabMap]) => ({
//     topTab,
//     subTabs: [...subTabMap.entries()].map(([name, subTabData]) => ({
//       name,
//       iconName: subTabData.iconName,
//       items: subTabData.items,
//     })),
//   }));
// }

// function renderSubTabList(
//   subTabListEl,
//   topTabData,
//   onSelectSubTab,
//   activeSubTabIndex,
// ) {
//   subTabListEl.textContent = "";

//   topTabData.subTabs.forEach((subTab, index) => {
//     const button = document.createElement("button");
//     button.className = "faq-tabs-subtab";
//     if (index === activeSubTabIndex) {
//       button.classList.add("is-active");
//     }
//     button.type = "button";

//     const icon = document.createElement("span");
//     icon.className = "faq-tabs-subtab-icon";
//     icon.setAttribute("aria-hidden", "true");
//     if (subTab.iconName) {
//       const iconToken = document.createElement("span");
//       iconToken.className = `icon icon-${subTab.iconName}`;
//       icon.append(iconToken);
//     } else {
//       icon.classList.add("is-placeholder");
//     }

//     const text = document.createElement("span");
//     text.className = "faq-tabs-subtab-text";

//     const label = document.createElement("span");
//     label.className = "faq-tabs-subtab-label";
//     label.textContent = subTab.name;

//     const count = document.createElement("span");
//     count.className = "faq-tabs-subtab-count";
//     count.textContent = `${subTab.items.length} Questions`;

//     const chevron = document.createElement("span");
//     chevron.className = "faq-tabs-subtab-chevron";
//     chevron.setAttribute("aria-hidden", "true");
//     chevron.textContent = ">";

//     text.append(label, count);
//     button.append(icon, text, chevron);
//     button.addEventListener("click", () => onSelectSubTab(index));

//     subTabListEl.append(button);
//   });

//   decorateIcons(subTabListEl);
//   subTabListEl
//     .querySelectorAll(".faq-tabs-subtab-icon .icon img")
//     .forEach((img) => {
//       img.addEventListener("error", () => {
//         const icon = img.closest(".faq-tabs-subtab-icon");
//         if (icon) {
//           icon.classList.add("is-placeholder");
//         }
//         img.closest(".icon")?.remove();
//       });
//     });
// }

// function renderFaqItems(faqListEl, subTabData) {
//   faqListEl.textContent = "";

//   subTabData.items.forEach((item, index) => {
//     const details = document.createElement("details");
//     details.className = "faq-tabs-item";
//     if (index === 0) {
//       details.open = true;
//     }

//     const summary = document.createElement("summary");
//     summary.className = "faq-tabs-question";
//     summary.textContent = item.question;

//     const answer = document.createElement("div");
//     answer.className = "faq-tabs-answer";
//     answer.innerHTML = item.answer || "";

//     details.append(summary, answer);
//     faqListEl.append(details);
//   });
// }

// export default function decorate(block) {
//   const isAuthorHost = window.location.hostname.includes("author-");
//   const isWcmDisabled =
//     new URLSearchParams(window.location.search).get("wcmmode") === "disabled";
//   const isAuthoringMode = isAuthorHost && !isWcmDisabled;
//   const initialRows = [...block.children].filter(
//     (row) => row.children.length >= 4,
//   );
//   const staticFaqData = buildData(initialRows);

//   let activeTopTabIndex = 0;
//   let activeSubTabIndex = 0;

//   const topTabList = document.createElement("div");
//   topTabList.className = "faq-tabs-top-list";
//   topTabList.setAttribute("role", "tablist");

//   const content = document.createElement("div");
//   content.className = "faq-tabs-content";

//   const subTabList = document.createElement("aside");
//   subTabList.className = "faq-tabs-sub-list";

//   const faqPanel = document.createElement("section");
//   faqPanel.className = "faq-tabs-faq-panel";

//   const faqList = document.createElement("div");
//   faqList.className = "faq-tabs-faq-list";
//   faqPanel.append(faqList);

//   const uiContainer = document.createElement("div");
//   uiContainer.className = "faq-tabs-rendered-ui";
//   uiContainer.append(topTabList, content);

//   function getFaqData() {
//     if (isAuthoringMode) {
//       const liveRows = [...block.children].filter(
//         (row) => row !== uiContainer && row.children.length >= 4,
//       );
//       return buildData(liveRows);
//     }

//     return staticFaqData;
//   }

//   function renderTopTabs() {
//     const faqData = getFaqData();

//     if (!faqData.length) {
//       topTabList.textContent = "";
//       subTabList.textContent = "";
//       faqList.textContent = "";
//       return;
//     }

//     if (activeTopTabIndex >= faqData.length) {
//       activeTopTabIndex = 0;
//     }

//     const currentTopTab = faqData[activeTopTabIndex];
//     if (activeSubTabIndex >= currentTopTab.subTabs.length) {
//       activeSubTabIndex = 0;
//     }

//     topTabList.textContent = "";

//     faqData.forEach((entry, index) => {
//       const button = document.createElement("button");
//       button.type = "button";
//       button.className = "faq-tabs-top-tab";
//       button.setAttribute("role", "tab");
//       button.setAttribute("aria-selected", index === activeTopTabIndex);
//       button.textContent = entry.topTab;

//       button.addEventListener("click", () => {
//         activeTopTabIndex = index;
//         activeSubTabIndex = 0;
//         render();
//       });

//       topTabList.append(button);
//     });

//     const latestTopTab = faqData[activeTopTabIndex];
//     const latestSubTab = latestTopTab.subTabs[activeSubTabIndex];

//     renderSubTabList(
//       subTabList,
//       latestTopTab,
//       (subTabIndex) => {
//         activeSubTabIndex = subTabIndex;
//         render();
//       },
//       activeSubTabIndex,
//     );
//     renderFaqItems(faqList, latestSubTab);
//   }

//   function render() {
//     renderTopTabs();
//   }

//   content.append(subTabList, faqPanel);

//   if (isAuthoringMode) {
//     block.classList.add("is-authoring");
//     if (!block.contains(uiContainer)) {
//       block.append(uiContainer);
//     }

//     const observer = new MutationObserver((mutations) => {
//       const hasRowChange = mutations.some((mutation) =>
//         [...mutation.addedNodes, ...mutation.removedNodes].some(
//           (node) => node !== uiContainer && node.nodeType === Node.ELEMENT_NODE,
//         ),
//       );

//       if (hasRowChange) {
//         render();
//       }
//     });

//     observer.observe(block, { childList: true });
//   } else {
//     block.textContent = "";
//     block.append(uiContainer);
//   }

//   render();
// }


export default function decorate(block) {
  // 1. Extract and Parse the Data
  const rawRows = [...block.children];
  const faqData = {};

  rawRows.forEach((row) => {
    const col1 = row.children[0];
    const col2 = row.children[1];

    if (col1 && col2) {
      // Based on your model: type, sub-type, icon, question
      const type = col1.children[0]?.textContent.trim();
      const subType = col1.children[1]?.textContent.trim();
      const icon = col1.children[2]?.cloneNode(true); 
      const question = col1.children[3]?.textContent.trim();
      
      // Answer is in col2
      const answer = col2.innerHTML;

      // Initialize groupings if they don't exist
      if (!faqData[type]) faqData[type] = {};
      if (!faqData[type][subType]) {
        faqData[type][subType] = {
          icon: icon,
          faqs: []
        };
      }

      faqData[type][subType].faqs.push({ question, answer });
    }
  });

  // 2. Clear original block content
  block.innerHTML = '';

  // 3. Build UI Containers
  const topTabsContainer = document.createElement('div');
  topTabsContainer.className = 'faq-top-tabs';
  
  const mainContentContainer = document.createElement('div');
  mainContentContainer.className = 'faq-main-content';

  block.append(topTabsContainer, mainContentContainer);

  let isFirstTopTab = true;

  // 4. Render Top Tabs and their respective content
  Object.keys(faqData).forEach((type) => {
    // Create Top Tab Button
    const topTabBtn = document.createElement('button');
    topTabBtn.className = 'faq-top-tab-btn';
    topTabBtn.textContent = type;
    if (isFirstTopTab) topTabBtn.classList.add('active');
    topTabsContainer.append(topTabBtn);

    // Create container for this top tab's sub-content (Sidebar + Accordion)
    const typeContent = document.createElement('div');
    typeContent.className = 'faq-type-content';
    if (!isFirstTopTab) typeContent.style.display = 'none';
    mainContentContainer.append(typeContent);

    // Sidebar for Sub Tabs
    const sidebar = document.createElement('div');
    sidebar.className = 'faq-sidebar';
    
    // Accordion Area for FAQs
    const accordionArea = document.createElement('div');
    accordionArea.className = 'faq-accordion-area';

    typeContent.append(sidebar, accordionArea);

    let isFirstSubTab = true;
    const subTypes = faqData[type];

    // 5. Render Sub Tabs and FAQ Accordions
    Object.keys(subTypes).forEach((subType) => {
      const subTypeData = subTypes[subType];

      // Create Sub Tab Button
      const subTabBtn = document.createElement('button');
      subTabBtn.className = 'faq-sub-tab-btn';
      if (isFirstSubTab) subTabBtn.classList.add('active');
      
      const subTabDetails = document.createElement('div');
      subTabDetails.className = 'faq-sub-tab-details';
      subTabDetails.innerHTML = `<strong>${subType}</strong><span>${subTypeData.faqs.length} Questions</span>`;

      if (subTypeData.icon) subTabBtn.append(subTypeData.icon);
      subTabBtn.append(subTabDetails);
      sidebar.append(subTabBtn);

      // Create Accordion Container for this Sub Tab
      const subTypeAccordion = document.createElement('div');
      subTypeAccordion.className = 'faq-accordion';
      if (!isFirstSubTab) subTypeAccordion.style.display = 'none';
      accordionArea.append(subTypeAccordion);

      // Create Individual FAQs
      subTypeData.faqs.forEach((faq) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
          <button class="faq-question">
            <span>${faq.question}</span>
            <span class="faq-icon-plus">+</span>
          </button>
          <div class="faq-answer" style="display: none;">
            ${faq.answer}
          </div>
        `;
        subTypeAccordion.append(faqItem);

        // Accordion Toggle Logic
        const questionBtn = faqItem.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
          const answerDiv = faqItem.querySelector('.faq-answer');
          const isOpen = answerDiv.style.display === 'block';
          answerDiv.style.display = isOpen ? 'none' : 'block';
          questionBtn.querySelector('.faq-icon-plus').textContent = isOpen ? '+' : '-';
          faqItem.classList.toggle('active', !isOpen);
        });
      });

      // Sub Tab Click Logic
      subTabBtn.addEventListener('click', () => {
        // Reset sub tabs
        sidebar.querySelectorAll('.faq-sub-tab-btn').forEach(btn => btn.classList.remove('active'));
        accordionArea.querySelectorAll('.faq-accordion').forEach(acc => acc.style.display = 'none');
        
        // Activate current
        subTabBtn.classList.add('active');
        subTypeAccordion.style.display = 'block';
      });

      isFirstSubTab = false;
    });

    // Top Tab Click Logic
    topTabBtn.addEventListener('click', () => {
      // Reset top tabs
      topTabsContainer.querySelectorAll('.faq-top-tab-btn').forEach(btn => btn.classList.remove('active'));
      mainContentContainer.querySelectorAll('.faq-type-content').forEach(content => content.style.display = 'none');
      
      // Activate current
      topTabBtn.classList.add('active');
      typeContent.style.display = 'flex'; // Use flex to position sidebar and accordion side-by-side
    });

    isFirstTopTab = false;
  });
}