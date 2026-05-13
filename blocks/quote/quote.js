export default async function decorate(block) {
  const [quotation, attribution] = [...block.children].map((c) => c.firstElementChild);
  const blockquote = document.createElement('blockquote');

  // Decorate quotation
  if (quotation) {
    quotation.className = 'quote-quotation';
    // Match the "name" in your JSON models
    quotation.setAttribute('data-aue-prop', 'col_quotation');
    quotation.setAttribute('data-aue-type', 'text');
    blockquote.append(quotation);
  }

  // Decorate attribution
  if (attribution) {
    attribution.className = 'quote-attribution';
    // Match the "name" in your JSON models
    attribution.setAttribute('data-aue-prop', 'col_attribution');
    attribution.setAttribute('data-aue-type', 'text');
    
    blockquote.append(attribution);
    
    const ems = attribution.querySelectorAll('em');
    ems.forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
  }

  block.innerHTML = '';
  block.append(blockquote);
}