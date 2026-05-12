export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    // 1. Keep the 'data-aue' attributes from the original row
    const details = document.createElement("details");
    details.className = "accordion-item";
    
    // Copy instrumentation so you can still click to edit in UE
    if (row.dataset.aueResource) {
      details.setAttribute('data-aue-resource', row.dataset.aueResource);
      details.setAttribute('data-aue-type', 'component');
      details.setAttribute('data-aue-label', 'Accordion Item');
    }

    const cols = [...row.children];
    if (cols.length < 2) return;

    const titleCol = cols[0];
    const contentCol = cols[1];

    // 2. Build Summary
    const summary = document.createElement("summary");
    summary.className = "accordion-item-label";
    // Mark the title for inline editing
    summary.setAttribute('data-aue-prop', 'title');
    summary.setAttribute('data-aue-type', 'text');
    summary.innerHTML = titleCol.innerHTML;

    // 3. Build Body
    const body = document.createElement("div");
    body.className = "accordion-item-body";
    // Mark the content for inline editing
    body.setAttribute('data-aue-prop', 'content');
    body.setAttribute('data-aue-type', 'richtext');
    body.innerHTML = contentCol.innerHTML;

    details.append(summary, body);
    row.replaceWith(details);
  });
}