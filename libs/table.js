import { table, thead, tbody, tr, th, td, div } from '../scripts/dom-helpers.js';

const createTableHeader = headers =>
  thead(tr(...headers.map(header => th({}, header))));

const createTableBody = data =>
  tbody(...data.map(row => tr(...row.map(value => td({}, value)))));

export const createTable = (headers, data, className = '') =>
  div(
    {
      class: 'data-table-wrapper',
    },
    table(
      {
        class: `data-table ${className}`.trim(),
      },
      createTableHeader(headers),
      createTableBody(data),
    ),
  );
