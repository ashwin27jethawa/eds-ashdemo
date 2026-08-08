
import { decorateIcons } from "../../scripts/aem.js";

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

	const classWithIcon = [...iconSpan.classList].find((className) => className.startsWith("icon-"));
	return classWithIcon ? normalizeIconName(classWithIcon.replace("icon-", "")) : "";
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

function buildData(rows) {
	const topTabMap = new Map();

	rows.forEach((row) => {
		const topTab = getCellText(row, 0);
		const parsedSubTab = extractIconAndSubTab(getCellText(row, 1));
		const subTab = parsedSubTab.subTab;
		const hasIconNameColumn = row.children.length >= 5;
		let iconName = hasIconNameColumn ? normalizeIconName(getCellText(row, 2)) : "";
		const iconFromSubTabCell = getIconNameFromCell(row, 1);
		const iconFromIconColumn = hasIconNameColumn ? getIconNameFromCell(row, 2) : "";

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

		// Fallback for older/mixed row structures where icon column is not emitted.
		if (hasIconNameColumn && !question && !answer) {
			question = getCellText(row, 2);
			answer = getCellContent(row, 3);
		}

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

function renderSubTabList(subTabListEl, topTabData, onSelectSubTab, activeSubTabIndex) {
	subTabListEl.textContent = "";

	topTabData.subTabs.forEach((subTab, index) => {
		const button = document.createElement("button");
		button.className = "faq-tabs-subtab";
		if (index === activeSubTabIndex) {
			button.classList.add("is-active");
		}
		button.type = "button";

		const icon = document.createElement("span");
		icon.className = "faq-tabs-subtab-icon";
		icon.setAttribute("aria-hidden", "true");
		if (subTab.iconName) {
			const iconToken = document.createElement("span");
			iconToken.className = `icon icon-${subTab.iconName}`;
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
		count.textContent = `${subTab.items.length} Questions`;

		const chevron = document.createElement("span");
		chevron.className = "faq-tabs-subtab-chevron";
		chevron.setAttribute("aria-hidden", "true");
		chevron.textContent = ">";

		text.append(label, count);
		button.append(icon, text, chevron);
		button.addEventListener("click", () => onSelectSubTab(index));

		subTabListEl.append(button);
	});

	decorateIcons(subTabListEl);
	subTabListEl.querySelectorAll(".faq-tabs-subtab-icon .icon img").forEach((img) => {
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

		details.append(summary, answer);
		faqListEl.append(details);
	});
}

export default function decorate(block) {
	const isAuthorHost = window.location.hostname.includes("author-");
	const isWcmDisabled = new URLSearchParams(window.location.search).get("wcmmode") === "disabled";
	const isAuthoringMode = isAuthorHost && !isWcmDisabled;
	const initialRows = [...block.children].filter((row) => row.children.length >= 4);
	const staticFaqData = buildData(initialRows);

	let activeTopTabIndex = 0;
	let activeSubTabIndex = 0;

	const topTabList = document.createElement("div");
	topTabList.className = "faq-tabs-top-list";
	topTabList.setAttribute("role", "tablist");

	const content = document.createElement("div");
	content.className = "faq-tabs-content";

	const subTabList = document.createElement("aside");
	subTabList.className = "faq-tabs-sub-list";

	const faqPanel = document.createElement("section");
	faqPanel.className = "faq-tabs-faq-panel";

	const faqList = document.createElement("div");
	faqList.className = "faq-tabs-faq-list";
	faqPanel.append(faqList);

	const uiContainer = document.createElement("div");
	uiContainer.className = "faq-tabs-rendered-ui";
	uiContainer.append(topTabList, content);

	function getFaqData() {
		if (isAuthoringMode) {
			const liveRows = [...block.children].filter((row) => row !== uiContainer && row.children.length >= 4);
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
			const button = document.createElement("button");
			button.type = "button";
			button.className = "faq-tabs-top-tab";
			button.setAttribute("role", "tab");
			button.setAttribute("aria-selected", index === activeTopTabIndex);
			button.textContent = entry.topTab;

			button.addEventListener("click", () => {
				activeTopTabIndex = index;
				activeSubTabIndex = 0;
				render();
			});

			topTabList.append(button);
		});

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