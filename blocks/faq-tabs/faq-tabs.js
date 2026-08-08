
function getCellContent(row, index) {
	const cell = row.children[index];
	return cell ? cell.innerHTML.trim() : "";
}

function getCellText(row, index) {
	const cell = row.children[index];
	return cell ? cell.textContent.trim() : "";
}

function buildData(rows) {
	const topTabMap = new Map();

	rows.forEach((row) => {
		const topTab = getCellText(row, 0);
		const subTab = getCellText(row, 1);
		const question = getCellText(row, 2);
		const answer = getCellContent(row, 3);

		if (!topTab || !subTab || !question) {
			return;
		}

		if (!topTabMap.has(topTab)) {
			topTabMap.set(topTab, new Map());
		}

		const subTabMap = topTabMap.get(topTab);
		if (!subTabMap.has(subTab)) {
			subTabMap.set(subTab, []);
		}

		subTabMap.get(subTab).push({
			question,
			answer,
		});
	});

	return [...topTabMap.entries()].map(([topTab, subTabMap]) => ({
		topTab,
		subTabs: [...subTabMap.entries()].map(([name, items]) => ({
			name,
			items,
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

		button.append(label, count, chevron);
		button.addEventListener("click", () => onSelectSubTab(index));

		subTabListEl.append(button);
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

	function renderTopTabs() {
		const rows = [...block.children].filter((row) => row !== uiContainer && row.children.length >= 4);
		const faqData = buildData(rows);

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