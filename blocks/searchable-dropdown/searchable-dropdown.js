export default function decorate(block) {
  // 1. Collect options from the authored table rows
  const options = [...block.children].map((row) => row.textContent.trim()).filter(Boolean);
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.classList.add('dropdown-wrapper');

  // Input Container to hold text input + chevron arrow icon
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('dropdown-input-container');

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Select...';
  searchInput.classList.add('dropdown-search');

  // Chevron/Arrow indicator on the right side
  const arrow = document.createElement('div');
  arrow.classList.add('dropdown-arrow');
  arrow.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  inputContainer.appendChild(searchInput);
  inputContainer.appendChild(arrow);

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'selected-scheme';

  const list = document.createElement('ul');
  list.classList.add('dropdown-list');

  options.forEach((optionText) => {
    const li = document.createElement('li');
    li.classList.add('dropdown-item');
    li.textContent = optionText;
    
    li.addEventListener('click', () => {
      searchInput.value = optionText;
      hiddenInput.value = optionText;
      wrapper.classList.remove('is-open');
      
      // Remove previous active highlights and highlight this one
      list.querySelectorAll('.dropdown-item').forEach((item) => item.classList.remove('is-selected'));
      li.classList.add('is-selected');
    });

    list.appendChild(li);
  });

  // Filtering Logic
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    wrapper.classList.add('is-open');

    const items = list.querySelectorAll('.dropdown-item');
    items.forEach((item) => {
      const match = item.textContent.toLowerCase().includes(query);
      item.style.display = match ? 'block' : 'none';
    });
  });

  // Toggle display handlers
  searchInput.addEventListener('focus', () => wrapper.classList.add('is-open'));
  arrow.addEventListener('click', () => {
    wrapper.classList.toggle('is-open');
    if (wrapper.classList.contains('is-open')) searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) wrapper.classList.remove('is-open');
  });

  wrapper.appendChild(inputContainer);
  wrapper.appendChild(hiddenInput);
  wrapper.appendChild(list);
  block.appendChild(wrapper);
}