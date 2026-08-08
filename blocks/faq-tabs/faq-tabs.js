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

import { decorateIcons } from "../../scripts/aem.js";

/**
 * Get HTML content from a cell.
 */
function getCellContent(row, index) {
  const cell = row.children[index];
  return cell ? cell.innerHTML.trim() : "";
}

/**
 * Get plain text content from a cell.
 */
function getCellText(row, index) {
  const cell = row.children[index];
  return cell ? cell.textContent.trim() : "";
}

/**
 * Get icon name from an icon span.
 */
function getIconNameFromCell(row, index) {
  const cell = row.children[index];

  if (!cell) {
    return "";
  }

  const iconSpan = cell.querySelector("span.icon");

  if (!iconSpan) {
    return "";
  }

  const classWithIcon = [...iconSpan.classList].find((className) =>
    className.startsWith("icon-"),
  );

  return classWithIcon
    ? normalizeIconName(classWithIcon.replace("icon-", ""))
    : "";
}

/**
 * Normalize icon name.
 */
function normalizeIconName(rawName) {
  if (!rawName) {
    return "";
  }

  return rawName
    .trim()
    .replace(/^:+|:+$/g, "")
    .replace(/\.svg$/i, "")
    .trim();
}

/**
 * Get individual text lines from a cell.
 */
function getTextLines(cell) {
  if (!cell) {
    return [];
  }

  return cell.textContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Supports:
 * :icon-name: Sub Tab
 */
function extractIconAndSubTab(rawSubTab) {
  const text = (rawSubTab || "").trim();

  const match = text.match(/^:([a-z0-9-]+):\s*(.*)$/i);

  if (!match) {
    return {
      subTab: text,
      iconName: "",
    };
  }

  return {
    subTab: (match[2] || "").trim(),
    iconName: normalizeIconName(match[1]),
  };
}

/**
 * Convert block rows into FAQ data.
 *
 * Supports:
 *
 * 2-column structure:
 *
 * | Top Tab
 *   Sub Tab
 *   Question | Answer
 *
 * And XWalk structure:
 *
 * | Top Tab | Sub Tab | Icon | Question | Answer |
 */
function buildData(rows) {
  const topTabMap = new Map();

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) {
      return;
    }

    const isCompactTwoColumnRow = cells.length === 2;

    let topTab = "";
    let subTab = "";
    let question = "";
    let answer = "";
    let iconName = "";

    /**
     * ---------------------------------------------------------
     * 2 COLUMN STRUCTURE
     * ---------------------------------------------------------
     *
     * Column 1:
     *   Top Tab
     *   Sub Tab
     *   Question
     *
     * Column 2:
     *   Answer
     */
    if (isCompactTwoColumnRow) {
      const lines = getTextLines(cells[0]);

      topTab = lines[0] || "";

      const parsedSubTab = extractIconAndSubTab(lines[1] || "");

      subTab = parsedSubTab.subTab;

      question = lines[2] || "";

      answer = getCellContent(row, 1);

      iconName =
        getIconNameFromCell(row, 0) ||
        parsedSubTab.iconName;
    } else {
      /**
       * -------------------------------------------------------
       * XWALK / MULTI COLUMN STRUCTURE
       * -------------------------------------------------------
       *
       * 4 columns:
       * Top Tab | Sub Tab | Question | Answer
       *
       * 5 columns:
       * Top Tab | Sub Tab | Icon | Question | Answer
       */

      topTab = getCellText(row, 0);

      const parsedSubTab = extractIconAndSubTab(
        getCellText(row, 1),
      );

      subTab = parsedSubTab.subTab;

      const hasIconNameColumn = cells.length >= 5;

      if (hasIconNameColumn) {
        iconName = normalizeIconName(
          getCellText(row, 2),
        );
      }

      const iconFromSubTabCell = getIconNameFromCell(row, 1);

      const iconFromIconColumn = hasIconNameColumn
        ? getIconNameFromCell(row, 2)
        : "";

      if (!iconName && iconFromIconColumn) {
        iconName = iconFromIconColumn;
      }

      if (!iconName && iconFromSubTabCell) {
        iconName = iconFromSubTabCell;
      }

      if (!iconName) {
        iconName = parsedSubTab.iconName;
      }

      question = getCellText(
        row,
        hasIconNameColumn ? 3 : 2,
      );

      answer = getCellContent(
        row,
        hasIconNameColumn ? 4 : 3,
      );
    }

    /**
     * Ignore incomplete rows.
     */
    if (!topTab || !subTab || !question) {
      return;
    }

    /**
     * Create top-level tab.
     */
    if (!topTabMap.has(topTab)) {
      topTabMap.set(topTab, new Map());
    }

    const subTabMap = topTabMap.get(topTab);

    /**
     * Create sub-tab.
     */
    if (!subTabMap.has(subTab)) {
      subTabMap.set(subTab, {
        iconName,
        items: [],
      });
    }

    const subTabData = subTabMap.get(subTab);

    if (iconName && !subTabData.iconName) {
      subTabData.iconName = iconName;
    }

    /**
     * Add FAQ.
     */
    subTabData.items.push({
      question,
      answer,
    });
  });

  /**
   * Convert Map to normal array.
   */
  return [...topTabMap.entries()].map(
    ([topTab, subTabMap]) => ({
      topTab,

      subTabs: [...subTabMap.entries()].map(
        ([name, subTabData]) => ({
          name,
          iconName: subTabData.iconName,
          items: subTabData.items,
        }),
      ),
    }),
  );
}

