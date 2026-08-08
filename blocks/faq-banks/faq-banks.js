import { button, div, h3, img, p, span } from '../../../scripts/dom-helper.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const MAX_VISIBLE_FAQS = 5;
const PLUS_ICON_SRC = '/icons/plus-icon.svg';
const MINUS_ICON_SRC = '/icons/minus-icon.svg';
const VIEW_ALL_ICON_SRC = '/icons/right-arrow-red.svg';
const SIDEBAR_ARROW_ICON_SRC = '/icons/tab-arrow-left.svg';
const SIDEBAR_ARROW_ACTIVE_ICON_SRC = '/icons/right-arrow-red.svg';

function cloneNodes(element) {
  const nodes = Array.from(element.childNodes).map(node =>
    node.cloneNode(true),
  );
  return nodes.length
    ? nodes
    : [document.createTextNode(element.textContent.trim())];
}

function textOrFallback(value, fallback) {
  const normalized = (value || '').trim();
  return normalized || fallback;
}

function formatViewAllLabel(subType) {
  const normalized = (subType || '').trim();
  if (!normalized) return 'FAQs';
  const singular = normalized.endsWith('s')
    ? normalized.slice(0, -1)
    : normalized;
  return `${singular} FAQs`;
}

export default function decorate(block) {
  const isAuthoring = window.location.hostname.includes('author-p');
  const isLocalHost = ['localhost'].includes(window.location.hostname);
  const isAuthoringOrLocal = isAuthoring || isLocalHost;
  let topNav = null;

  const rows = Array.from(block.children);
  const faqData = [];

  rows.forEach(row => {
    const cols = Array.from(row.children);
    let type = '';
    let subType = '';
    let heading = '';
    let bodyNodes = [];
    let bodySource = null;

    if (cols.length === 4) {
      const [typeCol, subTypeCol, headingCol, bodyCol] = cols;
      type = typeCol.textContent.trim();
      subType = subTypeCol.textContent.trim();
      heading = headingCol.textContent.trim();
      bodyNodes = cloneNodes(bodyCol);
      bodySource = bodyCol;
    } else if (cols.length >= 2) {
      const [contentCol, bodyCol] = cols;
      const elements = Array.from(contentCol.children);

      if (elements.length >= 3) {
        [type, subType, heading] = elements
          .slice(0, 3)
          .map(element => element.textContent.trim());
      } else {
        const rawText = contentCol.textContent
          .split('\n')
          .map(t => t.trim())
          .filter(t => t.length > 0);
        [type, subType, heading] = rawText;
      }
      bodyNodes = cloneNodes(bodyCol);
      bodySource = bodyCol;
    } else {
      return;
    }

    const normalizedType = textOrFallback(type, 'General');
    const hasAuthoredType = !!type;
    const hasAuthoredSubType = !!subType;
    const hasAuthoredHeading = !!heading;
    const hasAuthoredBody = !!bodySource?.textContent.trim();

    faqData.push({
      type: normalizedType,
      subType: textOrFallback(subType, 'General'),
      heading: textOrFallback(heading, 'New FAQ'),
      bodyNodes,
      rowSource: row,
      bodySource,
      hasAuthoredType,
      hasAuthoredSubType,
      hasAuthoredHeading,
      hasAuthoredBody,
    });
  });

  if (faqData.length === 0) {
    block.replaceChildren(
      p('No FAQ data found or block structure is incorrect.'),
    );
    return;
  }

  block.innerHTML = '';

  const faqDataForRender = isAuthoringOrLocal
    ? faqData.filter(item => {
        const isFullyEmpty =
          !item.hasAuthoredType &&
          !item.hasAuthoredSubType &&
          !item.hasAuthoredHeading &&
          !item.hasAuthoredBody;
        const hasFaqContent = item.hasAuthoredHeading || item.hasAuthoredBody;

        // Avoid creating tabs/items from rows where only tab/subtype is filled.
        // Keep fully empty placeholder rows so authoring still has one template row.
        return hasFaqContent || isFullyEmpty;
      })
    : faqData;

  const groupedData = {};
  const groupMeta = {};
  faqDataForRender.forEach(item => {
    if (!groupedData[item.type]) groupedData[item.type] = {};
    if (!groupedData[item.type][item.subType])
      groupedData[item.type][item.subType] = [];
    groupedData[item.type][item.subType].push(item);

    if (!groupMeta[item.type]) {
      groupMeta[item.type] = {
        hasAuthoredType: false,
      };
    }
    groupMeta[item.type].hasAuthoredType =
      groupMeta[item.type].hasAuthoredType || item.hasAuthoredType;
  });

  if (isAuthoringOrLocal && groupedData.General) {
    Object.keys(groupedData.General).forEach(subType => {
      let emptyPlaceholderSeen = false;

      groupedData.General[subType] = groupedData.General[subType].filter(
        item => {
          const isEmptyPlaceholder =
            !item.hasAuthoredType &&
            !item.hasAuthoredSubType &&
            !item.hasAuthoredHeading &&
            !item.hasAuthoredBody;

          if (!isEmptyPlaceholder) return true;
          if (emptyPlaceholderSeen) return false;

          emptyPlaceholderSeen = true;
          return true;
        },
      );
    });
  }

  topNav = document.createElement('div');
  topNav.className = 'faq-top-nav';
  let tabNames = Object.keys(groupedData).filter(tabName => {
    if (isAuthoringOrLocal) return true;
    if (tabName !== 'General') return true;
    return groupMeta[tabName]?.hasAuthoredType;
  });

  if (isAuthoringOrLocal && tabNames.includes('General')) {
    tabNames = [
      'General',
      ...tabNames.filter(tabName => tabName !== 'General'),
    ];
  }

  const topNavWrap = div({ class: 'faq-top-nav-wrap' });
  const prevArrow = button(
    {
      class: 'faq-top-nav-arrow faq-top-nav-arrow-prev',
      type: 'button',
      'aria-label': 'Scroll tabs left',
    },
    img({
      src: '/icons/tab-arrow-left.svg',
      alt: '',
      width: '24',
      height: '24',
    }),
  );
  const divider = span({ class: 'faq-top-nav-divider' });
  const nextArrow = button(
    {
      class: 'faq-top-nav-arrow faq-top-nav-arrow-next',
      type: 'button',
      'aria-label': 'Scroll tabs right',
    },
    img({
      src: '/icons/tab-arrow-left.svg',
      alt: '',
      width: '24',
      height: '24',
    }),
  );

  topNavWrap.append(prevArrow, topNav, divider, nextArrow);

  const mainContent = document.createElement('div');
  mainContent.className = 'faq-main-content';
  block.appendChild(topNavWrap);
  block.appendChild(mainContent);

  function renderSidebarAndContent(tabData) {
    mainContent.replaceChildren();

    const sidebar = document.createElement('div');
    sidebar.className = 'faq-sidebar';
    const subTypes = Object.keys(tabData);

    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'faq-accordions';

    subTypes.forEach((subType, index) => {
      const sidebarItem = button(
        {
          class: `faq-sidebar-btn ${index === 0 ? 'active' : ''}`,
          type: 'button',
        },
        div(
          { class: 'faq-sidebar-content' },
          span({ class: 'faq-sidebar-title' }, subType),
          span(
            { class: 'faq-sidebar-count' },
            `${tabData[subType].length} Questions`,
          ),
        ),
        img({
          class: 'faq-sidebar-arrow',
          src:
            index === 0
              ? SIDEBAR_ARROW_ACTIVE_ICON_SRC
              : SIDEBAR_ARROW_ICON_SRC,
          alt: '',
          width: '14',
          height: '14',
          'aria-hidden': 'true',
        }),
      );

      const accordionGroup = document.createElement('div');
      accordionGroup.className = `faq-accordion-group ${index === 0 ? 'active' : 'hidden'}`;

      tabData[subType].forEach((faq, faqIndex) => {
        const isFirstItem = faqIndex === 0;
        const isOverflowItem = faqIndex >= MAX_VISIBLE_FAQS;

        const body = div({
          class: `faq-accordion-body ${isFirstItem ? '' : 'hidden'}`.trim(),
        });
        moveInstrumentation(faq.bodySource, body);
        faq.bodyNodes.forEach(node => {
          body.append(node.cloneNode(true));
        });

        const header = button(
          { class: 'faq-accordion-header', type: 'button' },
          h3(faq.heading),
          img({
            class: 'faq-icon',
            src: isFirstItem ? MINUS_ICON_SRC : PLUS_ICON_SRC,
            alt: '',
            width: '20',
            height: '20',
            'aria-hidden': 'true',
          }),
        );

        const accItem = div(
          {
            class:
              `faq-accordion-item ${isOverflowItem ? 'faq-overflow-item hidden' : ''}`.trim(),
          },
          header,
          body,
        );
        moveInstrumentation(faq.rowSource, accItem);

        header.addEventListener('click', () => {
          const icon = accItem.querySelector('.faq-icon');
          const isOpen = !body.classList.contains('hidden');

          accordionGroup
            .querySelectorAll('.faq-accordion-body')
            .forEach(accordionBody => accordionBody.classList.add('hidden'));
          accordionGroup.querySelectorAll('.faq-icon').forEach(iconEl => {
            iconEl.setAttribute('src', PLUS_ICON_SRC);
          });

          if (!isOpen) {
            body.classList.remove('hidden');
            icon.setAttribute('src', MINUS_ICON_SRC);
          }
        });
        accordionGroup.appendChild(accItem);
      });

      if (tabData[subType].length > MAX_VISIBLE_FAQS) {
        const viewAllWrap = div({ class: 'faq-view-all-wrap' });
        const defaultViewAllLabel = `View All ${formatViewAllLabel(subType)}`;
        const viewAllLabel = span(
          { class: 'faq-view-all-label' },
          defaultViewAllLabel,
        );
        const viewAllIcon = img({
          class: 'faq-view-all-icon',
          src: VIEW_ALL_ICON_SRC,
          alt: '',
          width: '14',
          height: '14',
          'aria-hidden': 'true',
        });
        const viewAllBtn = button(
          { class: 'faq-view-all-btn', type: 'button' },
          viewAllLabel,
          viewAllIcon,
        );
        let isExpanded = false;
        viewAllBtn.setAttribute('aria-expanded', 'false');

        viewAllBtn.addEventListener('click', () => {
          isExpanded = !isExpanded;

          accordionGroup
            .querySelectorAll('.faq-overflow-item')
            .forEach(item => {
              item.classList.toggle('hidden', !isExpanded);

              if (!isExpanded) {
                item
                  .querySelectorAll('.faq-accordion-body')
                  .forEach(accordionBody =>
                    accordionBody.classList.add('hidden'),
                  );
                item.querySelectorAll('.faq-icon').forEach(iconEl => {
                  iconEl.setAttribute('src', PLUS_ICON_SRC);
                });
              }
            });

          viewAllLabel.textContent = isExpanded
            ? 'View Less'
            : defaultViewAllLabel;
          viewAllBtn.setAttribute('aria-expanded', String(isExpanded));
        });

        viewAllWrap.appendChild(viewAllBtn);
        accordionGroup.appendChild(viewAllWrap);
      }

      accordionContainer.appendChild(accordionGroup);

      sidebarItem.addEventListener('click', () => {
        sidebar
          .querySelectorAll('.faq-sidebar-btn')
          .forEach(btn => btn.classList.remove('active'));
        sidebar.querySelectorAll('.faq-sidebar-arrow').forEach(arrow => {
          arrow.setAttribute('src', SIDEBAR_ARROW_ICON_SRC);
        });
        sidebarItem.classList.add('active');
        const activeArrow = sidebarItem.querySelector('.faq-sidebar-arrow');
        if (activeArrow) {
          activeArrow.setAttribute('src', SIDEBAR_ARROW_ACTIVE_ICON_SRC);
        }

        accordionContainer
          .querySelectorAll('.faq-accordion-group')
          .forEach(group => {
            group.classList.add('hidden');
            group.classList.remove('active');
          });
        accordionGroup.classList.remove('hidden');
        accordionGroup.classList.add('active');
      });

      sidebar.appendChild(sidebarItem);
    });

    mainContent.appendChild(sidebar);
    mainContent.appendChild(accordionContainer);
  }

  tabNames.forEach((tabName, index) => {
    const tabBtn = document.createElement('button');
    tabBtn.className = `faq-tab-btn ${index === 0 ? 'active' : ''}`;
    tabBtn.textContent = tabName;

    tabBtn.addEventListener('click', () => {
      block
        .querySelectorAll('.faq-tab-btn')
        .forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');
      tabBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      renderSidebarAndContent(groupedData[tabName]);
    });

    topNav.appendChild(tabBtn);
  });
  if (tabNames.length > 0) {
    renderSidebarAndContent(groupedData[tabNames[0]]);
  } else if (isAuthoringOrLocal) {
    block.replaceChildren(p('No tabs available for this FAQ configuration.'));
  }

  const updateArrowState = () => {
    const atStart = topNav.scrollLeft <= 2;
    const atEnd =
      topNav.scrollLeft + topNav.clientWidth >= topNav.scrollWidth - 2;
    prevArrow.disabled = atStart;
    nextArrow.disabled = atEnd;
  };

  prevArrow.addEventListener('click', () => {
    topNav.scrollBy({ left: -180, behavior: 'smooth' });
  });

  nextArrow.addEventListener('click', () => {
    topNav.scrollBy({ left: 180, behavior: 'smooth' });
  });

  topNav.addEventListener('scroll', updateArrowState);
  window.addEventListener('resize', updateArrowState);
  requestAnimationFrame(updateArrowState);
}
