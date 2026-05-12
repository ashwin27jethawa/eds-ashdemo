export default async function decorate(block) {
  if (window.location.origin.includes("author-p")) {
    return false;
  }

  const tableWrapper = document.createElement("div");
  tableWrapper.classList.add("table-scroll-container");

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  const headerRow = document.createElement("tr");
  const bodyRow1 = document.createElement("tr");
  const bodyRow2 = document.createElement("tr");

  [...block.children].forEach((child) => {
    [...child.children].forEach((col, i) => {
      const isHeader = i % 2 === 0;
      const cell1 = document.createElement(isHeader ? "th" : "td");
      const cell2 = document.createElement(isHeader ? "th" : "td");

      const pTag = col.querySelectorAll("p");
      //   console.log(pTag);

      if (pTag.length > 0) {
        // console.log(pTag);
        cell1.innerHTML = pTag[0].innerHTML;
        if (pTag[1]) {
          cell2.innerHTML = pTag[1].innerHTML;
        }
      }

      if (isHeader) {
        headerRow.appendChild(cell1);
      } else {
        // console.log(cell);

        bodyRow1.appendChild(cell1);
        bodyRow2.appendChild(cell2);
      }
    });
  });

  thead.appendChild(headerRow);
  tbody.appendChild(bodyRow1);
  tbody.appendChild(bodyRow2);
  table.append(thead, tbody);

  tableWrapper.append(table);

  block.innerHTML = "";
  block.append(tableWrapper);
}
