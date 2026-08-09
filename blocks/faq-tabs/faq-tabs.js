import { decorateIcons } from "../../scripts/aem.js";
import { button, div, domEl, img, span } from "../../scripts/dom-helpers.js";

const MAX_VISIBLE_FAQS = 5;
const PLUS_ICON_SRC = "/icons/plus-icon.svg";
const MINUS_ICON_SRC = "/icons/minus-icon.svg";
const VIEW_ALL_ICON_SRC = "/icons/right-arrow-red.svg";
const SIDEBAR_ARROW_ICON_SRC = "/icons/tab-arrow-left.svg";

function getCellContent(row, index) {
  const cell = row.children[index];
  return cell ? cell.innerHTML.trim() : "";
}

function getCellText(row, index) {
  const cell = row.children[index];
  return cell ? cell.textContent.trim() : "";
}

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

function getLabeledValueFromRow(row, labels) {
  const allNodes = [row, ...row.querySelectorAll("*")];
  for (const node of allNodes) {
    const text = (node.textContent || "").trim();
    for (const label of labels) {
      if (text.toLowerCase().startsWith(`${label.toLowerCase()}:`)) {
        return text.slice(label.length + 1).trim();
      }
    }
  }

  return "";
}

function extractRowData(row) {
  const cells = [...row.children];

  if (cells.length === 2) {
    const contentCell = cells[0];
    const answerCell = cells[1];
    const contentLines = [...contentCell.querySelectorAll("p")]
      .map((p) => p.textContent.trim())
      .filter(Boolean);

    const topTab = contentLines[0] || "";
    const parsedSubTab = extractIconAndSubTab(contentLines[1] || "");
    const subTab = parsedSubTab.subTab;
    const question = contentLines[2] || "";
    const answer = answerCell ? answerCell.innerHTML.trim() : "";
    const iconName =
      normalizeIconName(getIconNameFromCell(row, 0)) || parsedSubTab.iconName;

    return {
      topTab,
      subTab,
      iconName,
      question,
      answer,
    };
  }

  if (cells.length >= 4) {
    const topTab = getCellText(row, 0);
    const parsedSubTab = extractIconAndSubTab(getCellText(row, 1));
    const subTab = parsedSubTab.subTab;
    const hasIconNameColumn = cells.length >= 5;
    let iconName = hasIconNameColumn
      ? normalizeIconName(getCellText(row, 2))
      : "";
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

    let question = getCellText(row, hasIconNameColumn ? 3 : 2);
    let answer = getCellContent(row, hasIconNameColumn ? 4 : 3);

    if (hasIconNameColumn && !question && !answer) {
      question = getCellText(row, 2);
      answer = getCellContent(row, 3);
    }

    return {
      topTab,
      subTab,
      iconName,
      question,
      answer,
    };
  }

  const topTab = getLabeledValueFromRow(row, [
    "Top Level Tab",
    "Top Tab",
    "Tab",
  ]);
  const subTabRaw = getLabeledValueFromRow(row, ["Sub Tab", "Subtab"]);
  const parsedSubTab = extractIconAndSubTab(subTabRaw);
  const subTab = parsedSubTab.subTab;
  const iconName =
    normalizeIconName(getLabeledValueFromRow(row, ["Icon Name", "Icon"])) ||
    parsedSubTab.iconName;
  const question = getLabeledValueFromRow(row, ["Question", "Heading"]);
  const answer = getLabeledValueFromRow(row, ["Answer", "Body"]);

  return {
    topTab,
    subTab,
    iconName,
    question,
    answer,
  };
}

function getItemScopedRows(rows) {
  const itemRows = rows.filter((row) => {
    const resource = (row.dataset.aueResource || "").toLowerCase();
    return resource.includes("faq-tabs-item");
  });

  return itemRows.length ? itemRows : rows;
}

function buildData(rows) {
  const topTabMap = new Map();

  rows.forEach((row) => {
    const { topTab, subTab, iconName, question, answer } = extractRowData(row);

    if (!topTab || !subTab || !question) {
      return;
    }

    if (!topTabMap.has(topTab)) {
      topTabMap.set(topTab, new Map());
    }

    const subTabMap = topTabMap.get(topTab);
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

    subTabData.items.push({
      question,
      answer,
    });
  });

  return [...topTabMap.entries()].map(([topTab, subTabMap]) => ({
    topTab,
    subTabs: [...subTabMap.entries()].map(([name, subTabData]) => ({
      name,
      iconName: subTabData.iconName,
      items: subTabData.items,
    })),
  }));
}