/**
 * Render sub tabs.
 */
function renderSubTabList(
  subTabListEl,
  topTabData,
  onSelectSubTab,
  activeSubTabIndex,
) {
  subTabListEl.textContent = "";

  topTabData.subTabs.forEach((subTab, index) => {
    const button = document.createElement("button");

    button.className = "faq-tabs-subtab";
    button.type = "button";

    if (index === activeSubTabIndex) {
      button.classList.add("is-active");
    }

    const icon = document.createElement("span");

    icon.className = "faq-tabs-subtab-icon";
    icon.setAttribute("aria-hidden", "true");

    if (subTab.iconName) {
      const iconToken = document.createElement("span");

      iconToken.className =
        `icon icon-${subTab.iconName}`;

      icon.append(iconToken);
    } else {
      icon.classList.add("is-placeholder");
    }

    const text = document.createElement("span");

    text.className = "faq-tabs-subtab-text";

    const label = document.createElement("span");

    label.className = "faq-tabs-subtab-label";
    label.textContent = subTab.name;

    const count = document.createElement("span");

    count.className = "faq-tabs-subtab-count";
    count.textContent =
      `${subTab.items.length} Questions`;

    const chevron = document.createElement("span");

    chevron.className = "faq-tabs-subtab-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = ">";

    text.append(label, count);

    button.append(
      icon,
      text,
      chevron,
    );

    button.addEventListener("click", () => {
      onSelectSubTab(index);
    });

    subTabListEl.append(button);
  });

  decorateIcons(subTabListEl);

  subTabListEl
    .querySelectorAll(
      ".faq-tabs-subtab-icon .icon img",
    )
    .forEach((img) => {
      img.addEventListener("error", () => {
        const icon = img.closest(
          ".faq-tabs-subtab-icon",
        );

        if (icon) {
          icon.classList.add("is-placeholder");
        }

        img.closest(".icon")?.remove();
      });
    });
}

/**
 * Render FAQ questions and answers.
 */
function renderFaqItems(faqListEl, subTabData) {
  faqListEl.textContent = "";

  if (!subTabData) {
    return;
  }

  subTabData.items.forEach((item, index) => {
    const details = document.createElement("details");

    details.className = "faq-tabs-item";

    if (index === 0) {
      details.open = true;
    }

    const summary = document.createElement("summary");

    summary.className = "faq-tabs-question";
    summary.textContent = item.question;

    const answer = document.createElement("div");

    answer.className = "faq-tabs-answer";
    answer.innerHTML = item.answer || "";

    details.append(
      summary,
      answer,
    );

    faqListEl.append(details);
  });
}

/**
 * FAQ Tabs block.
 */
// export default function decorate(block) {
//   const isAuthorHost =
//     window.location.hostname.includes("author-");

//   const isWcmDisabled =
//     new URLSearchParams(
//       window.location.search,
//     ).get("wcmmode") === "disabled";

//   const isAuthoringMode =
//     isAuthorHost && !isWcmDisabled;

//   /**
//    * IMPORTANT:
//    *
//    * Your block can have 2 columns in the authoring UI.
//    * Therefore do NOT use >= 4 here.
//    */
//   const initialRows = [...block.children].filter(
//     (row) => row.children.length >= 2,
//   );

//   const staticFaqData = buildData(initialRows);

//   let activeTopTabIndex = 0;
//   let activeSubTabIndex = 0;

//   /**
//    * Top tabs.
//    */
//   const topTabList = document.createElement("div");

//   topTabList.className = "faq-tabs-top-list";
//   topTabList.setAttribute("role", "tablist");

//   /**
//    * Content wrapper.
//    */
//   const content = document.createElement("div");

//   content.className = "faq-tabs-content";

//   /**
//    * Sub tabs.
//    */
//   const subTabList = document.createElement("aside");

//   subTabList.className = "faq-tabs-sub-list";

//   /**
//    * FAQ panel.
//    */
//   const faqPanel = document.createElement("section");

