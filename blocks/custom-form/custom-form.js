export default function decorate(block) {
  block.innerHTML = `
    <div class="form-card">

      <h2>Contact Form</h2>

      <form id="contact-form">

        <input type="hidden" name="editIndex">

        <div class="grid">
          <input type="text" name="firstName" placeholder="First Name" required>

          <input type="text" name="lastName" placeholder="Last Name" required>
        </div>

        <input type="email" name="email" placeholder="Email" required>

        <input type="text" name="username" placeholder="Username" required>

        <input type="tel" name="phone" placeholder="Phone Number" required>

        <input type="number" name="age" placeholder="Age">

        <button type="submit" id="submit-btn">
          Save Contact
        </button>
      </form>

      <div class="top">
        <h3>Saved Contacts</h3>

        <button id="clear-btn">
          Clear All
        </button>
      </div>

      <div id="contact-list"></div>

    </div>
  `;

  const form = block.querySelector('#contact-form');
  const list = block.querySelector('#contact-list');
  const clearBtn = block.querySelector('#clear-btn');
  const submitBtn = block.querySelector('#submit-btn');


  function getContacts() {
    return JSON.parse(localStorage.getItem("contacts")) || [];
  }

  function saveContacts(data) {
    localStorage.setItem("contacts", JSON.stringify(data));
  }

  function renderContacts() {
    const contacts = getContacts();

    if (!contacts.length) {
      list.innerHTML = `
        <p class="empty">No contacts found</p>
      `;
      return;
    }

    list.innerHTML = contacts.map((item, index) => `
      <div class="item">

        <div class="info">
          <strong>
            ${item.firstName} ${item.lastName}
          </strong>

          <p>Email: ${item.email}</p>

          <p>Username: ${item.username}</p>

          <p>Phone: ${item.phone}</p>

          <small>Age: ${item.age || 'N/A'}</small>
        </div>

        <div class="actions">

          <button class="edit-btn" data-index="${index}">
            Edit
          </button>

          <button class="delete-btn" data-index="${index}">
            Delete
          </button>

        </div>

      </div>
    `).join('');
  }

  // form
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    const contacts = getContacts();

    const contact = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      phone: data.phone,
      age: data.age,
    };

    // edit
    if (data.editIndex !== '') {
      contacts[data.editIndex] = contact;
    } else {
      contacts.push(contact);
    }

    saveContacts(contacts);

    form.reset();

    form.editIndex.value = '';

    submitBtn.textContent = 'Save Contact';

    renderContacts();
  });


  list.addEventListener('click', (e) => {
    const contacts = getContacts();

    // delete
    if (e.target.classList.contains('delete-btn')) {
      const index = e.target.dataset.index;

      contacts.splice(index, 1);

      saveContacts(contacts);

      renderContacts();
    }

    // edit
    if (e.target.classList.contains('edit-btn')) {
      const index = e.target.dataset.index;

      const item = contacts[index];

      form.firstName.value = item.firstName;
      form.lastName.value = item.lastName;
      form.email.value = item.email;
      form.username.value = item.username;
      form.phone.value = item.phone;
      form.age.value = item.age;

      form.editIndex.value = index;

      submitBtn.textContent = 'Update Contact';
    }
  });

  // delete All
  clearBtn.addEventListener('click', () => {
    localStorage.removeItem("contacts");

    renderContacts();
  });

  renderContacts();
}