function renderSubTabList(
  subTabListEl,
  topTabData,
  onSelectSubTab,
  activeSubTabIndex,
) {
  subTabListEl.textContent = "";

  topTabData.subTabs.forEach((subTab, index) => {
    const subTabButton = button({
      class: "faq-tabs-subtab",
      type: "button",
    });
    if (index === activeSubTabIndex) {
      subTabButton.classList.add("active");
    }

    const icon = span({
      class: "faq-tabs-subtab-icon",
      "aria-hidden": "true",
    });
    if (subTab.iconName) {
      const iconToken = span({ class: `icon icon-${subTab.iconName}` });
      icon.append(iconToken);
    } else {
      icon.classList.add("is-placeholder");
    }

    const text = span({ class: "faq-tabs-subtab-text" });

    const label = span({ class: "faq-tabs-subtab-label" }, subTab.name);

    const count = span(
      { class: "faq-tabs-subtab-count" },
      `${subTab.items.length} Questions`,
    );

    const chevron = span({
      class: "faq-tabs-subtab-chevron",
      "aria-hidden": "true",
    });
    const chevronIcon = img({
      class: "faq-tabs-subtab-arrow",
      src:
        index === activeSubTabIndex
          ? VIEW_ALL_ICON_SRC
          : SIDEBAR_ARROW_ICON_SRC,
      alt: "",
      width: "14",
      height: "14",
    });
    chevron.append(chevronIcon);

    text.append(label, count);
    subTabButton.append(icon, text, chevron);
    subTabButton.addEventListener("click", () => onSelectSubTab(index));

    subTabListEl.append(subTabButton);
  });

  decorateIcons(subTabListEl);
  subTabListEl
    .querySelectorAll(".faq-tabs-subtab-icon .icon img")
    .forEach((img) => {
      img.addEventListener("error", () => {
        const icon = img.closest(".faq-tabs-subtab-icon");
        if (icon) {
          icon.classList.add("is-placeholder");
        }
        img.closest(".icon")?.remove();
      });
    });
}

function renderFaqItems(faqListEl, subTabData) {
  faqListEl.textContent = "";

  const canToggleMore = subTabData.items.length > MAX_VISIBLE_FAQS;
  const visibleItems = canToggleMore
    ? subTabData.items.slice(0, MAX_VISIBLE_FAQS)
    : subTabData.items;

  let isExpanded = false;

  function drawFaqItems() {
    faqListEl.textContent = "";

    const itemsToRender = isExpanded ? subTabData.items : visibleItems;
    itemsToRender.forEach((item, index) => {
      const details = domEl("details", { class: "faq-tabs-item" });
      if (index === 0) {
        details.open = true;
      }

      const summary = domEl(
        "summary",
        { class: "faq-tabs-question" },
        item.question,
      );

      const answer = div({ class: "faq-tabs-answer" });
      answer.innerHTML = item.answer || "";

      details.append(summary, answer);
      faqListEl.append(details);
    });

    if (!canToggleMore) {
      return;
    }

    const toggleLabel = isExpanded ? "Show Less" : "Show More";
    const toggleButton = button(
      {
        class: `faq-tabs-show-more-btn${isExpanded ? " is-expanded" : ""}`,
        type: "button",
      },
      span({ class: "faq-tabs-show-more-text" }, toggleLabel),
      img({
        class: "faq-tabs-show-more-icon",
        src: VIEW_ALL_ICON_SRC,
        alt: "",
        width: "14",
        height: "14",
      }),
    );

    toggleButton.addEventListener("click", () => {
      isExpanded = !isExpanded;
      drawFaqItems();
    });

    faqListEl.append(toggleButton);
  }

  drawFaqItems();
}