//   faqPanel.className = "faq-tabs-faq-panel";

//   /**
//    * FAQ list.
//    */
//   const faqList = document.createElement("div");

//   faqList.className = "faq-tabs-faq-list";

//   faqPanel.append(faqList);

//   /**
//    * Rendered UI container.
//    */
//   const uiContainer = document.createElement("div");

//   uiContainer.className = "faq-tabs-rendered-ui";

//   uiContainer.append(
//     topTabList,
//     content,
//   );

//   /**
//    * Get FAQ data.
//    *
//    * Authoring:
//    * Read current rows directly from block.
//    *
//    * Publish:
//    * Use the initial data captured before replacing
//    * the block content.
//    */
//   function getFaqData() {
//     if (isAuthoringMode) {
//       const liveRows = [...block.children].filter(
//         (row) =>
//           row !== uiContainer &&
//           row.nodeType === Node.ELEMENT_NODE &&
//           row.children.length >= 2,
//       );

//       return buildData(liveRows);
//     }

//     return staticFaqData;
//   }

//   /**
//    * Render top tabs.
//    */
//   function renderTopTabs() {
//     const faqData = getFaqData();

//     /**
//      * No FAQ data.
//      */
//     if (!faqData.length) {
//       topTabList.textContent = "";
//       subTabList.textContent = "";
//       faqList.textContent = "";

//       return;
//     }

//     /**
//      * Protect indexes.
//      */
//     if (activeTopTabIndex >= faqData.length) {
//       activeTopTabIndex = 0;
//     }

//     const currentTopTab =
//       faqData[activeTopTabIndex];

//     if (
//       !currentTopTab.subTabs.length
//     ) {
//       topTabList.textContent = "";
//       subTabList.textContent = "";
//       faqList.textContent = "";

//       return;
//     }

//     if (
//       activeSubTabIndex >=
//       currentTopTab.subTabs.length
//     ) {
//       activeSubTabIndex = 0;
//     }

//     /**
//      * Clear old top tabs.
//      */
//     topTabList.textContent = "";

//     /**
//      * Create top tabs.
//      */
//     faqData.forEach((entry, index) => {
//       const button =
//         document.createElement("button");

//       button.type = "button";

//       button.className =
//         "faq-tabs-top-tab";

//       button.setAttribute(
//         "role",
//         "tab",
//       );

//       button.setAttribute(
//         "aria-selected",
//         index === activeTopTabIndex
//           ? "true"
//           : "false",
//       );

//       button.textContent =
//         entry.topTab;

//       button.addEventListener(
//         "click",
//         () => {
//           activeTopTabIndex = index;
//           activeSubTabIndex = 0;

//           render();
//         },
//       );

//       topTabList.append(button);
//     });

//     /**
//      * Current selected tab.
//      */
//     const latestTopTab =
//       faqData[activeTopTabIndex];

//     const latestSubTab =
//       latestTopTab.subTabs[
//         activeSubTabIndex
//       ];

//     /**
//      * Render sub tabs.
//      */
//     renderSubTabList(
//       subTabList,
//       latestTopTab,
//       (subTabIndex) => {
//         activeSubTabIndex =
//           subTabIndex;

//         render();
//       },
//       activeSubTabIndex,
//     );

//     /**
//      * Render FAQs.
//      */
//     renderFaqItems(
//       faqList,
//       latestSubTab,
//     );
//   }

//   /**
//    * Render everything.
//    */
//   function render() {
//     renderTopTabs();
//   }

//   /**
//    * Put sub tab and FAQ panel inside content.
//    */
//   content.append(
//     subTabList,
//     faqPanel,
//   );

//   /**
//    * ---------------------------------------------------------
//    * AUTHORING MODE
//    * ---------------------------------------------------------
//    */
//   if (isAuthoringMode) {
//     block.classList.add("is-authoring");

//     /**
//      * IMPORTANT:
//      * Do NOT remove the original authoring rows.
//      *
//      * This allows the author to continue adding/removing
//      * FAQ items using the AEM authoring UI.
//      */
//     if (!block.contains(uiContainer)) {
//       block.append(uiContainer);
//     }

//     /**
//      * Watch authoring changes.
//      */
//     const observer =
//       new MutationObserver(
//         (mutations) => {
//           const hasRowChange =
//             mutations.some(
//               (mutation) =>
//                 [
//                   ...mutation.addedNodes,
//                   ...mutation.removedNodes,
//                 ].some(
//                   (node) =>
//                     node !== uiContainer &&
//                     node.nodeType ===
//                       Node.ELEMENT_NODE,
//                 ),
//             );

//           if (hasRowChange) {
//             render();
//           }
//         },
//       );

