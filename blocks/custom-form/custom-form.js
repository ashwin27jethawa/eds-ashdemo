export default function decorate(block) {
  block.innerHTML = `
    <div class="form-card">

      <h2>Contact Form</h2>

      <form id="contact-form">

        <input type="hidden" name="editIndex">

        <div class="grid">

          <div class="field">
            <input type="text" name="firstName" placeholder="First Name">
            <small class="error"></small>
          </div>

          <div class="field">
            <input type="text" name="lastName" placeholder="Last Name">
            <small class="error"></small>
          </div>

        </div>

        <div class="field">
          <input type="email" name="email" placeholder="Email">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="text" name="username" placeholder="Username">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="tel" name="phone" placeholder="Phone Number" maxLength="10">
          <small class="error"></small>
        </div>

        <div class="field">
          <input type="number" name="age" placeholder="Age">
          <small class="error"></small>
        </div>

        <button type="submit" id="submit-btn" disabled>
          Save
        </button>

      </form>

      <div class="top">
        <h3>Saved</h3>

        <button id="clear-btn">
          Clear All
        </button>
      </div>

      <div id="contact-list"></div>

    </div>
  `;

  const form = block.querySelector("#contact-form");
  const list = block.querySelector("#contact-list");
  const clearBtn = block.querySelector("#clear-btn");
  const submitBtn = block.querySelector("#submit-btn");

  // regex patterns
  const nameRegex = /^[A-Za-z]+$/;
  const usernameRegex = /^\w+$/;
  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // local storage
  function getContacts() {
    return JSON.parse(localStorage.getItem("contacts")) || [];
  }

  function saveContacts(data) {
    localStorage.setItem("contacts", JSON.stringify(data));
  }

  // show error
  function showError(input, message) {
    const field = input.parentElement;
    const error = field.querySelector(".error");

    error.textContent = message;
    input.classList.add("invalid");
  }

  // clear error
  function clearError(input) {
    const field = input.parentElement;
    const error = field.querySelector(".error");

    error.textContent = "";
    input.classList.remove("invalid");
  }

  // validate single input
  function validateInput(input) {
    const value = input.value.trim();

    // first name + last name
    if (input.name === "firstName" || input.name === "lastName") {
      if (!value) {
        showError(input, "This field is required");
        return false;
      }

      if (!nameRegex.test(value)) {
        showError(input, "Only letters allowed");
        return false;
      }

      clearError(input);
      return true;
    }

    // email
    if (input.name === "email") {
      if (!value) {
        showError(input, "Email is required");
        return false;
      }

      if (!emailRegex.test(value)) {
        showError(input, "Enter valid email");
        return false;
      }

      clearError(input);
      return true;
    }

    // username
    if (input.name === "username") {
      if (!value) {
        showError(input, "Username is required");
        return false;
      }

      if (!usernameRegex.test(value)) {
        showError(input, "Only letters, numbers and underscores allowed");
        return false;
      }

      clearError(input);
      return true;
    }

    // phone
    if (input.name === "phone") {
      if (!value) {
        showError(input, "Phone number is required");
        return false;
      }

      // number start with 6-9
      if (!phoneRegex.test(value)) {
        if (!/^[6-9]/.test(value)) {
          showError(input, "Phone number must start with 6, 7, 8, or 9");
        } else {
          showError(input, "Phone number must be 10 digits");
        }

        return false;
      }

      //  same digits in a row
      const repeatedDigitsRegex = /(\d)\1{3,}/;

      if (repeatedDigitsRegex.test(value)) {
        showError(input, "More than 3 same digits in a row are not allowed");
        return false;
      }

      clearError(input);
      return true;
    }

    // age
    if (input.name === "age") {
      if (!value) {
        showError(input, "Age is required");
        return false;
      }

      if (Number(value) < 1 || Number(value) > 100) {
        showError(input, "Enter valid age (1-100)");
        return false;
      }

      clearError(input);
      return true;
    }

    return true;
  }

  // validate full form
  function validateForm() {
    const inputs = form.querySelectorAll("input");
    let formValid = true;

    inputs.forEach((input) => {
      if (input.name !== "editIndex") {
        const valid = validateInput(input);

        if (!valid) {
          formValid = false;
        }
      }
    });

    submitBtn.disabled = !formValid;

    return formValid;
  }

  // live validation
  form.addEventListener("input", () => {
    validateForm();
  });

  // render contacts
  function renderContacts() {
    const contacts = getContacts();

    if (!contacts.length) {
      list.innerHTML = `
        <p class="empty">No contacts found</p>
      `;
      return;
    }

    list.innerHTML = contacts
      .map(
        (item, index) => `
        <div class="item">

          <div class="info">
            <strong>
              ${item.firstName} ${item.lastName}
            </strong>

            <p>Email: ${item.email}</p>

            <p>Username: ${item.username}</p>

            <p>Phone: ${item.phone}</p>

            <small>Age: ${item.age}</small>
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
      `,
      )
      .join("");
  }

  // submit form
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // validate before submit
    if (!validateForm()) return;

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
    if (data.editIndex !== "") {
      contacts[data.editIndex] = contact;
    } else {
      contacts.push(contact);
    }

    saveContacts(contacts);

    form.reset();
    form.editIndex.value = "";

    submitBtn.textContent = "Save";
    submitBtn.disabled = true;

    renderContacts();
  });

  // edit + delete
  list.addEventListener("click", (e) => {
    const contacts = getContacts();

    // delete
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;

      contacts.splice(index, 1);

      saveContacts(contacts);

      renderContacts();
    }

    // edit
    if (e.target.classList.contains("edit-btn")) {
      const index = e.target.dataset.index;

      const item = contacts[index];

      form.firstName.value = item.firstName;
      form.lastName.value = item.lastName;
      form.email.value = item.email;
      form.username.value = item.username;
      form.phone.value = item.phone;
      form.age.value = item.age;

      form.editIndex.value = index;

      submitBtn.textContent = "Update";

      validateForm();
    }
  });

  // clear all
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("contacts");

    renderContacts();
  });

  // initial state
  submitBtn.disabled = true;

  renderContacts();
}
