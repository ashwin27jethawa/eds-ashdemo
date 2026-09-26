import { createTable } from '../../libs/table.js';
import {
  div,
  a,
  ul,
  li,
  span,
  domEl,
} from '../../scripts/dom-helpers.js';



function createFundTableView(funds) {
  const headers = [
    'NSE SYMBOL',
    'BSE CODE',
    'SCHEME NAME',
    'CURRENT iNAV',
    'PREVIOUS NAV',
    '% CHANGE',
    'INVEST NOW',
  ];

  const tableData = funds.map((fund) => [
    // Column 1: NSE Symbol
    div({ class: 'nse-symbol' }, fund.nseSymbol || '-'),

    // Column 2: BSE Code
    div({ class: 'bse-code' }, fund.bseCode || '-'),

    // Column 3: Scheme Name + Sub-category
    div(
      { class: 'scheme-info' },
      div({ class: 'scheme-name' }, fund.schemeName || 'N/A'),
      div({ class: 'scheme-category' }, fund.category || ''),
    ),

    // Column 4: Current iNAV
    div({ class: 'current-inav' }, fund.currentiNAV || '-'),

    // Column 5: Previous NAV
    div({ class: 'previous-nav' }, fund.previousNAV || '-'),

    // Column 6: % Change with Up/Down Arrow
    div(
      { class: 'percent-change' },
      `${fund.changePercent || '0%'} `,
      span({ class: `arrow ${fund.changeDirection === 'down' ? 'down' : 'up'}` }, '↑'),
    ),

    // Column 7: Invest Now Link
    a({ href: fund.investUrl || '#', class: 'invest-now-btn' }, 'Invest Now'),
  ]);

  return createTable(headers, tableData, 'fund-list-table');
}

function createFundCards(funds) {
  return div(
    { class: 'fund-card-grid' },
    ...funds.map((fund) => div(
      { class: 'fund-card-item' },
      div({ class: 'fund-card-header' },
        div({ class: 'scheme-name' }, fund.schemeName || 'N/A'),
        div({ class: 'scheme-category' }, fund.category || ''),
      ),
      div({ class: 'fund-card-body' },
        div({ class: 'meta-row' }, span({}, 'NSE Symbol:'), span({}, fund.nseSymbol || '-')),
        div({ class: 'meta-row' }, span({}, 'BSE Code:'), span({}, fund.bseCode || '-')),
        div({ class: 'meta-row' }, span({}, 'iNAV:'), span({}, fund.currentiNAV || '-')),
        div({ class: 'meta-row' },
          span({}, '% Change:'),
          span({ class: 'percent-change' }, `${fund.changePercent || '0%'} ↑`),
        ),
      ),
      div({ class: 'fund-card-footer' },
        a({ href: fund.investUrl || '#', class: 'button primary invest-now-btn' }, 'Invest Now'),
      ),
    )),
  );
}

export default async function decorate(block) {
  const children = [...block.children];

  const firstChild = children[0];
  const apiUrl = firstChild ? firstChild.textContent.trim() : '';

  const secondChild = children[1];
  let viewAllLink = '';
  let viewAllLabel = '';

  if (secondChild) {
    const anchor = secondChild.querySelector('a');
    viewAllLink = anchor ? anchor.getAttribute('href') : secondChild.textContent.trim();

    const thirdChild = children[2];
    viewAllLabel = thirdChild ? thirdChild.textContent.trim() : (anchor?.textContent.trim() || 'View All');
  }

  block.textContent = '';

  let funds = [];

  try {
    // if (apiUrl && apiUrl.startsWith('http')) {
    if (apiUrl) {
      // const response = await fetch(apiUrl);
      const response = await fetch(`${window.hlx.codeBasePath}/blocks/fund-list/${apiUrl}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      funds = Array.isArray(data) ? data : data.funds || data.data || [];
    } else {
      funds = MOCK_FUNDS;
    }

    const isCardView = block.classList.contains('card-view');
    const listContent = isCardView
      ? createFundCards(funds)
      : createFundTableView(funds);

    const container = div({ class: 'fund-list-container' }, listContent);
    block.append(container);

    if (secondChild && viewAllLink) {
      const actionContainer = ul(
        { class: 'fund-list-action' },
        li(
          { class: 'fund-action-item button-container' },
          domEl(
            'em',
            a(
              { href: viewAllLink, class: 'button primary' },
              viewAllLabel || 'View All',
            ),
          ),
        ),
      );

      block.append(actionContainer);
    }
  } catch (error) {
    block.append(div({ class: 'fund-list-error' }, 'Failed to load fund list.'));
    // eslint-disable-next-line no-console
    console.error('Fund List Error:', error);
  }
}
