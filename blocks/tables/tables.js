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
  const bodyRows = [];

  [...block.children].forEach((child) => {
    [...child.children].forEach((col, i) => {
      const isHeader = i % 2 === 0;
      const pTags = col.querySelectorAll("p");

      if (isHeader) {
        const th = document.createElement("th");
        th.innerHTML = pTags[0]?.innerHTML || "";
        headerRow.appendChild(th);
      } else {
        pTags.forEach((p, rowIndex) => {
          if (!bodyRows[rowIndex]) {
            bodyRows[rowIndex] = document.createElement("tr");
          }
          const td = document.createElement("td");
          td.innerHTML = p.innerHTML;
          bodyRows[rowIndex].appendChild(td);
        });
      }
    });
  });

  thead.appendChild(headerRow);
  bodyRows.forEach((row) => tbody.appendChild(row));

  table.append(thead, tbody);
  tableWrapper.append(table);

  block.textContent = ""; // Cleaner than innerHTML = ""
  block.append(tableWrapper);
}
