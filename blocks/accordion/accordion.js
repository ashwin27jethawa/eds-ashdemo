/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cols = [...row.children];

    if (cols.length < 2) return;

    const title = cols[0];
    const content = cols[1];

    const details = document.createElement("details");
    details.className = "accordion-item";

    const summary = document.createElement("summary");
    summary.className = "accordion-item-label";
    summary.innerHTML = title.innerHTML;

    content.classList.add("accordion-item-body");

    details.append(summary, content);

    row.replaceWith(details);
  });
}
