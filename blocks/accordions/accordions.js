/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const details = document.createElement("details");
    details.className = "accordion-item";

    if (row.dataset.aueResource) {
      details.setAttribute("data-aue-resource", row.dataset.aueResource);
      details.setAttribute("data-aue-type", "component");
      details.setAttribute("data-aue-label", "Accordion Item");
    }

    const label = row.children[0];
    const summary = document.createElement("summary");
    summary.className = "accordion-item-label";
    summary.setAttribute("data-aue-prop", "title");
    summary.setAttribute("data-aue-type", "text");
    summary.append(...label.childNodes);

    const body = row.children[1];
    body.className = "accordion-item-body";
    body.setAttribute("data-aue-prop", "content");
    body.setAttribute("data-aue-type", "richtext");

    details.append(summary, body);
    row.replaceWith(details);
  });
}