//     observer.observe(block, {
//       childList: true,
//     });
//   } else {
//     /**
//      * -------------------------------------------------------
//      * PUBLISH MODE
//      * -------------------------------------------------------
//      *
//      * Remove authoring table and show only the UI.
//      */
//     block.textContent = "";

//     block.append(uiContainer);
//   }

//   /**
//    * Initial render.
//    */
//   render();
// }

export default function decorate(block) {
  const isAuthorHost =
    window.location.hostname.includes("author-");

  const isWcmDisabled =
    new URLSearchParams(window.location.search).get("wcmmode") ===
    "disabled";

  const isAuthoringMode =
    isAuthorHost && !isWcmDisabled;

  /*
   * ==========================================================
   * AUTHORING MODE
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Do NOT modify the block DOM here.
   *
   * AEM Universal Editor needs the original
   * faq-tabs-item structure for:
   *
   * - editing
   * - adding items
   * - deleting items
   * - opening the model
   * - showing the fields
   *
   * The final FAQ UI is only required outside authoring.
   */
  if (isAuthoringMode) {
    block.classList.add("is-authoring");

    return;
  }

  /*
   * ==========================================================
   * PUBLISHED / PREVIEW MODE
   * ==========================================================
   */

  const rows = [...block.children].filter(
    (row) => row.children.length >= 2,
  );

  const faqData = buildData(rows);

  let activeTopTabIndex = 0;
  let activeSubTabIndex = 0;

  /*
   * Top tabs
   */
  const topTabList = document.createElement("div");

  topTabList.className =
    "faq-tabs-top-list";

  topTabList.setAttribute(
    "role",
    "tablist",
  );

  /*
   * Main content
   */
  const content = document.createElement("div");

  content.className =
    "faq-tabs-content";

  /*
   * Sub tabs
   */
  const subTabList =
    document.createElement("aside");

  subTabList.className =
    "faq-tabs-sub-list";

  /*
   * FAQ panel
   */
  const faqPanel =
    document.createElement("section");

  faqPanel.className =
    "faq-tabs-faq-panel";

  /*
   * FAQ list
   */
  const faqList =
    document.createElement("div");

  faqList.className =
    "faq-tabs-faq-list";

  faqPanel.append(faqList);

  /*
   * Main rendered UI
   */
  const uiContainer =
    document.createElement("div");

  uiContainer.className =
    "faq-tabs-rendered-ui";

  content.append(
    subTabList,
    faqPanel,
  );

  uiContainer.append(
    topTabList,
    content,
  );

  /*
   * No data
   */
  if (!faqData.length) {
    block.textContent = "";
    block.append(uiContainer);

    return;
  }

  /*
   * Make sure indexes are valid.
   */
  if (
    activeTopTabIndex >= faqData.length
  ) {
    activeTopTabIndex = 0;
  }

  const currentTopTab =
    faqData[activeTopTabIndex];

  if (
    activeSubTabIndex >=
    currentTopTab.subTabs.length
  ) {
    activeSubTabIndex = 0;
  }

  /*
   * Render top tabs.
   */
  function renderTopTabs() {
    topTabList.textContent = "";

    faqData.forEach(
      (entry, index) => {
        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "faq-tabs-top-tab";

        button.setAttribute(
          "role",
          "tab",
        );

        button.setAttribute(
          "aria-selected",
          index === activeTopTabIndex
            ? "true"
            : "false",
        );

        button.textContent =
          entry.topTab;

        button.addEventListener(
          "click",
          () => {
            activeTopTabIndex = index;
            activeSubTabIndex = 0;

            render();
          },
        );

        topTabList.append(button);
      },
    );
  }

  /*
   * Render current content.
   */
  function renderCurrentContent() {
    const currentTopTab =
      faqData[activeTopTabIndex];

    if (!currentTopTab) {
      return;
    }

    if (
      activeSubTabIndex >=
      currentTopTab.subTabs.length
    ) {
      activeSubTabIndex = 0;
    }

    const currentSubTab =
      currentTopTab.subTabs[
        activeSubTabIndex
      ];

    /*
     * Render sub tabs.
     */
    renderSubTabList(
      subTabList,
      currentTopTab,
      (subTabIndex) => {
        activeSubTabIndex =
          subTabIndex;

        render();
      },
      activeSubTabIndex,
    );

    /*
     * Render FAQs.
     */
    renderFaqItems(
      faqList,
      currentSubTab,
    );
  }

  /*
   * Render everything.
   */
  function render() {
    renderTopTabs();
    renderCurrentContent();
  }

  /*
   * Replace original AEM block content
   * ONLY in published/preview mode.
   */
  block.textContent = "";

  block.append(uiContainer);

  /*
   * Initial render.
   */
  render();
}