export default function decorate(block) {
  const isAuthorHost = window.location.hostname.includes("author-");
  const isWcmDisabled =
    new URLSearchParams(window.location.search).get("wcmmode") === "disabled";
  const isAuthoringMode = isAuthorHost && !isWcmDisabled;
  const initialRows = getItemScopedRows(
    [...block.children].filter((row) => row.children.length >= 1),
  );
  const staticFaqData = buildData(initialRows);

  let activeTopTabIndex = 0;
  let activeSubTabIndex = 0;

  const topTabList = div({ class: "faq-tabs-top-list", role: "tablist" });

  const topTabNavWrap = div({ class: "faq-top-nav-wrap" });
  const prevArrow = button(
    {
      class: "faq-tabs-top-nav-arrow faq-tabs-top-nav-arrow-prev",
      type: "button",
      "aria-label": "Scroll tabs left",
    },
    img({
      src: SIDEBAR_ARROW_ICON_SRC,
      alt: "",
      width: "20",
      height: "20",
    }),
  );
  const divider = span({ class: "faq-tabs-top-nav-divider" });
  const nextArrow = button(
    {
      class: "faq-tabs-top-nav-arrow faq-tabs-top-nav-arrow-next",
      type: "button",
      "aria-label": "Scroll tabs right",
    },
    img({
      src: SIDEBAR_ARROW_ICON_SRC,
      alt: "",
      width: "20",
      height: "20",
    }),
  );
  topTabNavWrap.append(prevArrow, topTabList, divider, nextArrow);

  const content = div({ class: "faq-main-content" });

  const subTabList = div({ class: "faq-sidebar" });

  const faqPanel = div({ class: "faq-accordions" });

  const faqList = div({ class: "faq-tabs-faq-list" });
  faqPanel.append(faqList);

  block.append(topTabNavWrap, content);

  function updateTopNavArrowState() {
    const atStart = topTabList.scrollLeft <= 2;
    const atEnd =
      topTabList.scrollLeft + topTabList.clientWidth >=
      topTabList.scrollWidth - 2;
    prevArrow.disabled = atStart;
    nextArrow.disabled = atEnd;
  }

  prevArrow.addEventListener("click", () => {
    topTabList.scrollBy({ left: -180, behavior: "smooth" });
  });

  nextArrow.addEventListener("click", () => {
    topTabList.scrollBy({ left: 180, behavior: "smooth" });
  });

  topTabList.addEventListener("scroll", updateTopNavArrowState);
  window.addEventListener("resize", updateTopNavArrowState);

  function getFaqData() {
    if (isAuthoringMode) {
      const liveRows = getItemScopedRows(
        [...block.children].filter(
          (row) => row !== uiContainer && row.children.length >= 1,
        ),
      );
      return buildData(liveRows);
    }

    return staticFaqData;
  }

  function renderTopTabs() {
    const faqData = getFaqData();

    if (!faqData.length) {
      topTabList.textContent = "";
      subTabList.textContent = "";
      faqList.textContent = "";
      updateTopNavArrowState();
      return;
    }

    if (activeTopTabIndex >= faqData.length) {
      activeTopTabIndex = 0;
    }

    const currentTopTab = faqData[activeTopTabIndex];
    if (activeSubTabIndex >= currentTopTab.subTabs.length) {
      activeSubTabIndex = 0;
    }

    topTabList.textContent = "";

    faqData.forEach((entry, index) => {
      const isActive = index === activeTopTabIndex;
      const topTabButton = button(
        {
          type: "button",
          class: `faq-tabs-top-tab${isActive ? " active" : ""}`,
          role: "tab",
          "aria-selected": String(isActive),
        },
        entry.topTab,
      );

      topTabButton.addEventListener("click", () => {
        activeTopTabIndex = index;
        activeSubTabIndex = 0;
        render();
      });

      topTabList.append(topTabButton);
    });

    requestAnimationFrame(updateTopNavArrowState);

    const latestTopTab = faqData[activeTopTabIndex];
    const latestSubTab = latestTopTab.subTabs[activeSubTabIndex];

    renderSubTabList(
      subTabList,
      latestTopTab,
      (subTabIndex) => {
        activeSubTabIndex = subTabIndex;
        render();
      },
      activeSubTabIndex,
    );
    renderFaqItems(faqList, latestSubTab);
  }

  function render() {
    renderTopTabs();
  }

  content.append(subTabList, faqPanel);

  if (isAuthoringMode) {
    block.classList.add("is-authoring");
    if (!block.contains(uiContainer)) {
      block.append(uiContainer);
    }

    const observer = new MutationObserver((mutations) => {
      const hasRowChange = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) => node !== uiContainer && node.nodeType === Node.ELEMENT_NODE,
        ),
      );

      if (hasRowChange) {
        render();
      }
    });

    observer.observe(block, { childList: true });
  } else {
    block.textContent = "";
    block.append(uiContainer);
  }

  render();
}
